"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Submission, SubmissionFile } from "@/types/submission";

// Helper to sanitize filename for storage
function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9_.-]/g, "_");
}

// Helper to generate file name with naming convention
function generateMarkedFileName(
  submissionTitle: string,
  originalFileName: string,
  index: number,
  totalFiles: number
): string {
  const fileExt = originalFileName.split(".").pop() || "docx";
  const sanitizedTitle = sanitizeFilename(submissionTitle);
  
  // If only one file, don't add number suffix
  if (totalFiles === 1) {
    return `${sanitizedTitle}_marked.${fileExt}`;
  }
  
  // Multiple files: add number suffix
  return `${sanitizedTitle}_marked_${index + 1}.${fileExt}`;
}

// Get marker statistics for dashboard
export async function getMarkerStats() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { assignedReviews: 0, completedReviews: 0 };
  }

  const { data, error } = await supabase
    .from("submissions")
    .select("status")
    .eq("marker_id", user.id);

  if (error || !data) {
    return { assignedReviews: 0, completedReviews: 0 };
  }

  const assignedReviews = data.filter((s) => s.status === "under_review").length;
  const completedReviews = data.filter((s) => s.status === "reviewed").length;

  return { assignedReviews, completedReviews };
}

// Get submissions assigned to current marker (for "My Assigned Reviews")
export async function getMyAssignedReviews(): Promise<Submission[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("submissions")
    .select("*")
    .eq("marker_id", user.id)
    .in("status", ["under_review", "reviewed"])
    .order("created_at", { ascending: false });

  if (error) {
    return [];
  }

  return data as Submission[];
}

// Get recent submissions assigned to current marker (for dashboard, limit 5)
export async function getRecentAssignedReviews(): Promise<Submission[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("submissions")
    .select("*")
    .eq("marker_id", user.id)
    .in("status", ["under_review", "reviewed"])
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) {
    return [];
  }

  return data as Submission[];
}

// Get pending submissions available for review (for "Submissions to Review")
export async function getPendingSubmissions(): Promise<Submission[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  // Get pending submissions that are not assigned to any marker
  // and don't belong to the current user (markers shouldn't review their own work)
  const { data, error } = await supabase
    .from("submissions")
    .select("*")
    .eq("status", "pending")
    .is("marker_id", null)
    .neq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return [];
  }

  return data as Submission[];
}

// Accept/claim a submission for review
export async function acceptReview(submissionId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // First check if submission is still pending and not assigned
  const { data: submission, error: fetchError } = await supabase
    .from("submissions")
    .select("*")
    .eq("id", submissionId)
    .eq("status", "pending")
    .is("marker_id", null)
    .single();

  if (fetchError || !submission) {
    return { error: "Submission is no longer available for review" };
  }

  // Verify marker is not reviewing their own submission
  if (submission.user_id === user.id) {
    return { error: "You cannot review your own submission" };
  }

  // Assign the submission to the marker
  const { error: updateError } = await supabase
    .from("submissions")
    .update({
      marker_id: user.id,
      status: "under_review",
      updated_at: new Date().toISOString(),
    })
    .eq("id", submissionId)
    .eq("status", "pending"); // Double-check status to prevent race conditions

  if (updateError) {
    return { error: "Failed to accept review. Please try again." };
  }

  revalidatePath("/marker/dashboard");
  revalidatePath("/marker/reviews");
  revalidatePath("/marker/queue");
  
  return { success: true };
}

// Get a single submission for marker review (only if assigned to current marker or pending)
export async function getSubmissionForReview(id: string): Promise<Submission | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("submissions")
    .select("*")
    .eq("id", id)
    .eq("marker_id", user.id)
    .single();

  if (error) {
    return null;
  }

  return data as Submission;
}

