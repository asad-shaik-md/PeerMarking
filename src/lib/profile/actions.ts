"use server";

import { createClient } from "@/lib/supabase/server";
import { Submission } from "@/types/submission";

// Student profile data
export interface StudentProfileData {
  id: string;
  email: string;
  fullName: string;
  createdAt: string;
  totalSubmissions: number;
  reviewedSubmissions: number;
  pendingSubmissions: number;
  averageScore: number | null;
  recentSubmissions: Submission[];
}

// Marker profile data
export interface MarkerProfileData {
  id: string;
  email: string;
  fullName: string;
  createdAt: string;
  totalReviews: number;
  averageScoreGiven: number | null;
  helpfulFeedbackCount: number;
  recentReviews: Submission[];
  papersPassed: string[];
}

// Get current student's profile
export async function getStudentProfile(): Promise<StudentProfileData | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Get all submissions by this user
  const { data: submissions, error } = await supabase
    .from("submissions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return null;
  }

  const allSubmissions = (submissions || []) as Submission[];
  const reviewedSubmissions = allSubmissions.filter((s) => s.status === "reviewed");
  const pendingSubmissions = allSubmissions.filter((s) => s.status !== "reviewed");

  // Calculate average score from reviewed submissions
  const scores = reviewedSubmissions
    .filter((s) => s.score !== null && s.score !== undefined)
    .map((s) => s.score as number);
  
  const averageScore = scores.length > 0 
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) 
    : null;

  return {
    id: user.id,
    email: user.email || "",
    fullName: user.user_metadata?.full_name || "Student",
    createdAt: user.created_at,
    totalSubmissions: allSubmissions.length,
    reviewedSubmissions: reviewedSubmissions.length,
    pendingSubmissions: pendingSubmissions.length,
    averageScore,
    recentSubmissions: allSubmissions.slice(0, 5),
  };
}

// Get current marker's profile
export async function getMarkerProfile(): Promise<MarkerProfileData | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Get all submissions reviewed by this marker
  const { data: reviews, error } = await supabase
    .from("submissions")
    .select("*")
    .eq("marker_id", user.id)
    .eq("status", "reviewed")
    .order("reviewed_at", { ascending: false });

  if (error) {
    return null;
  }

  const allReviews = (reviews || []) as Submission[];

  // Calculate average score given
  const scores = allReviews
    .filter((s) => s.score !== null && s.score !== undefined)
    .map((s) => s.score as number);
  
  const averageScoreGiven = scores.length > 0 
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) 
    : null;

  // For helpful feedback, count reviews with marker_notes (simplified metric)
  const helpfulFeedbackCount = allReviews.filter(
    (s) => s.marker_notes && s.marker_notes.length > 50
  ).length;

  // Papers passed - stored in user_metadata or default to common papers
  const papersPassed = user.user_metadata?.papers_passed || ["PM", "FM", "AA"];

  return {
    id: user.id,
    email: user.email || "",
    fullName: user.user_metadata?.full_name || "Marker",
    createdAt: user.created_at,
    totalReviews: allReviews.length,
    averageScoreGiven,
    helpfulFeedbackCount,
    recentReviews: allReviews.slice(0, 5),
    papersPassed,
  };
}

// Get a marker's public profile (viewable by students)
export async function getMarkerPublicProfile(markerId: string): Promise<MarkerProfileData | null> {
  const supabase = await createClient();

  // Check if current user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Get marker's user data from auth.users via admin or just use their reviews
  // Since we can't directly query auth.users, we'll get info from submissions
  const { data: reviews, error } = await supabase
    .from("submissions")
    .select("*")
    .eq("marker_id", markerId)
    .eq("status", "reviewed")
    .order("reviewed_at", { ascending: false });

  if (error) {
    return null;
  }

  const allReviews = (reviews || []) as Submission[];

  if (allReviews.length === 0) {
    // No reviews found for this marker
    return null;
  }

  // Calculate average score given
  const scores = allReviews
    .filter((s) => s.score !== null && s.score !== undefined)
    .map((s) => s.score as number);
  
  const averageScoreGiven = scores.length > 0 
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) 
    : null;

  // For helpful feedback, count reviews with substantial marker_notes
  const helpfulFeedbackCount = allReviews.filter(
    (s) => s.marker_notes && s.marker_notes.length > 50
  ).length;

  // Since we can't access the marker's user_metadata directly,
  // we'll provide placeholder data. In production, you'd use a profiles table.
  return {
    id: markerId,
    email: "", // Hidden for privacy
    fullName: "Senior Marker", // Placeholder
    createdAt: "", // Unknown
    totalReviews: allReviews.length,
    averageScoreGiven,
    helpfulFeedbackCount,
    recentReviews: allReviews.slice(0, 5),
    papersPassed: ["PM", "FM", "AA"], // Default
  };
}

// Get reviewed submissions for community page (anonymized)
export interface CommunitySubmission {
  id: string;
  paper: string;
  title: string;
  question?: string;
  status: string;
  reviewedAt: string;
  score?: number;
}

export async function getCommunitySubmissions(): Promise<CommunitySubmission[]> {
  const supabase = await createClient();

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  // Get only reviewed submissions
  const { data, error } = await supabase
    .from("submissions")
    .select("id, paper, title, question, status, reviewed_at, score")
    .eq("status", "reviewed")
    .order("reviewed_at", { ascending: false })
    .limit(50);

  if (error) {
    return [];
  }

  return (data || []).map((s) => ({
    id: s.id,
    paper: s.paper,
    title: s.title,
    question: s.question,
    status: s.status,
    reviewedAt: s.reviewed_at,
    score: s.score,
  }));
}

// Get a single submission for community view (read-only, anonymized)
export async function getCommunitySubmissionDetail(id: string): Promise<Submission | null> {
  const supabase = await createClient();

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Only get reviewed submissions
  const { data, error } = await supabase
    .from("submissions")
    .select("*")
    .eq("id", id)
    .eq("status", "reviewed")
    .single();

  if (error) {
    return null;
  }

  // Return submission without user_id for anonymity
  const submission = data as Submission;
  return {
    ...submission,
    user_id: "anonymous", // Anonymize
  };
}
