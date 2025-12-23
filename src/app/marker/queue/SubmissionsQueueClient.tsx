"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Submission } from "@/types/submission";
import { getPaperLabel, getPaperColor } from "@/types/submission";
import { acceptReview } from "@/lib/marker/actions";

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getPaperBgColor(paper: string): string {
  const color = getPaperColor(paper);
  const colors: Record<string, string> = {
    blue: "bg-blue-500/20 text-blue-400 border-blue-500/10",
    purple: "bg-purple-500/20 text-purple-400 border-purple-500/10",
    cyan: "bg-cyan-500/20 text-cyan-400 border-cyan-500/10",
    orange: "bg-orange-500/20 text-orange-400 border-orange-500/10",
    red: "bg-red-500/20 text-red-400 border-red-500/10",
    green: "bg-green-500/20 text-green-400 border-green-500/10",
    teal: "bg-teal-500/20 text-teal-400 border-teal-500/10",
    indigo: "bg-indigo-500/20 text-indigo-400 border-indigo-500/10",
    pink: "bg-pink-500/20 text-pink-400 border-pink-500/10",
    rose: "bg-rose-500/20 text-rose-400 border-rose-500/10",
    amber: "bg-amber-500/20 text-amber-400 border-amber-500/10",
    gray: "bg-gray-500/20 text-gray-400 border-gray-500/10",
  };
  return colors[color] || colors.gray;
}

interface SubmissionRowProps {
  submission: Submission;
}

function SubmissionRow({ submission }: SubmissionRowProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleAcceptReview = () => {
    setError(null);
    startTransition(async () => {
      const result = await acceptReview(submission.id);
      if (result.error) {
        setError(result.error);
      } else {
        router.push(`/marker/reviews/${submission.id}`);
      }
    });
  };

  return (
    <div className="group relative bg-surface-dark rounded-xl p-4 md:px-6 md:py-5 border border-white/5 hover:border-yellow-500/30 transition-all duration-200">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Paper & Question */}
        <div className="md:col-span-5 flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 border ${getPaperBgColor(submission.paper)}`}
          >
            {submission.paper}
          </div>
          <div className="flex flex-col min-w-0">
            <h3 className="text-sm font-bold text-white truncate">
              ACCA {submission.paper} {getPaperLabel(submission.paper).split("(")[0]}
            </h3>
            <p className="text-xs text-gray-400 truncate">
              {submission.question || submission.title}
            </p>
          </div>
        </div>

        {/* Date */}
        <div className="md:col-span-3 flex items-center gap-2 md:gap-0">
          <span className="md:hidden text-xs font-medium text-gray-500 uppercase w-20">
            Date:
          </span>
          <div className="flex items-center gap-2 text-gray-300 text-sm">
            <span className="material-symbols-outlined text-lg text-gray-400">calendar_today</span>
            {formatDate(submission.created_at)}
          </div>
        </div>

        {/* Status */}
        <div className="md:col-span-2 flex items-center gap-2 md:gap-0">
          <span className="md:hidden text-xs font-medium text-gray-500 uppercase w-20">
            Status:
          </span>
          <span className="inline-flex items-center gap-1.5 pl-1.5 pr-2.5 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
            <span className="material-symbols-outlined text-sm animate-pulse">hourglass_top</span>
            Pending
          </span>
        </div>

        {/* Action */}
        <div className="md:col-span-2 flex justify-end gap-2">
          <button
            onClick={handleAcceptReview}
            disabled={isPending}
            className="md:w-full bg-primary hover:bg-primary/90 disabled:bg-primary/50 disabled:cursor-not-allowed text-background-dark py-2 px-4 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transform hover:-translate-y-0.5"
            title="Review Submission"
          >
            {isPending ? (
              <span className="material-symbols-outlined text-lg animate-spin">
                progress_activity
              </span>
            ) : (
              <span className="material-symbols-outlined text-lg">rate_review</span>
            )}
            <span className="hidden lg:inline">Review</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-3 text-sm text-red-400 bg-red-500/10 rounded-lg p-2">{error}</div>
      )}

      {/* Status Indicator Bar */}
      <div className="absolute left-0 top-4 bottom-4 w-1 rounded-r-full bg-yellow-500" />
    </div>
  );
}