// Submit a review (with marked files and feedback)
export async function submitReview(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const submissionId = formData.get("submissionId") as string;
  const markerNotes = formData.get("markerNotes") as string | null;
  const isDraft = formData.get("isDraft") === "true";
  const fileCount = parseInt(formData.get("markedFileCount") as string) || 0;

  if (!submissionId) {
    return { error: "Missing submission ID" };
  }

  // Verify the submission is assigned to this marker
  const { data: submission, error: fetchError } = await supabase
    .from("submissions")
    .select("*")
    .eq("id", submissionId)
    .eq("marker_id", user.id)
    .single();

  if (fetchError || !submission) {
    return { error: "You do not have permission to review this submission" };
  }

  // STATUS GUARDRAIL: Prevent editing submissions that have already been reviewed
  if (submission.status === "reviewed") {
    return { error: "This submission has already been reviewed and cannot be edited" };
  }

  // Collect all marked files
  const files: File[] = [];
  for (let i = 0; i < fileCount; i++) {
    const file = formData.get(`markedFile_${i}`) as File;
    if (file && file.size > 0) {
      files.push(file);
    }
  }

  // Also check for legacy single file field
  const singleFile = formData.get("markedFile") as File | null;
  if (singleFile && singleFile.size > 0 && files.length === 0) {
    files.push(singleFile);
  }

  // If not a draft, require at least one marked file (unless already uploaded)
  const existingMarkedFiles = submission.marked_files as SubmissionFile[] | null;
  if (!isDraft && files.length === 0 && !submission.marked_file_path && (!existingMarkedFiles || existingMarkedFiles.length === 0)) {
    return { error: "Please upload at least one marked file before submitting the review" };
  }

  // Validate and upload new files
  const allowedTypes = [
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
    "application/pdf", // .pdf
  ];

  const uploadedFiles: SubmissionFile[] = [];
  const timestamp = Date.now();

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    if (!allowedTypes.includes(file.type)) {
      return { error: `File "${file.name}" is not allowed. Only .docx, .xlsx, and .pdf files are accepted.` };
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return { error: `File "${file.name}" is too large. Maximum size is 10MB.` };
    }

    const renamedName = generateMarkedFileName(submission.title, file.name, i, files.length);
    const storagePath = `marked/${user.id}/${submissionId}-${timestamp}/${renamedName}`;

    const { error: uploadError } = await supabase.storage
      .from("submissions")
      .upload(storagePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      // Clean up any files already uploaded in this batch
      for (const uploaded of uploadedFiles) {
        await supabase.storage.from("submissions").remove([uploaded.path]);
      }
      return { error: `Failed to upload "${file.name}". Please try again.` };
    }

    uploadedFiles.push({
      path: storagePath,
      name: renamedName,
      size: file.size,
      original_name: file.name,
    });
  }

  // Merge with existing marked files if any
  let allMarkedFiles: SubmissionFile[] = existingMarkedFiles || [];
  if (uploadedFiles.length > 0) {
    // If there are new files, delete old ones and replace
    if (submission.marked_file_path) {
      await supabase.storage.from("submissions").remove([submission.marked_file_path]);
    }
    if (existingMarkedFiles) {
      for (const f of existingMarkedFiles) {
        await supabase.storage.from("submissions").remove([f.path]);
      }
    }
    allMarkedFiles = uploadedFiles;
  }

  // Prepare update data
  const updateData: Record<string, unknown> = {
    marker_notes: markerNotes || null,
    updated_at: new Date().toISOString(),
  };

  // Update file fields if we have new files
  if (uploadedFiles.length > 0) {
    updateData.marked_file_path = uploadedFiles[0].path;
    updateData.marked_file_name = uploadedFiles[0].name;
    updateData.marked_files = allMarkedFiles;
  }

  // If not a draft, finalize the review
  if (!isDraft) {
    updateData.status = "reviewed";
    updateData.reviewed_at = new Date().toISOString();
  }

  // Update the submission
  const { error: updateError } = await supabase
    .from("submissions")
    .update(updateData)
    .eq("id", submissionId)
    .eq("marker_id", user.id);

  if (updateError) {
    return { error: "Failed to submit review. Please try again." };
  }

  revalidatePath("/marker/dashboard");
  revalidatePath("/marker/reviews");
  revalidatePath(`/marker/reviews/${submissionId}`);
  revalidatePath(`/student/submissions/${submissionId}`);
  revalidatePath("/student/dashboard");
  revalidatePath("/student/submissions");

  if (!isDraft) {
    redirect("/marker/reviews");
  }

  return { success: true };
}

