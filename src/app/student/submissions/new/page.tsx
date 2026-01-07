"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSubmission } from "@/lib/submissions/actions";
import { ACCA_PAPERS } from "@/types/submission";

export default function UploadAnswerPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  const validateFile = (file: File): string | null => {
    const allowedTypes = [
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];
    
    if (!allowedTypes.includes(file.type)) {
      return `"${file.name}" is not a valid file type. Only Word (.docx) or Excel (.xlsx) files are allowed.`;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      return `"${file.name}" is too large. File size must be less than 10MB.`;
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
      setError(errors[0]); // Show first error
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

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      addFiles(files);
    }
  }, [selectedFiles]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (selectedFiles.length === 0) {
      setError("Please select at least one file to upload.");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    // Add all files to formData
    selectedFiles.forEach((file, index) => {
      formData.append(`file_${index}`, file);
    });
    formData.set("fileCount", selectedFiles.length.toString());
    
    try {
      const result = await createSubmission(formData);
      
      if (result.error) {
        setError(result.error);
        setIsSubmitting(false);
        return;
      }
      
      router.push("/student/submissions");
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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

  return (
    <div className="flex flex-col items-center py-4">
      <div className="w-full max-w-[960px] flex flex-col gap-6">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-2">
          <ol className="flex items-center gap-2 text-sm text-gray-400">
            <li>
              <Link href="/student/dashboard" className="hover:text-primary transition-colors">
                Dashboard
              </Link>
            </li>
            <li>
              <span className="material-symbols-outlined text-base">chevron_right</span>
            </li>
            <li className="font-medium text-white">Submit Your Answer</li>
          </ol>
        </nav>

        {/* Header */}
        <div className="flex flex-col gap-3 py-2">
          <h1 className="text-3xl md:text-4xl font-black leading-tight tracking-tight">
            Submit Your Answer
          </h1>
          <p className="text-gray-400 text-base font-normal leading-normal max-w-2xl">
            Upload your attempt for peer review. Ensure your file is anonymous before uploading. 
            You will receive feedback from at least two peers within 24 hours.
          </p>
        </div>

        {/* Form */}
        <form 
          onSubmit={handleSubmit}
          className="bg-surface-dark/50 rounded-lg p-6 md:p-10 border border-white/10 flex flex-col gap-8"
        >
          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Title and Paper Selection */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-8 flex flex-col gap-2">
              <label 
                htmlFor="title"
                className="text-sm font-semibold tracking-wide uppercase text-gray-400 pl-1"
              >
                Submission Name
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                className="w-full appearance-none rounded-full bg-surface-dark border border-white/10 h-14 px-5 text-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-white placeholder-gray-500"
                placeholder="e.g. SBR Sep 2024 Q2"
              />
            </div>

            <div className="md:col-span-4 flex flex-col gap-2">
              <label 
                htmlFor="paper"
                className="text-sm font-semibold tracking-wide uppercase text-gray-400 pl-1"
              >
                ACCA Paper
              </label>
              <select
                id="paper"
                name="paper"
                required
                className="w-full appearance-none rounded-full bg-surface-dark border border-white/10 h-14 px-5 pr-10 text-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-white"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                  backgroundPosition: "right 1rem center",
                  backgroundRepeat: "no-repeat",
                  backgroundSize: "1.5rem",
                }}
                defaultValue=""
              >
                <option value="" disabled>Select Paper</option>
                {ACCA_PAPERS.map((paper) => (
                  <option key={paper.value} value={paper.value}>
                    {paper.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* File Upload */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold tracking-wide uppercase text-gray-400 pl-1">
                File Upload {selectedFiles.length > 0 && `(${selectedFiles.length} file${selectedFiles.length > 1 ? 's' : ''})`}
              </label>
              {selectedFiles.length > 0 && (
                <button
                  type="button"
                  onClick={clearAllFiles}
                  className="text-xs text-red-400 hover:text-red-300 transition-colors"
                >
                  Clear all
                </button>
              )}
            </div>
            
            {/* Selected Files List */}
            {selectedFiles.length > 0 && (
              <div className="space-y-2 mb-2">
                {selectedFiles.map((file, index) => (
                  <div 
                    key={`${file.name}-${index}`}
                    className="flex items-center justify-between bg-primary/5 border border-primary/20 rounded-xl p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/20 p-2 rounded-full text-primary">
                        <span className="material-symbols-outlined text-xl">description</span>
                      </div>
                      <div>
                        <p className="font-medium text-white text-sm">{file.name}</p>
                        <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-full transition-colors"
                    >
                      <span className="material-symbols-outlined text-xl">close</span>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Drop Zone / Add More Button */}
            <div 
              className={`relative group cursor-pointer transition-all duration-300 ${
                isDragOver ? "scale-[1.01]" : ""
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                name="file"
                accept=".docx,.xlsx"
                multiple
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              
              <div 
                className={`flex flex-col items-center justify-center w-full rounded-xl border-2 border-dashed transition-all duration-300 ${
                  selectedFiles.length > 0 ? "h-24 py-4" : "h-64"
                } ${
                  isDragOver 
                    ? "border-primary bg-primary/10" 
                    : "border-white/20 bg-surface-dark group-hover:bg-primary/5 group-hover:border-primary"
                }`}
              >
                <div className="flex flex-col items-center justify-center text-center px-4">
                  {selectedFiles.length > 0 ? (
                    <>
                      <div className="flex items-center gap-2 text-primary">
                        <span className="material-symbols-outlined text-2xl">add_circle</span>
                        <span className="font-medium">Add more files</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">Click or drag files here</p>
                    </>
                  ) : (
                    <>
                      <div 
                        className={`bg-white/5 p-4 rounded-full mb-4 transition-all duration-300 ${
                          isDragOver 
                            ? "text-primary scale-110" 
                            : "text-gray-400 group-hover:text-primary group-hover:scale-110"
                        }`}
                      >
                        <span className="material-symbols-outlined text-4xl">cloud_upload</span>
                      </div>
                      <p className="mb-2 text-lg font-medium text-white">
                        <span className="font-bold text-primary hover:underline">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-sm text-gray-400">
                        Word (.docx) or Excel (.xlsx) files only
                      </p>
                      <p className="mt-4 text-xs font-semibold text-gray-500">
                        Maximum 10MB per file • Multiple files allowed
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Question Number */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-end pl-1">
              <label 
                htmlFor="question"
                className="text-sm font-semibold tracking-wide uppercase text-gray-400"
              >
                Question Number
              </label>
              <span className="text-xs text-gray-500">Optional</span>
            </div>
            <input
              id="question"
              name="question"
              type="text"
              className="w-full appearance-none rounded-full bg-surface-dark border border-white/10 h-14 px-5 text-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-white placeholder-gray-500"
              placeholder="e.g. Question 2"
            />
          </div>

          {/* Additional Context */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-end pl-1">
              <label 
                htmlFor="notes"
                className="text-sm font-semibold tracking-wide uppercase text-gray-400"
              >
                Additional Context
              </label>
              <span className="text-xs text-gray-500">Optional</span>
            </div>
            <textarea
              id="notes"
              name="notes"
              className="w-full min-h-[120px] rounded-lg bg-surface-dark border border-white/10 p-4 text-base placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-white resize-y"
              placeholder="What are you unsure about? e.g., I struggled with the Net Present Value calculation in part B..."
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10">
            <Link
              href="/student/dashboard"
              className="text-sm font-bold text-gray-400 hover:text-white transition-colors py-3 px-6 rounded-full hover:bg-white/5"
            >
              Cancel Upload
            </Link>
            <button
              type="submit"
              disabled={isSubmitting || selectedFiles.length === 0}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 disabled:bg-primary/50 disabled:cursor-not-allowed text-background-dark font-bold text-base py-3 px-8 rounded-full transition-all active:scale-95 shadow-[0_0_20px_rgba(56,224,123,0.3)]"
            >
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <span>Submit for Marking</span>
                  <span className="material-symbols-outlined text-xl font-bold">arrow_forward</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
