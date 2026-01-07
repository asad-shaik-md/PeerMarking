"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Submission, SubmissionStatus, SubmissionFile } from "@/types/submission";

// Helper to sanitize filename for storage
function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9_.-]/g, "_");
}

// Helper to generate file name with naming convention
function generateFileName(
  submissionTitle: string,
  originalFileName: string,
  index: number,
  totalFiles: number,
  type: "original" | "marked"
): string {
  const fileExt = originalFileName.split(".").pop() || "docx";
  const sanitizedTitle = sanitizeFilename(submissionTitle);
  const suffix = type === "original" ? "original" : "marked";
  
  // If only one file, don't add number suffix
  if (totalFiles === 1) {
    return `${sanitizedTitle}_${suffix}.${fileExt}`;
  }
  
  // Multiple files: add number suffix
  return `${sanitizedTitle}_${suffix}_${index + 1}.${fileExt}`;
}

// Create a new submission
export async function createSubmission(formData: FormData) {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const title = formData.get("title") as string;
  const paper = formData.get("paper") as string;
  const question = formData.get("question") as string | null;
  const notes = formData.get("notes") as string | null;
  const fileCount = parseInt(formData.get("fileCount") as string) || 1;

  if (!title || !paper) {
    return { error: "Missing required fields" };
  }

  // Collect all files
  const files: File[] = [];
  for (let i = 0; i < fileCount; i++) {
    const file = formData.get(`file_${i}`) as File;
    if (file && file.size > 0) {
      files.push(file);
    }
  }

  if (files.length === 0) {
    return { error: "Please upload at least one file" };
  }

  // Validate all files
  const allowedTypes = [
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
  ];

  for (const file of files) {
    if (!allowedTypes.includes(file.type)) {
      return { error: `File "${file.name}" is not allowed. Only .docx and .xlsx files are accepted.` };
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return { error: `File "${file.name}" is too large. Maximum size is 10MB.` };
    }
  }

  // Upload all files with proper naming
  const uploadedFiles: SubmissionFile[] = [];
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(7);

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const renamedName = generateFileName(title, file.name, i, files.length, "original");
    const storagePath = `${user.id}/${timestamp}-${randomId}/${renamedName}`;

    const { error: uploadError } = await supabase.storage
      .from("submissions")
      .upload(storagePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      // Clean up any files already uploaded
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

  // Create submission record (use first file for backward compatibility fields)
  const { data: submission, error: dbError } = await supabase
    .from("submissions")
    .insert({
      user_id: user.id,
      title,
      paper,
      question: question || null,
      notes: notes || null,
      // Legacy fields (first file)
      file_path: uploadedFiles[0].path,
      file_name: uploadedFiles[0].name,
      file_size: uploadedFiles[0].size,
      // New multi-file support
      files: uploadedFiles,
      status: "pending" as SubmissionStatus,
    })
    .select()
    .single();

  if (dbError) {
    // Clean up uploaded files if DB insert fails
    for (const uploaded of uploadedFiles) {
      await supabase.storage.from("submissions").remove([uploaded.path]);
    }
    return { error: "Failed to create submission. Please try again." };
  }

  revalidatePath("/student/dashboard");
  revalidatePath("/student/submissions");
  redirect(`/student/submissions/${submission.id}`);
}

// Get all submissions for the current user
export async function getMySubmissions(): Promise<Submission[]> {
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
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return [];
  }

  return data as Submission[];
}

// Get a single submission by ID (only if it belongs to current user)
export async function getSubmission(id: string): Promise<Submission | null> {
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
    .eq("user_id", user.id)
    .single();

  if (error) {
    return null;
  }

  return data as Submission;
}

// Get submission statistics for dashboard
export async function getSubmissionStats() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { total: 0, pending: 0, underReview: 0, reviewed: 0 };
  }

  const { data, error } = await supabase
    .from("submissions")
    .select("status")
    .eq("user_id", user.id);

  if (error || !data) {
    return { total: 0, pending: 0, underReview: 0, reviewed: 0 };
  }

  const total = data.length;
  const pending = data.filter((s) => s.status === "pending").length;
  const underReview = data.filter((s) => s.status === "under_review").length;
  const reviewed = data.filter((s) => s.status === "reviewed").length;

  return { total, pending, underReview, reviewed };
}

// Get recent submissions (limit 5)
export async function getRecentSubmissions(): Promise<Submission[]> {
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
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) {
    return [];
  }

  return data as Submission[];
}

// Get signed URL for file download (students only - verifies ownership)
export async function getFileDownloadUrl(
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

  // Verify the user owns this submission
  const { data: submission, error: fetchError } = await supabase
    .from("submissions")
    .select("id, user_id, file_path, marked_file_path, files, marked_files")
    .eq("id", submissionId)
    .eq("user_id", user.id)
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

// Get signed URLs for all files in a submission (students only)
export async function getAllFileDownloadUrls(
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

  // Verify the user owns this submission
  const { data: submission, error: fetchError } = await supabase
    .from("submissions")
    .select("*")
    .eq("id", submissionId)
    .eq("user_id", user.id)
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
