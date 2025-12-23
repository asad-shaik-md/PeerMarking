"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Submission } from "@/types/submission";

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
    console.error("Error fetching assigned reviews:", error);
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
    console.error("Error fetching recent assigned reviews:", error);
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
    console.error("Error fetching pending submissions:", error);
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
    console.error("Error accepting review:", updateError);
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
    console.error("Error fetching submission for review:", error);
    return null;
  }

  return data as Submission;
}

// Submit a review (with marked file, feedback, and score)
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
  const score = formData.get("score") as string | null;
  const file = formData.get("markedFile") as File | null;
  const isDraft = formData.get("isDraft") === "true";

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

  // If not a draft, require a marked file
  if (!isDraft && !file && !submission.marked_file_path) {
    return { error: "Please upload a marked file before submitting the review" };
  }

  let markedFilePath = submission.marked_file_path;
  let markedFileName = submission.marked_file_name;

  // Handle file upload if provided
  if (file && file.size > 0) {
    // Validate file type
    const allowedTypes = [
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
      "application/pdf", // .pdf
    ];

    if (!allowedTypes.includes(file.type)) {
      return { error: "Only .docx, .xlsx, and .pdf files are allowed" };
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return { error: "File size must be less than 10MB" };
    }

    // Generate unique file path for marked file
    const fileExt = file.name.split(".").pop();
    const fileName = `marked/${user.id}/${submissionId}-${Date.now()}.${fileExt}`;

    // Delete old marked file if exists
    if (submission.marked_file_path) {
      await supabase.storage.from("submissions").remove([submission.marked_file_path]);
    }

    // Upload new marked file
    const { error: uploadError } = await supabase.storage
      .from("submissions")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return { error: "Failed to upload marked file. Please try again." };
    }

    markedFilePath = fileName;
    markedFileName = file.name;
  }

  // Prepare update data
  const updateData: Record<string, unknown> = {
    marker_notes: markerNotes || null,
    updated_at: new Date().toISOString(),
  };

  if (markedFilePath) {
    updateData.marked_file_path = markedFilePath;
    updateData.marked_file_name = markedFileName;
  }

  if (score !== null && score !== "") {
    const scoreNum = parseInt(score, 10);
    if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 100) {
      return { error: "Score must be between 0 and 100" };
    }
    updateData.score = scoreNum;
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
    console.error("Error submitting review:", updateError);
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

// Get signed URL for file download (for markers)
export async function getMarkerFileDownloadUrl(
  filePath: string
): Promise<{ url: string | null; error: string | null }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { url: null, error: "Not authenticated" };
  }

  const { data, error } = await supabase.storage
    .from("submissions")
    .createSignedUrl(filePath, 60 * 5); // 5 minutes expiry

  if (error) {
    console.error("Error creating signed URL:", error);
    return { url: null, error: "Failed to generate download link" };
  }

  return { url: data.signedUrl, error: null };
}
