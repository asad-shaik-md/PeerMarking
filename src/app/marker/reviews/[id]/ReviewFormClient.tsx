"use client";

import { useState, useRef, useTransition } from "react";
import Link from "next/link";
import { Submission } from "@/types/submission";
import { getPaperLabel } from "@/types/submission";
import { submitReview } from "@/lib/marker/actions";

interface FileWithUrl {
  name: string;
  url: string;
  size: number;
}

interface ReviewFormClientProps {
  submission: Submission;
  originalFiles: FileWithUrl[];
  markedFilesFromServer: FileWithUrl[];
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
  originalFiles,
  markedFilesFromServer,
}: ReviewFormClientProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [isDraftPending, startDraftTransition] = useTransition();

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [markerNotes, setMarkerNotes] = useState<string>(submission.marker_notes || "");

  const isReviewed = submission.status === "reviewed";

  const validateFile = (file: File): string | null => {
    const allowedTypes = [
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/pdf",
    ];

    if (!allowedTypes.includes(file.type)) {
      return `"${file.name}" is not valid. Only Word, Excel, or PDF files allowed.`;
    }

    if (file.size > 10 * 1024 * 1024) {
      return `"${file.name}" is too large. Maximum size is 10MB.`;
    }

    return null;
  };

  const addFiles = (newFiles: FileList | File[]) => {
    const filesToAdd: File[] = [];
    const errors: string[] = [];
    
    Array.from(newFiles).forEach(file => {
      // Check for duplicates
      if (selectedFiles.some(f => f.name === file.name && f.size === file.size)) {
        return; // Skip duplicates silently
      }
      
      const validationError = validateFile(file);
      if (validationError) {
        errors.push(validationError);
      } else {
        filesToAdd.push(file);
      }
    });
    
    if (errors.length > 0) {
      setError(errors[0]);
    } else {
      setError(null);
    }
    
    if (filesToAdd.length > 0) {
      setSelectedFiles(prev => [...prev, ...filesToAdd]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      addFiles(files);
    }
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      addFiles(files);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const clearAllFiles = () => {
    setSelectedFiles([]);
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
    formData.set("isDraft", isDraft.toString());
    formData.set("markedFileCount", selectedFiles.length.toString());

    selectedFiles.forEach((file, index) => {
      formData.append(`markedFile_${index}`, file);
    });

    const transitionFn = isDraft ? startDraftTransition : startTransition;

    transitionFn(async () => {
      const result = await submitReview(formData);
      if (result.error) {
        setError(result.error);
      } else if (isDraft) {
        setSuccess("Draft saved successfully!");
        setSelectedFiles([]); // Clear selected files after save
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
        {/* Original File(s) */}
        <div className="group relative bg-surface-dark border border-white/10 rounded-lg p-6 flex flex-col transition-all hover:border-gray-600">
          <div className="flex items-start justify-between mb-4">
            <div className="size-12 rounded-full bg-white/5 flex items-center justify-center text-gray-300">
              <span className="material-symbols-outlined text-2xl">description</span>
            </div>
            <span className="text-xs font-medium uppercase tracking-wider text-gray-500">
              Student Submission {originalFiles.length > 1 ? `(${originalFiles.length} files)` : ""}
            </span>
          </div>
          
          {originalFiles.length > 0 ? (
            <>
              <div className="flex-1 space-y-2 mb-4">
                {originalFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="material-symbols-outlined text-gray-400">draft</span>
                      <div className="min-w-0">
                        <p className="text-sm text-white truncate">{file.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <a
                      href={file.url}
                      download={file.name}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-full transition-colors"
                      title="Download"
                    >
                      <span className="material-symbols-outlined">download</span>
                    </a>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400">
                Uploaded {getRelativeTime(submission.created_at)}
              </p>
            </>
          ) : (
            <>
              <h3 className="text-lg font-bold text-gray-500 mb-1">No files</h3>
              <p className="text-sm text-gray-500 mb-8">
                File unavailable
              </p>
            </>
          )}
        </div>

        {/* Upload Marked File(s) */}
        <div
          className={`group relative rounded-lg p-6 flex flex-col transition-all ${
            selectedFiles.length > 0 || markedFilesFromServer.length > 0
              ? "bg-surface-dark border border-primary/20 shadow-[0_0_20px_rgba(56,224,123,0.05)]"
              : "bg-surface-dark/50 border-2 border-dashed border-white/20 hover:border-primary"
          }`}
          onDragOver={!isReviewed ? handleDragOver : undefined}
          onDragLeave={!isReviewed ? handleDragLeave : undefined}
          onDrop={!isReviewed ? handleDrop : undefined}
        >
          {selectedFiles.length > 0 ? (
            // New files selected
            <>
              <div className="flex items-start justify-between mb-4">
                <div className="size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl">upload_file</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium uppercase tracking-wider text-primary">
                    {selectedFiles.length} New File{selectedFiles.length > 1 ? "s" : ""}
                  </span>
                  <button
                    type="button"
                    onClick={clearAllFiles}
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    Clear
                  </button>
                </div>
              </div>
              <div className="flex-1 space-y-2 mb-4">
                {selectedFiles.map((file, index) => (
                  <div key={`${file.name}-${index}`} className="flex items-center justify-between p-2 bg-primary/5 rounded-lg">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="material-symbols-outlined text-primary text-lg">draft</span>
                      <span className="text-sm text-white truncate">{file.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="p-1 text-gray-400 hover:text-red-400 rounded transition-colors shrink-0"
                    >
                      <span className="material-symbols-outlined text-lg">close</span>
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-auto">
                <label className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white font-medium py-3 px-6 rounded-full transition-colors cursor-pointer">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".docx,.xlsx,.pdf"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <span className="material-symbols-outlined text-[20px]">add</span>
                  <span>Add More Files</span>
                </label>
              </div>
            </>
          ) : markedFilesFromServer.length > 0 ? (
            // Existing marked file(s)
            <>
              <div className="flex items-start justify-between mb-4">
                <div className="size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl">rate_review</span>
                </div>
                <span className="text-xs font-medium uppercase tracking-wider text-primary">
                  Marked File{markedFilesFromServer.length > 1 ? "s" : ""}
                </span>
              </div>
              
              <div className="flex-1 space-y-2 mb-4">
                {markedFilesFromServer.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="material-symbols-outlined text-primary">draft</span>
                      <div className="min-w-0">
                        <p className="text-sm text-white truncate">{file.name}</p>
                        {file.size > 0 && <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>}
                      </div>
                    </div>
                    <a
                      href={file.url}
                      download={file.name}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 p-2 text-primary hover:bg-primary/20 rounded-full transition-colors"
                      title="Download"
                    >
                      <span className="material-symbols-outlined">download</span>
                    </a>
                  </div>
                ))}
              </div>
              
              <div className="mt-auto">
                {!isReviewed && (
                  <label className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white font-medium py-3 px-6 rounded-full transition-colors cursor-pointer">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".docx,.xlsx,.pdf"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <span className="material-symbols-outlined text-[20px]">upload</span>
                    <span>Replace Files</span>
                  </label>
                )}
              </div>
            </>
          ) : (
            // Upload new file(s)
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept=".docx,.xlsx,.pdf"
                multiple
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
                <h3 className="text-lg font-bold text-white mb-1">Upload Marked Files</h3>
                <p className="text-sm text-gray-400 mb-6 max-w-[200px] leading-snug text-center">
                  Drag & drop your marked files here (PDF, DOCX, XLSX)
                </p>
                <span className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-background-dark font-bold py-3 px-8 rounded-full transition-colors shadow-lg shadow-primary/20">
                  <span className="material-symbols-outlined text-[20px]">upload_file</span>
                  <span>Select Files</span>
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