interface SubmissionsQueueClientProps {
  submissions: Submission[];
}

export default function SubmissionsQueueClient({ submissions }: SubmissionsQueueClientProps) {
  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex flex-col gap-2">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-2 text-sm text-gray-400">
              <li>
                <Link href="/marker/dashboard" className="hover:text-primary transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <span className="material-symbols-outlined text-xs">chevron_right</span>
              </li>
              <li className="text-white font-medium">Review Queue</li>
            </ol>
          </nav>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Submissions to Review</h1>
          <p className="text-gray-400 max-w-2xl">
            Browse available student submissions and assign yourself to review answers. Filter by
            paper or topic to find your expertise.
          </p>
        </div>
      </header>

      {/* Filters */}
      <div className="bg-surface-dark p-2 rounded-2xl border border-white/5 flex flex-col md:flex-row items-center gap-2">
        <div className="relative flex-1 w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            search
          </span>
          <input
            className="w-full pl-10 pr-4 py-2.5 bg-transparent border-none text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-0"
            placeholder="Search by paper, question or student ID..."
            type="text"
          />
        </div>
        <div className="w-px h-8 bg-white/10 hidden md:block" />
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          <select className="flex-1 md:w-auto bg-white/5 border-none rounded-xl text-sm font-medium text-gray-300 py-2.5 pl-4 pr-8 focus:ring-2 focus:ring-primary/50 cursor-pointer min-w-[120px]">
            <option>All Papers</option>
            <option value="PM">PM (F5)</option>
            <option value="FM">FM (F9)</option>
            <option value="FR">FR (F7)</option>
            <option value="AA">AA (F8)</option>
            <option value="TX">TX (F6)</option>
            <option value="SBL">SBL</option>
            <option value="SBR">SBR</option>
            <option value="AFM">AFM</option>
            <option value="APM">APM</option>
            <option value="ATX">ATX</option>
            <option value="AAA">AAA</option>
          </select>
          <select className="flex-1 md:w-auto bg-white/5 border-none rounded-xl text-sm font-medium text-gray-300 py-2.5 pl-4 pr-8 focus:ring-2 focus:ring-primary/50 cursor-pointer min-w-[140px]">
            <option>Most Recent</option>
            <option>Oldest First</option>
          </select>
        </div>
      </div>

      {/* Empty State */}
      {submissions.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 px-4 bg-surface-dark rounded-2xl border border-white/5">
          <div className="bg-white/5 p-4 rounded-full mb-4">
            <span className="material-symbols-outlined text-4xl text-gray-400">inbox</span>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No submissions to review</h3>
          <p className="text-gray-400 text-center max-w-md mb-6">
            There are no pending submissions available for review at the moment. Check back later!
          </p>
          <Link
            href="/marker/dashboard"
            className="bg-white/5 hover:bg-white/10 text-white font-medium py-3 px-6 rounded-full inline-flex items-center gap-2 transition-all border border-white/10"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            Back to Dashboard
          </Link>
        </div>
      )}

      {/* Submissions List */}
      {submissions.length > 0 && (
        <>
          {/* Table Header - Desktop */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 text-xs font-semibold uppercase tracking-wider text-gray-400">
            <div className="col-span-5">Paper & Question</div>
            <div className="col-span-3">Submitted Date</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2 text-right">Action</div>
          </div>

          {/* Submissions */}
          <div className="flex flex-col gap-3">
            {submissions.map((submission) => (
              <SubmissionRow key={submission.id} submission={submission} />
            ))}
          </div>

          {/* Pagination info */}
          <div className="flex items-center justify-between py-4">
            <p className="text-sm text-gray-400">
              Showing {submissions.length} pending submission
              {submissions.length !== 1 ? "s" : ""}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
