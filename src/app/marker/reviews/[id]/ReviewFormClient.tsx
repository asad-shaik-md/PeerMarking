"use client";

import { useState, useRef, useTransition } from "react";
import Link from "next/link";
import { Submission } from "@/types/submission";
import { getPaperLabel } from "@/types/submission";
import { submitReview } from "@/lib/marker/actions";

interface ReviewFormClientProps {
  submission: Submission;
  originalDownloadUrl: string | null;
  markedDownloadUrl: string | null;
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getRelativeTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  return "Just now";
}

export default function ReviewFormClient({
  submission,
  originalDownloadUrl,
  markedDownloadUrl,
}: ReviewFormClientProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [isDraftPending, startDraftTransition] = useTransition();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [score, setScore] = useState<string>(submission.score?.toString() || "");
  const [markerNotes, setMarkerNotes] = useState<string>(submission.marker_notes || "");

  const isReviewed = submission.status === "reviewed";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const validateAndSetFile = (file: File) => {
    const allowedTypes = [
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/pdf",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("Please upload a Word (.docx), Excel (.xlsx), or PDF file.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB.");
      return;
    }

    setError(null);
    setSelectedFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (isDraft: boolean) => {
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.set("submissionId", submission.id);
    formData.set("markerNotes", markerNotes);
    formData.set("score", score);
    formData.set("isDraft", isDraft.toString());

    if (selectedFile) {
      formData.set("markedFile", selectedFile);
    }

    const transitionFn = isDraft ? startDraftTransition : startTransition;

    transitionFn(async () => {
      const result = await submitReview(formData);
      if (result.error) {
        setError(result.error);
      } else if (isDraft) {
        setSuccess("Draft saved successfully!");
      }
      // If not draft, submitReview redirects to /marker/reviews
    });
  };

  return (
    <div className="w-full max-w-[1000px] mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 mb-8 text-sm">
        <Link
          href="/marker/dashboard"
          className="text-gray-400 hover:text-primary transition-colors"
        >
          Dashboard
        </Link>
        <span className="material-symbols-outlined text-[16px] text-gray-500">chevron_right</span>
        <Link href="/marker/reviews" className="text-gray-400 hover:text-primary transition-colors">
          Reviews
        </Link>
        <span className="material-symbols-outlined text-[16px] text-gray-500">chevron_right</span>
        <span className="text-white font-medium">Review #{submission.id.slice(0, 8)}</span>
      </nav>

      {/* Header */}
      <section className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-12">
        <div className="flex flex-col gap-3 max-w-2xl">
          <h1 className="text-3xl md:text-4xl font-bold leading-tight">{submission.title}</h1>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">description</span>
              <span>{getPaperLabel(submission.paper)}</span>
            </div>
            {submission.question && (
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">quiz</span>
                <span>{submission.question}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">calendar_today</span>
              <span>Submitted {formatDate(submission.created_at)}</span>
            </div>
          </div>
        </div>

        {/* Score Input */}
        <div className="flex-shrink-0">
          <div className="bg-surface-dark border border-white/10 p-2 pr-6 rounded-2xl flex items-center gap-4">
            <div className="size-12 rounded-xl bg-white/5 flex items-center justify-center text-gray-300">
              <span className="material-symbols-outlined">grade</span>
            </div>
            <div>
              <label
                className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-0.5"
                htmlFor="scoreInput"
              >
                Total Marks
              </label>
              <div className="flex items-baseline gap-1">
                <input
                  id="scoreInput"
                  type="number"
                  min="0"
                  max="100"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  disabled={isReviewed}
                  className="w-16 p-0 text-3xl font-bold text-white bg-transparent border-none focus:ring-0 text-right placeholder-gray-500 disabled:opacity-50"
                  placeholder="00"
                />
                <span className="text-xl font-medium text-gray-400">/ 100</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-400 text-sm mb-6">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-primary/10 border border-primary/50 rounded-lg p-4 text-primary text-sm mb-6">
          {success}
        </div>
      )}

      {/* Student Notes (if any) */}
      {submission.notes && (
        <section className="bg-surface-dark border border-white/10 rounded-lg p-6 mb-8">
          <div className="flex items-center gap-3 mb-3">
            <span className="material-symbols-outlined text-gray-400">note</span>
            <h3 className="text-lg font-bold">Student&apos;s Notes</h3>
          </div>
          <p className="text-gray-300 leading-relaxed">{submission.notes}</p>
        </section>
      )}

      {/* File Download/Upload Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {/* Original File */}
        <div className="group relative bg-surface-dark border border-white/10 rounded-lg p-6 flex flex-col transition-all hover:border-gray-600">
          <div className="flex items-start justify-between mb-4">
            <div className="size-12 rounded-full bg-white/5 flex items-center justify-center text-gray-300">
              <span className="material-symbols-outlined text-2xl">description</span>
            </div>
            <span className="text-xs font-medium uppercase tracking-wider text-gray-500">
              Student Submission
            </span>
          </div>
          <h3 className="text-lg font-bold text-white mb-1 truncate">{submission.file_name}</h3>
          <p className="text-sm text-gray-400 mb-8">
            {submission.file_size ? formatFileSize(submission.file_size) : "Unknown size"} •
            Uploaded {getRelativeTime(submission.created_at)}
          </p>
          <div className="mt-auto">
            {originalDownloadUrl ? (
              <a
                href={originalDownloadUrl}
                download={submission.file_name}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white font-medium py-3 px-6 rounded-full transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">download</span>
                <span>Download Original</span>
              </a>
            ) : (
              <button
                disabled
                className="w-full flex items-center justify-center gap-2 bg-white/5 text-gray-500 font-medium py-3 px-6 rounded-full cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-[20px]">error</span>
                <span>File Unavailable</span>
              </button>
            )}
          </div>
        </div>

        {/* Upload Marked File */}
        <div
          className={`group relative rounded-lg p-6 flex flex-col transition-all ${
            selectedFile || submission.marked_file_path
              ? "bg-surface-dark border border-primary/20 shadow-[0_0_20px_rgba(56,224,123,0.05)]"
              : "bg-surface-dark/50 border-2 border-dashed border-white/20 hover:border-primary"
          }`}
          onDragOver={!isReviewed ? handleDragOver : undefined}
          onDragLeave={!isReviewed ? handleDragLeave : undefined}
          onDrop={!isReviewed ? handleDrop : undefined}
        >
          {selectedFile ? (
            // New file selected
            <>
              <div className="flex items-start justify-between mb-4">
                <div className="size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl">upload_file</span>
                </div>
                <span className="text-xs font-medium uppercase tracking-wider text-primary">
                  New File
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mb-1 truncate">{selectedFile.name}</h3>
              <p className="text-sm text-gray-400 mb-8">
                {formatFileSize(selectedFile.size)} • Ready to upload
              </p>
              <div className="mt-auto">
                <button
                  type="button"
                  onClick={removeFile}
                  className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-medium py-3 px-6 rounded-full transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                  <span>Remove File</span>
                </button>
              </div>
            </>
          ) : submission.marked_file_path ? (
            // Existing marked file
            <>
              <div className="flex items-start justify-between mb-4">
                <div className="size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl">rate_review</span>
                </div>
                <span className="text-xs font-medium uppercase tracking-wider text-primary">
                  Marked File
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mb-1 truncate">
                {submission.marked_file_name}
              </h3>
              <p className="text-sm text-gray-400 mb-8">
                Uploaded{" "}
                {submission.reviewed_at
                  ? getRelativeTime(submission.reviewed_at)
                  : getRelativeTime(submission.updated_at)}
              </p>
              <div className="mt-auto space-y-2">
                {markedDownloadUrl && (
                  <a
                    href={markedDownloadUrl}
                    download={submission.marked_file_name}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-background-dark font-bold py-3 px-6 rounded-full transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]">download</span>
                    <span>Download Marked File</span>
                  </a>
                )}
                {!isReviewed && (
                  <label className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white font-medium py-3 px-6 rounded-full transition-colors cursor-pointer">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".docx,.xlsx,.pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <span className="material-symbols-outlined text-[20px]">upload</span>
                    <span>Replace File</span>
                  </label>
                )}
              </div>
            </>
          ) : (
            // Upload new file
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept=".docx,.xlsx,.pdf"
                onChange={handleFileChange}
                className="hidden"
                id="markedFile"
                disabled={isReviewed}
              />
              <label
                htmlFor="markedFile"
                className={`cursor-pointer w-full h-full flex flex-col items-center justify-center ${
                  isReviewed ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <div
                  className={`size-14 rounded-full bg-white/5 text-primary flex items-center justify-center mb-4 transition-transform duration-300 ${
                    isDragOver ? "scale-110" : "group-hover:scale-110"
                  }`}
                >
                  <span className="material-symbols-outlined text-3xl">cloud_upload</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-1">Upload Marked File</h3>
                <p className="text-sm text-gray-400 mb-6 max-w-[200px] leading-snug text-center">
                  Drag & drop your marked PDF or DOCX here
                </p>
                <span className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-background-dark font-bold py-3 px-8 rounded-full transition-colors shadow-lg shadow-primary/20">
                  <span className="material-symbols-outlined text-[20px]">upload_file</span>
                  <span>Select File</span>
                </span>
              </label>
            </>
          )}
        </div>
      </div>

      {/* Marker's Note */}
      <section className="bg-surface-dark border border-white/10 rounded-lg p-8 mb-12">
        <div className="flex items-center gap-3 mb-6">
          <span className="material-symbols-outlined text-primary">edit_note</span>
          <h3 className="text-lg font-bold">Marker&apos;s Note</h3>
        </div>
        <div className="relative">
          <textarea
            value={markerNotes}
            onChange={(e) => setMarkerNotes(e.target.value)}
            disabled={isReviewed}
            className="w-full min-h-[160px] bg-white/5 border border-white/10 rounded-lg p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all resize-y disabled:opacity-50"
            placeholder="Provide constructive feedback, highlighting strengths and areas for improvement for the student..."
          />
          <p className="text-xs text-gray-500 text-right mt-2">Markdown supported</p>
        </div>
      </section>

      {/* Footer Actions */}
      <footer className="flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-white/10 pt-8 pb-12">
        <p className="text-sm text-gray-600">
          Submission ID: {submission.id.slice(0, 8)} • Confidential Review
        </p>
        {!isReviewed && (
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => handleSubmit(true)}
              disabled={isDraftPending || isPending}
              className="text-sm font-medium text-gray-400 hover:text-white transition-colors py-3 px-6 rounded-full hover:bg-white/5 disabled:opacity-50"
            >
              {isDraftPending ? "Saving..." : "Save Draft"}
            </button>
            <button
              type="button"
              onClick={() => handleSubmit(false)}
              disabled={isPending || isDraftPending}
              className="flex items-center gap-2 bg-white border border-white text-background-dark font-bold py-3 px-8 rounded-full transition-all hover:bg-gray-100 disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <span className="material-symbols-outlined animate-spin">progress_activity</span>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <span>Submit Review</span>
                  <span className="material-symbols-outlined">arrow_forward</span>
                </>
              )}
            </button>
          </div>
        )}
        {isReviewed && (
          <div className="flex items-center gap-2 text-primary">
            <span className="material-symbols-outlined">check_circle</span>
            <span className="font-medium">Review Completed</span>
          </div>
        )}
      </footer>
    </div>
  );
}
