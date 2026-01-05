import Link from "next/link";
import { getMyAssignedReviews } from "@/lib/marker/actions";
import { getPaperLabel, getPaperColor } from "@/types/submission";

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getStatusBadge(status: string) {
  switch (status) {
    case "reviewed":
      return (
        <span className="inline-flex items-center gap-1.5 pl-1.5 pr-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
          <span className="material-symbols-outlined text-sm">check_circle</span>
          Reviewed
        </span>
      );
    case "under_review":
      return (
        <span className="inline-flex items-center gap-1.5 pl-1.5 pr-2.5 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
          <span className="material-symbols-outlined text-sm">hourglass_top</span>
          Under Review
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 pl-1.5 pr-2.5 py-1 rounded-full text-xs font-medium bg-gray-500/10 text-gray-400 border border-gray-500/20">
          <span className="material-symbols-outlined text-sm">pending</span>
          Pending
        </span>
      );
  }
}

function getStatusIndicatorColor(status: string) {
  switch (status) {
    case "reviewed":
      return "bg-primary";
    case "under_review":
      return "bg-yellow-500";
    default:
      return "bg-gray-500";
  }
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

export default async function MyAssignedReviewsPage() {
  const reviews = await getMyAssignedReviews();

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
              <li className="text-white font-medium">Assigned Reviews</li>
            </ol>
          </nav>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">My Assigned Reviews</h1>
          <p className="text-gray-400 max-w-2xl">
            Submissions you are currently reviewing or have completed.
          </p>
        </div>
      </header>

      {/* Empty State */}
      {reviews.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 px-4 bg-surface-dark rounded-2xl border border-white/5">
          <div className="bg-white/5 p-4 rounded-full mb-4">
            <span className="material-symbols-outlined text-4xl text-gray-400">
              assignment_turned_in
            </span>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No assigned reviews yet</h3>
          <p className="text-gray-400 text-center max-w-md mb-6">
            You haven&apos;t claimed any submissions for review. Browse the queue to find
            submissions to review.
          </p>
          <Link
            href="/marker/queue"
            className="bg-primary hover:bg-primary/90 text-background-dark font-bold py-3 px-6 rounded-full inline-flex items-center gap-2 transition-all"
          >
            <span className="material-symbols-outlined">rate_review</span>
            Browse Submissions
          </Link>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length > 0 && (
        <>
          {/* Table Header - Desktop */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 text-xs font-semibold uppercase tracking-wider text-gray-400">
            <div className="col-span-5">Paper & Question</div>
            <div className="col-span-4">Assigned Date</div>
            <div className="col-span-3">Review Status</div>
          </div>

          {/* Reviews */}
          <div className="flex flex-col gap-3">
            {reviews.map((review) => (
              <Link
                key={review.id}
                href={`/marker/reviews/${review.id}`}
                className="group relative bg-surface-dark rounded-xl p-4 md:px-6 md:py-5 border border-white/5 hover:border-primary/30 transition-all duration-200 cursor-pointer block"
              >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  {/* Paper & Question */}
                  <div className="md:col-span-5 flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 border ${getPaperBgColor(review.paper)}`}
                    >
                      {review.paper}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <h3 className="text-sm font-bold text-white truncate group-hover:text-primary transition-colors">
                        ACCA {review.paper} {getPaperLabel(review.paper).split("(")[0]}
                      </h3>
                      <p className="text-xs text-gray-400 truncate">
                        {review.question || review.title}
                      </p>
                    </div>
                  </div>

                  {/* Date */}
                  <div className="md:col-span-4 flex items-center gap-2 md:gap-0">
                    <span className="md:hidden text-xs font-medium text-gray-500 uppercase w-24">
                      Assigned:
                    </span>
                    <div className="flex items-center gap-2 text-gray-300 text-sm">
                      <span className="material-symbols-outlined text-lg text-gray-400">
                        calendar_today
                      </span>
                      {formatDate(review.updated_at || review.created_at)}
                    </div>
                  </div>

                  {/* Status */}
                  <div className="md:col-span-3 flex items-center gap-2 md:gap-0">
                    <span className="md:hidden text-xs font-medium text-gray-500 uppercase w-24">
                      Status:
                    </span>
                    {getStatusBadge(review.status)}
                  </div>
                </div>

                {/* Status Indicator Bar */}
                <div
                  className={`absolute left-0 top-4 bottom-4 w-1 rounded-r-full ${getStatusIndicatorColor(review.status)}`}
                />
              </Link>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between py-4">
            <p className="text-sm text-gray-400">
              Showing {reviews.length} result{reviews.length !== 1 ? "s" : ""}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
