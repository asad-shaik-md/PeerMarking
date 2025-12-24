"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Submission, SubmissionStatus } from "@/types/submission";

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
  const file = formData.get("file") as File;

  if (!title || !paper || !file) {
    return { error: "Missing required fields" };
  }

  // Validate file type
  const allowedTypes = [
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
  ];

  if (!allowedTypes.includes(file.type)) {
    return { error: "Only .docx and .xlsx files are allowed" };
  }

  // Validate file size (10MB max)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return { error: "File size must be less than 10MB" };
  }

  // Generate unique file path
  const fileExt = file.name.split(".").pop();
  const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

  // Upload file to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from("submissions")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    return { error: "Failed to upload file. Please try again." };
  }

  // Create submission record
  const { data: submission, error: dbError } = await supabase
    .from("submissions")
    .insert({
      user_id: user.id,
      title,
      paper,
      question: question || null,
      notes: notes || null,
      file_path: fileName,
      file_name: file.name,
      file_size: file.size,
      status: "pending" as SubmissionStatus,
    })
    .select()
    .single();

  if (dbError) {
    // Clean up uploaded file if DB insert fails
    await supabase.storage.from("submissions").remove([fileName]);
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
    return { total: 0, pending: 0, underReview: 0, reviewed: 0, averageScore: null };
  }

  const { data, error } = await supabase
    .from("submissions")
    .select("status, score")
    .eq("user_id", user.id);

  if (error || !data) {
    return { total: 0, pending: 0, underReview: 0, reviewed: 0, averageScore: null };
  }

  const total = data.length;
  const pending = data.filter((s) => s.status === "pending").length;
  const underReview = data.filter((s) => s.status === "under_review").length;
  const reviewed = data.filter((s) => s.status === "reviewed").length;

  const reviewedWithScores = data.filter((s) => s.status === "reviewed" && s.score !== null);
  const averageScore =
    reviewedWithScores.length > 0
      ? Math.round(
          reviewedWithScores.reduce((sum, s) => sum + (s.score || 0), 0) / reviewedWithScores.length
        )
      : null;

  return { total, pending, underReview, reviewed, averageScore };
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
    .select("id, user_id, file_path, marked_file_path")
    .eq("id", submissionId)
    .eq("user_id", user.id)
    .single();

  if (fetchError || !submission) {
    return { url: null, error: "You do not have permission to download this file" };
  }

  // Verify the file path matches the submission
  if (filePath !== submission.file_path && filePath !== submission.marked_file_path) {
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
