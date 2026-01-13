import { getUser } from "@/lib/auth/actions";
import { getMarkerStats, getRecentAssignedReviews } from "@/lib/marker/actions";
import { getPaperColor } from "@/types/submission";
import Link from "next/link";

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getStatusBadge(status: string) {
  switch (status) {
    case "reviewed":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary">
          <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
          Reviewed
        </span>
      );
    case "under_review":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-400">
          <span className="w-1.5 h-1.5 rounded-full bg-yellow-400"></span>
          Pending Review
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gray-500/10 text-gray-400">
          <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
          Pending
        </span>
      );
  }
}

function getPaperBgColor(paper: string): string {
  const color = getPaperColor(paper);
  const colors: Record<string, string> = {
    blue: "bg-blue-500/20 text-blue-500",
    purple: "bg-purple-500/20 text-purple-500",
    cyan: "bg-cyan-500/20 text-cyan-500",
    orange: "bg-orange-500/20 text-orange-500",
    red: "bg-red-500/20 text-red-500",
    green: "bg-green-500/20 text-green-500",
    teal: "bg-teal-500/20 text-teal-500",
    indigo: "bg-indigo-500/20 text-indigo-500",
    pink: "bg-pink-500/20 text-pink-500",
    rose: "bg-rose-500/20 text-rose-500",
    amber: "bg-amber-500/20 text-amber-500",
    gray: "bg-gray-500/20 text-gray-500",
  };
  return colors[color] || colors.gray;
}

export default async function MarkerDashboard() {
  const user = await getUser();
  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Marker";
  const stats = await getMarkerStats();
  const recentReviews = await getRecentAssignedReviews();

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <header className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
            Welcome back, {userName}
          </h2>
          <p className="text-gray-400">Here is an overview of your peer marking activity.</p>
        </div>
      </header>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-surface-dark p-6 rounded-xl flex flex-col gap-4 relative overflow-hidden group border border-white/5">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-symbols-outlined text-4xl">inventory_2</span>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-gray-400 text-sm font-medium">Submissions Under Review</p>
            <p className="text-4xl font-bold text-white">{stats.assignedReviews}</p>
          </div>
          <div className="flex items-center gap-1 text-xs text-primary font-medium">
            <span className="material-symbols-outlined text-sm">trending_up</span>
            <span>Active reviews</span>
          </div>
        </div>

        <div className="bg-surface-dark p-6 rounded-xl flex flex-col gap-4 relative overflow-hidden group border border-white/5">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-symbols-outlined text-4xl">task_alt</span>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-gray-400 text-sm font-medium">Total Submissions Reviewed</p>
            <p className="text-4xl font-bold text-white">{stats.completedReviews}</p>
          </div>
          <div className="flex items-center gap-1 text-xs text-yellow-500 font-medium">
            <span className="material-symbols-outlined text-sm">history</span>
            <span>All time</span>
          </div>
        </div>
      </section>

      {/* Assigned to Me Section */}
      <section className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-xl font-bold text-white">Assigned to Me</h3>
          <Link
            href="/marker/queue"
            className="bg-primary hover:bg-primary/90 text-background-dark font-bold py-3 px-5 md:px-6 rounded-full inline-flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40 transform hover:-translate-y-0.5 text-sm md:text-base"
          >
            <span className="hidden sm:inline">Submissions to Review</span>
            <span className="sm:hidden">Review Queue</span>
          </Link>
        </div>

        <div className="bg-surface-dark rounded-xl overflow-hidden border border-white/5">
          {recentReviews.length === 0 ? (
            <div className="p-12 text-center">
              <div className="size-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-gray-500 text-3xl">inbox</span>
              </div>
              <h3 className="text-lg font-medium text-white mb-2">No assigned reviews</h3>
              <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">
                Browse available submissions and start reviewing to help students improve.
              </p>
              <Link
                href="/marker/queue"
                className="inline-flex items-center gap-2 h-10 px-5 rounded-lg bg-white/5 text-white font-medium hover:bg-white/10 transition-colors border border-white/10"
              >
                <span className="material-symbols-outlined text-[18px]">rate_review</span>
                Browse Submissions
              </Link>
            </div>
          ) : (
            <>
            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-white/5">
              {recentReviews.map((review) => (
                <Link
                  key={review.id}
                  href={`/marker/reviews/${review.id}`}
                  className="flex items-center gap-4 p-4 hover:bg-white/5 transition-colors"
                >
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 ${getPaperBgColor(review.paper)}`}
                  >
                    {review.paper}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">
                      ACCA {review.paper}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {review.question || review.title}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-500">{formatDate(review.created_at)}</span>
                      {getStatusBadge(review.status)}
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-gray-400">
                    chevron_right
                  </span>
                </Link>
              ))}
            </div>
            
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 border-b border-white/5">
                    <th className="p-5 text-xs font-semibold uppercase tracking-wider text-gray-400">
                      Paper & Question
                    </th>
                    <th className="p-5 text-xs font-semibold uppercase tracking-wider text-gray-400">
                      Submitted Date
                    </th>
                    <th className="p-5 text-xs font-semibold uppercase tracking-wider text-gray-400">
                      Status
                    </th>
                    <th className="p-5 text-xs font-semibold uppercase tracking-wider text-gray-400 text-right">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {recentReviews.map((review) => (
                    <tr key={review.id} className="group hover:bg-white/5 transition-colors">
                      <td className="p-5">
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 ${getPaperBgColor(review.paper)}`}
                          >
                            {review.paper}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-white">
                              ACCA {review.paper}
                            </span>
                            <span className="text-xs text-gray-400">
                              {review.question || review.title}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-5">
                        <span className="text-sm text-gray-300">
                          {formatDate(review.created_at)}
                        </span>
                      </td>
                      <td className="p-5">{getStatusBadge(review.status)}</td>
                      <td className="p-5 text-right">
                        <Link
                          href={`/marker/reviews/${review.id}`}
                          className="text-gray-400 hover:text-primary transition-colors p-2 hover:bg-primary/10 rounded-lg inline-flex"
                          title={review.status === "reviewed" ? "View Review" : "Continue Review"}
                        >
                          <span className="material-symbols-outlined text-xl">
                            {review.status === "reviewed" ? "download" : "visibility"}
                          </span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            </>
          )}
        </div>

        {recentReviews.length > 0 && (
          <div className="text-center">
            <Link
              href="/marker/reviews"
              className="text-sm font-medium text-gray-400 hover:text-white transition-colors inline-flex items-center gap-1"
            >
              View all submissions
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
