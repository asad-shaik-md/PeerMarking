import { getUser } from "@/lib/auth/actions";
import { getSubmissionStats, getRecentSubmissions } from "@/lib/submissions/actions";
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
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
          Under Review
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-400">
          <span className="w-1.5 h-1.5 rounded-full bg-yellow-400"></span>
          Pending Review
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

export default async function StudentDashboard() {
  const user = await getUser();
  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Student";
  const stats = await getSubmissionStats();
  const recentSubmissions = await getRecentSubmissions();

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <header className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
            Welcome back, {userName}
          </h2>
          <p className="text-text-muted">Here is an overview of your peer marking activity.</p>
        </div>
      </header>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-surface-dark p-6 rounded-xl flex flex-col gap-4 relative overflow-hidden group border border-white/5">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-symbols-outlined text-4xl">inventory_2</span>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-text-muted text-sm font-medium">Total Submissions</p>
            <p className="text-4xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="flex items-center gap-1 text-xs text-primary font-medium">
            <span className="material-symbols-outlined text-sm">trending_up</span>
            <span>Keep submitting!</span>
          </div>
        </div>

        <div className="bg-surface-dark p-6 rounded-xl flex flex-col gap-4 relative overflow-hidden group border border-white/5">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-symbols-outlined text-4xl">pending_actions</span>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-text-muted text-sm font-medium">Pending Reviews</p>
            <p className="text-4xl font-bold text-white">{stats.pending + stats.underReview}</p>
          </div>
          <div className="flex items-center gap-1 text-xs text-yellow-500 font-medium">
            <span className="material-symbols-outlined text-sm">schedule</span>
            <span>Awaiting feedback</span>
          </div>
        </div>

        <div className="bg-surface-dark p-6 rounded-xl flex flex-col gap-4 relative overflow-hidden group border border-white/5">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-symbols-outlined text-4xl">grade</span>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-text-muted text-sm font-medium">Average Score</p>
            <p className="text-4xl font-bold text-white">
              {stats.averageScore !== null ? `${stats.averageScore}%` : "—"}
            </p>
          </div>
          {stats.averageScore !== null && (
            <div className="w-full bg-white/10 rounded-full h-1.5 mt-auto">
              <div
                className="bg-primary h-1.5 rounded-full"
                style={{ width: `${stats.averageScore}%` }}
              ></div>
            </div>
          )}
        </div>
      </section>

      {/* Recent Submissions Section */}
      <section className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-white">Recent Submissions</h3>
          <Link
            href="/student/submissions/new"
            className="bg-primary hover:bg-primary-dark text-background-dark font-bold py-3 px-6 rounded-full inline-flex items-center gap-2 transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40 transform hover:-translate-y-0.5"
          >
            <span className="material-symbols-outlined">add</span>
            Upload New Submission
          </Link>
        </div>

        <div className="bg-surface-dark rounded-xl overflow-hidden border border-white/5">
          {recentSubmissions.length === 0 ? (
            <div className="p-12 text-center">
              <div className="size-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-gray-500 text-3xl">inbox</span>
              </div>
              <h3 className="text-lg font-medium text-white mb-2">No submissions yet</h3>
              <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">
                Upload your first practice answer to get personalized feedback from qualified ACCA
                seniors.
              </p>
              <Link
                href="/student/submissions/new"
                className="inline-flex items-center gap-2 h-10 px-5 rounded-lg bg-white/5 text-white font-medium hover:bg-white/10 transition-colors border border-white/10"
              >
                <span className="material-symbols-outlined text-[18px]">upload_file</span>
                Upload Practice Answer
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 border-b border-white/5">
                    <th className="p-5 text-xs font-semibold uppercase tracking-wider text-text-muted">
                      Paper & Question
                    </th>
                    <th className="p-5 text-xs font-semibold uppercase tracking-wider text-text-muted">
                      Submitted Date
                    </th>
                    <th className="p-5 text-xs font-semibold uppercase tracking-wider text-text-muted">
                      Status
                    </th>
                    <th className="p-5 text-xs font-semibold uppercase tracking-wider text-text-muted text-right">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {recentSubmissions.map((submission) => (
                    <tr
                      key={submission.id}
                      className="group hover:bg-white/5 transition-colors"
                    >
                      <td className="p-5">
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 ${getPaperBgColor(submission.paper)}`}
                          >
                            {submission.paper}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-white">
                              ACCA {submission.paper}
                            </span>
                            <span className="text-xs text-slate-400">
                              {submission.question || submission.title}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-5">
                        <span className="text-sm text-slate-300">
                          {formatDate(submission.created_at)}
                        </span>
                      </td>
                      <td className="p-5">{getStatusBadge(submission.status)}</td>
                      <td className="p-5 text-right">
                        <Link
                          href={`/student/submissions/${submission.id}`}
                          className="text-slate-400 hover:text-primary transition-colors p-2 hover:bg-primary/10 rounded-lg inline-flex"
                          title={submission.status === "reviewed" ? "Download Feedback" : "View Details"}
                        >
                          <span className="material-symbols-outlined text-xl">
                            {submission.status === "reviewed" ? "download" : "visibility"}
                          </span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {recentSubmissions.length > 0 && (
          <div className="text-center">
            <Link
              href="/student/submissions"
              className="text-sm font-medium text-text-muted hover:text-white transition-colors inline-flex items-center gap-1"
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
