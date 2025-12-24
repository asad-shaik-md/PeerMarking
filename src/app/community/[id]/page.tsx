import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getCommunitySubmissionDetail } from "@/lib/profile/actions";
import { getUser, getUserRole } from "@/lib/auth/actions";
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

function getStatusBadge(score?: number | null) {
  if (score !== null && score !== undefined) {
    const passed = score >= 50;
    return (
      <div
        className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full backdrop-blur-sm ${
          passed
            ? "bg-primary/10 border border-primary/20"
            : "bg-red-500/10 border border-red-500/20"
        }`}
      >
        <span
          className={`material-symbols-outlined text-[20px] ${
            passed ? "text-primary" : "text-red-400"
          }`}
        >
          {passed ? "check_circle" : "cancel"}
        </span>
        <span className={`font-bold text-lg ${passed ? "text-primary" : "text-red-400"}`}>
          {passed ? "Pass" : "Needs Improvement"} ({score}%)
        </span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 border border-primary/20">
      <span className="material-symbols-outlined text-[20px] text-primary">check_circle</span>
      <span className="font-bold text-lg text-primary">Reviewed</span>
    </div>
  );
}

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CommunitySubmissionDetailPage({ params }: Props) {
  const { id } = await params;
  const user = await getUser();
  const role = await getUserRole();

  if (!user) {
    redirect("/login");
  }

  const submission = await getCommunitySubmissionDetail(id);

  if (!submission) {
    notFound();
  }

  const dashboardLink = role === "marker" ? "/marker/dashboard" : "/student/dashboard";

  return (
    <div className="min-h-screen bg-background-dark">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background-dark/80 backdrop-blur-md">
        <div className="flex h-16 items-center justify-between px-6 lg:px-10 max-w-[1440px] mx-auto w-full">
          <div className="flex items-center gap-6">
            <Link href={dashboardLink} className="flex items-center gap-3">
              <div className="flex items-center justify-center size-8 rounded-full bg-primary text-background-dark">
                <span className="material-symbols-outlined text-[20px]">school</span>
              </div>
              <span className="text-lg font-bold tracking-tight text-white">PeerMarking</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href={dashboardLink}
                className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
              >
                Dashboard
              </Link>
              {role === "student" && (
                <Link
                  href="/student/submissions"
                  className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
                >
                  My Submissions
                </Link>
              )}
              <Link
                href="/community"
                className="text-sm font-medium text-white transition-colors"
              >
                Community
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span className="material-symbols-outlined text-[20px]">person</span>
              <span className="hidden sm:inline">{user.email}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="w-full max-w-[1000px] mx-auto px-6 lg:px-10 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 mb-8 text-sm">
          <Link
            href={dashboardLink}
            className="text-gray-400 hover:text-primary transition-colors"
          >
            Dashboard
          </Link>
          <span className="material-symbols-outlined text-[16px] text-gray-500">chevron_right</span>
          <Link
            href="/community"
            className="text-gray-400 hover:text-primary transition-colors"
          >
            Community
          </Link>
          <span className="material-symbols-outlined text-[16px] text-gray-500">chevron_right</span>
          <span className="text-white font-medium">Submission #{submission.id.slice(0, 4).toUpperCase()}</span>
        </nav>

        {/* Header */}
        <section className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
          <div className="flex flex-col gap-3 max-w-2xl">
            <h1 className="text-3xl md:text-4xl font-bold leading-tight text-white">
              {submission.title}
            </h1>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">person</span>
                <span>Submitted by: <span className="text-white">Anonymous</span></span>
              </div>
              {submission.marker_id && (
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-primary">verified</span>
                  <span>Marked by: <Link href={`/markers/${submission.marker_id}`} className="text-primary hover:underline">Senior Marker</Link></span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                <span>{formatDate(submission.created_at)}</span>
              </div>
            </div>
          </div>
          <div className="flex-shrink-0">{getStatusBadge(submission.score)}</div>
        </section>

        {/* Paper & Question Info */}
        <section className="bg-surface-dark border border-white/10 rounded-lg p-6 mb-8">
          <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-white/5 flex items-center justify-center">
                <span className="material-symbols-outlined text-gray-400">description</span>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Paper</p>
                <p className="text-white font-medium">{getPaperLabel(submission.paper)}</p>
              </div>
            </div>
            {submission.question && (
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-lg bg-white/5 flex items-center justify-center">
                  <span className="material-symbols-outlined text-gray-400">quiz</span>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Question</p>
                  <p className="text-white font-medium">{submission.question}</p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* File Download Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {/* Original File */}
          <div className="group relative bg-surface-dark border border-white/10 rounded-lg p-6 flex flex-col">
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
              <button
                disabled
                className="w-full flex items-center justify-center gap-2 bg-white/5 text-gray-500 font-medium py-3 px-6 rounded-full cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-[20px]">lock</span>
                <span>Download Original</span>
              </button>
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
                  Uploaded{" "}
                  {submission.reviewed_at
                    ? getRelativeTime(submission.reviewed_at)
                    : "recently"}
                </p>
                <div className="mt-auto">
                  <button
                    disabled
                    className="w-full flex items-center justify-center gap-2 bg-primary/20 text-primary/60 font-bold py-3 px-6 rounded-full cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined text-[20px]">lock</span>
                    <span>Download Marked File</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-lg font-bold text-gray-500 mb-1">No marked file</h3>
                <p className="text-sm text-gray-500 mb-8">
                  Marker provided feedback without uploading a marked file.
                </p>
                <div className="mt-auto">
                  <button
                    disabled
                    className="w-full flex items-center justify-center gap-2 bg-white/5 text-gray-500 font-medium py-3 px-6 rounded-full cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined text-[20px]">block</span>
                    <span>Not Available</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Marker's Note */}
        {submission.marker_notes && (
          <section className="bg-surface-dark border border-white/10 rounded-lg p-8 mb-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-gray-400">format_quote</span>
              <h3 className="text-lg font-bold text-white">Marker&apos;s Note</h3>
            </div>
            <div className="relative pl-4 border-l-2 border-primary/40">
              <p className="text-gray-300 leading-relaxed text-lg whitespace-pre-wrap">
                &quot;{submission.marker_notes}&quot;
              </p>
            </div>
            {submission.marker_id && (
              <div className="mt-4 flex items-center gap-2">
                <div className="size-8 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center">
                  <span className="text-xs font-bold text-white">SM</span>
                </div>
                <span className="text-sm text-gray-400">
                  — <Link href={`/markers/${submission.marker_id}`} className="text-primary hover:underline">Senior Marker</Link>
                </span>
              </div>
            )}
          </section>
        )}

        {/* No feedback message */}
        {!submission.marker_notes && (
          <section className="bg-surface-dark border border-white/10 rounded-lg p-8 mb-10 text-center">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
              <span className="material-symbols-outlined text-2xl text-gray-400">
                feedback
              </span>
            </div>
            <p className="text-gray-400">
              No detailed feedback available for this submission.
            </p>
          </section>
        )}

        {/* Request Re-mark info */}
        <section className="bg-primary/5 border border-primary/20 rounded-lg p-6 mb-10">
          <div className="flex items-start gap-4">
            <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-primary">lightbulb</span>
            </div>
            <div>
              <h3 className="font-bold text-white mb-2">Learning from Community Submissions</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Reviewing peer submissions and their feedback helps you understand marking criteria 
                and improve your exam technique. Note the feedback patterns and apply these insights 
                to your own practice answers.
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-white/10 pt-8 pb-12">
          <div className="flex gap-6">
            <Link
              href="/community"
              className="text-sm text-gray-400 hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              Back to Community
            </Link>
            <button
              disabled
              className="text-sm text-gray-600 flex items-center gap-1.5 cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-[16px]">refresh</span>
              Request Re-mark
            </button>
          </div>
          <p className="text-sm text-gray-600">Submission ID: {submission.id.slice(0, 4).toUpperCase()}-ACCA-{submission.paper}</p>
        </footer>
      </main>
    </div>
  );
}
