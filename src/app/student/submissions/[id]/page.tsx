import Link from "next/link";
import { notFound } from "next/navigation";
import { getSubmission, getFileDownloadUrl } from "@/lib/submissions/actions";
import { getPaperLabel } from "@/types/submission";

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
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffMinutes > 0) return `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""} ago`;
  return "Just now";
}

function getStatusBadge(status: string) {
  if (status === "reviewed") {
    return (
      <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 border border-primary/20">
        <span className="material-symbols-outlined text-[20px] text-primary">check_circle</span>
        <span className="font-bold text-lg text-primary">Reviewed</span>
      </div>
    );
  }

  if (status === "under_review") {
    return (
      <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-500/10 border border-blue-500/20">
        <span className="material-symbols-outlined text-[20px] text-blue-400">schedule</span>
        <span className="font-bold text-lg text-blue-400">Under Review</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-yellow-500/10 border border-yellow-500/20">
      <span className="material-symbols-outlined text-[20px] text-yellow-400 animate-pulse">
        hourglass_top
      </span>
      <span className="font-bold text-lg text-yellow-400">Pending Review</span>
    </div>
  );
}

export default async function SubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const submission = await getSubmission(id);

  if (!submission) {
    notFound();
  }

  // Get download URLs with ownership verification
  const originalDownloadUrl = await getFileDownloadUrl(submission.file_path, submission.id);
  const markedDownloadUrl = submission.marked_file_path
    ? await getFileDownloadUrl(submission.marked_file_path, submission.id)
    : null;

  return (
    <div className="w-full max-w-[1000px] mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 mb-8 text-sm">
        <Link
          href="/student/dashboard"
          className="text-gray-400 hover:text-primary transition-colors"
        >
          Dashboard
        </Link>
        <span className="material-symbols-outlined text-[16px] text-gray-500">chevron_right</span>
        <Link
          href="/student/submissions"
          className="text-gray-400 hover:text-primary transition-colors"
        >
          Submissions
        </Link>
        <span className="material-symbols-outlined text-[16px] text-gray-500">chevron_right</span>
        <span className="text-white font-medium">#{submission.id.slice(0, 8)}</span>
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
              <span>{formatDate(submission.created_at)}</span>
            </div>
          </div>
        </div>
        <div className="flex-shrink-0">{getStatusBadge(submission.status)}</div>
      </section>

      {/* Additional Notes from Student */}
      {submission.notes && (
        <section className="bg-surface-dark border border-white/10 rounded-lg p-6 mb-8">
          <div className="flex items-center gap-3 mb-3">
            <span className="material-symbols-outlined text-gray-400">note</span>
            <h3 className="text-lg font-bold">Your Notes</h3>
          </div>
          <p className="text-gray-300 leading-relaxed">{submission.notes}</p>
        </section>
      )}

      {/* File Download Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {/* Original File */}
        <div className="group relative bg-surface-dark border border-white/10 rounded-lg p-6 flex flex-col transition-all hover:border-gray-600">
          <div className="flex items-start justify-between mb-4">
            <div className="size-12 rounded-full bg-white/5 flex items-center justify-center text-gray-300">
              <span className="material-symbols-outlined text-2xl">description</span>
            </div>
            <span className="text-xs font-medium uppercase tracking-wider text-gray-500">
              Original
            </span>
          </div>
          <h3 className="text-lg font-bold text-white mb-1 truncate">{submission.file_name}</h3>
          <p className="text-sm text-gray-400 mb-8">
            {submission.file_size ? formatFileSize(submission.file_size) : "Unknown size"} •
            Uploaded {getRelativeTime(submission.created_at)}
          </p>
          <div className="mt-auto">
            {originalDownloadUrl.url ? (
              <a
                href={originalDownloadUrl.url}
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

        {/* Marked File */}
        <div
          className={`group relative bg-surface-dark rounded-lg p-6 flex flex-col ${
            submission.marked_file_path
              ? "border border-primary/20 shadow-[0_0_20px_rgba(56,224,123,0.05)]"
              : "border border-white/10 border-dashed"
          }`}
        >
          <div className="flex items-start justify-between mb-4">
            <div
              className={`size-12 rounded-full flex items-center justify-center ${
                submission.marked_file_path
                  ? "bg-primary/10 text-primary"
                  : "bg-white/5 text-gray-500"
              }`}
            >
              <span className="material-symbols-outlined text-2xl">rate_review</span>
            </div>
            <span
              className={`text-xs font-medium uppercase tracking-wider ${
                submission.marked_file_path ? "text-primary" : "text-gray-500"
              }`}
            >
              Marked
            </span>
          </div>

          {submission.marked_file_path && submission.marked_file_name ? (
            <>
              <h3 className="text-lg font-bold text-white mb-1 truncate">
                {submission.marked_file_name}
              </h3>
              <p className="text-sm text-gray-400 mb-8">
                Reviewed{" "}
                {submission.reviewed_at
                  ? getRelativeTime(submission.reviewed_at)
                  : "recently"}
              </p>
              <div className="mt-auto">
                {markedDownloadUrl?.url ? (
                  <a
                    href={markedDownloadUrl.url}
                    download={submission.marked_file_name}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-background-dark font-bold py-3 px-6 rounded-full transition-colors shadow-lg shadow-primary/20"
                  >
                    <span className="material-symbols-outlined text-[20px]">download</span>
                    <span>Download Marked File</span>
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
            </>
          ) : (
            <>
              <h3 className="text-lg font-bold text-gray-500 mb-1">Not yet marked</h3>
              <p className="text-sm text-gray-500 mb-8">
                Your submission is awaiting review from a marker.
              </p>
              <div className="mt-auto">
                <button
                  disabled
                  className="w-full flex items-center justify-center gap-2 bg-white/5 text-gray-500 font-medium py-3 px-6 rounded-full cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-[20px]">hourglass_empty</span>
                  <span>Awaiting Review</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Marker's Note */}
      {submission.marker_notes && (
        <section className="bg-surface-dark border border-white/10 rounded-lg p-8 mb-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="material-symbols-outlined text-gray-400">format_quote</span>
            <h3 className="text-lg font-bold">Marker&apos;s Feedback</h3>
          </div>
          <div className="relative pl-4 border-l-2 border-primary/40">
            <p className="text-gray-300 leading-relaxed text-lg whitespace-pre-wrap">
              {submission.marker_notes}
            </p>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-white/10 pt-8 pb-12">
        <div className="flex gap-6">
          <Link
            href="/student/submissions"
            className="text-sm text-gray-400 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Back to Submissions
          </Link>
        </div>
        <p className="text-sm text-gray-600">Submission ID: {submission.id}</p>
      </footer>
    </div>
  );
}