// Get signed URL for file download (for markers - verifies assignment)
export async function getMarkerFileDownloadUrl(
  filePath: string,
  submissionId: string
): Promise<{ url: string | null; error: string | null }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { url: null, error: "Not authenticated" };
  }

  // Verify the submission is assigned to this marker
  const { data: submission, error: fetchError } = await supabase
    .from("submissions")
    .select("id, marker_id, file_path, marked_file_path, files, marked_files")
    .eq("id", submissionId)
    .eq("marker_id", user.id)
    .single();

  if (fetchError || !submission) {
    return { url: null, error: "You do not have permission to download this file" };
  }

  // Verify the file path matches the submission (check legacy and new array fields)
  const validPaths: string[] = [submission.file_path, submission.marked_file_path].filter(Boolean);
  
  // Add paths from files array
  const filesArray = submission.files as SubmissionFile[] | null;
  if (filesArray) {
    validPaths.push(...filesArray.map(f => f.path));
  }
  
  // Add paths from marked_files array
  const markedFilesArray = submission.marked_files as SubmissionFile[] | null;
  if (markedFilesArray) {
    validPaths.push(...markedFilesArray.map(f => f.path));
  }
  
  if (!validPaths.includes(filePath)) {
    return { url: null, error: "Invalid file path" };
  }

  const { data, error } = await supabase.storage
    .from("submissions")
    .createSignedUrl(filePath, 60 * 5); // 5 minutes expiry

  if (error) {
    return { url: null, error: "Failed to generate download link" };
  }

  return { url: data.signedUrl, error: null };
}

// Get signed URLs for all files in a submission (for markers)
export async function getMarkerAllFileDownloadUrls(
  submissionId: string
): Promise<{ 
  originalFiles: { name: string; url: string; size: number }[]; 
  markedFiles: { name: string; url: string; size: number }[];
  error: string | null 
}> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { originalFiles: [], markedFiles: [], error: "Not authenticated" };
  }

  // Verify the submission is assigned to this marker
  const { data: submission, error: fetchError } = await supabase
    .from("submissions")
    .select("*")
    .eq("id", submissionId)
    .eq("marker_id", user.id)
    .single();

  if (fetchError || !submission) {
    return { originalFiles: [], markedFiles: [], error: "You do not have permission to access this submission" };
  }

  const originalFiles: { name: string; url: string; size: number }[] = [];
  const markedFiles: { name: string; url: string; size: number }[] = [];

  // Get URLs for original files
  const filesArray = submission.files as SubmissionFile[] | null;
  if (filesArray && filesArray.length > 0) {
    for (const file of filesArray) {
      const { data } = await supabase.storage
        .from("submissions")
        .createSignedUrl(file.path, 60 * 5);
      if (data?.signedUrl) {
        originalFiles.push({ name: file.name, url: data.signedUrl, size: file.size });
      }
    }
  } else if (submission.file_path) {
    // Fallback to legacy single file
    const { data } = await supabase.storage
      .from("submissions")
      .createSignedUrl(submission.file_path, 60 * 5);
    if (data?.signedUrl) {
      originalFiles.push({ 
        name: submission.file_name, 
        url: data.signedUrl, 
        size: submission.file_size 
      });
    }
  }

  // Get URLs for marked files
  const markedFilesArray = submission.marked_files as SubmissionFile[] | null;
  if (markedFilesArray && markedFilesArray.length > 0) {
    for (const file of markedFilesArray) {
      const { data } = await supabase.storage
        .from("submissions")
        .createSignedUrl(file.path, 60 * 5);
      if (data?.signedUrl) {
        markedFiles.push({ name: file.name, url: data.signedUrl, size: file.size });
      }
    }
  } else if (submission.marked_file_path) {
    // Fallback to legacy single file
    const { data } = await supabase.storage
      .from("submissions")
      .createSignedUrl(submission.marked_file_path, 60 * 5);
    if (data?.signedUrl) {
      markedFiles.push({ 
        name: submission.marked_file_name || "Marked file", 
        url: data.signedUrl, 
        size: 0 
      });
    }
  }

  return { originalFiles, markedFiles, error: null };
}
