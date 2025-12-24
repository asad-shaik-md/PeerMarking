import { redirect } from "next/navigation";
import Link from "next/link";
import { getStudentProfile } from "@/lib/profile/actions";
import { getPaperColor } from "@/types/submission";

export default async function StudentProfilePage() {
  const profile = await getStudentProfile();

  if (!profile) {
    redirect("/login");
  }

  const joinedDate = new Date(profile.createdAt).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });

  // Default papers - in production, this would come from user settings
  const selectedPapers = ["PM", "FM", "AA", "TX"];

  return (
    <div className="flex flex-col gap-8 pb-20">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-[#9eb7a8]">
        <Link href="/student/dashboard" className="hover:text-primary transition-colors">
          Dashboard
        </Link>
        <span className="material-symbols-outlined text-xs">chevron_right</span>
        <span className="text-white font-medium">Student Profile</span>
      </div>

      {/* Profile Header */}
      <div className="bg-surface-dark p-6 md:p-8 rounded-2xl border border-white/5 relative overflow-hidden">
        {/* Active badge */}
        <div className="absolute top-6 right-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            Active
          </span>
        </div>

        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10">
          {/* Avatar */}
          <div className="relative group">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border-4 border-white/5 flex items-center justify-center">
              <span className="text-4xl md:text-5xl font-bold text-primary">
                {profile.fullName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
              </span>
            </div>
          </div>

          {/* Profile Info */}
          <div className="flex-1 text-center md:text-left flex flex-col gap-3">
            <div>
              <h1 className="text-3xl font-bold text-white">{profile.fullName}</h1>
              <p className="text-slate-400 font-medium">ACCA Student • ID: {profile.id.slice(0, 8).toUpperCase()}</p>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-3 md:gap-6 text-sm text-slate-300 mt-1">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-400">mail</span>
                {profile.email}
              </div>
              <div className="hidden md:block w-1 h-1 bg-slate-600 rounded-full"></div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-400">calendar_month</span>
                Joined {joinedDate}
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-2">
              <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider mr-2">Selected Papers:</span>
              {selectedPapers.map((paper) => {
                const color = getPaperColor(paper);
                return (
                  <span
                    key={paper}
                    className={`px-2.5 py-1 rounded-lg bg-${color}-500/10 text-${color}-400 border border-${color}-500/10 text-xs font-bold`}
                    style={{
                      backgroundColor: `var(--color-${color}-500, #3b82f6)1a`,
                      color: `var(--color-${color}-400, #60a5fa)`,
                      borderColor: `var(--color-${color}-500, #3b82f6)1a`,
                    }}
                  >
                    {paper}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface-dark p-5 rounded-2xl border border-white/5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-slate-300">
            <span className="material-symbols-outlined text-2xl">description</span>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Total Submissions</p>
            <p className="text-2xl font-bold text-white">{profile.totalSubmissions}</p>
          </div>
        </div>

        <div className="bg-surface-dark p-5 rounded-2xl border border-white/5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-2xl">check_circle</span>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Reviewed</p>
            <p className="text-2xl font-bold text-white">{profile.reviewedSubmissions}</p>
          </div>
        </div>

        <div className="bg-surface-dark p-5 rounded-2xl border border-white/5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-400">
            <span className="material-symbols-outlined text-2xl">hourglass_top</span>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Pending Review</p>
            <p className="text-2xl font-bold text-white">{profile.pendingSubmissions}</p>
          </div>
        </div>

        <div className="bg-surface-dark p-5 rounded-2xl border border-white/5 flex flex-col gap-2 justify-center">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Average Score</p>
            <span className="text-lg font-bold text-primary">
              {profile.averageScore !== null ? `${profile.averageScore}%` : "—"}
            </span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${profile.averageScore || 0}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-bold text-white px-1">Recent Activity</h2>
        <div className="bg-surface-dark rounded-2xl border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 border-b border-white/5">
                <tr>
                  <th className="px-6 py-4 font-semibold text-slate-400 uppercase tracking-wider text-xs">
                    Paper & Question
                  </th>
                  <th className="px-6 py-4 font-semibold text-slate-400 uppercase tracking-wider text-xs">
                    Submission Date
                  </th>
                  <th className="px-6 py-4 font-semibold text-slate-400 uppercase tracking-wider text-xs">
                    Status
                  </th>
                  <th className="px-6 py-4 font-semibold text-slate-400 uppercase tracking-wider text-xs text-right">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {profile.recentSubmissions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-400">
                      No submissions yet.{" "}
                      <Link href="/student/submissions/new" className="text-primary hover:underline">
                        Upload your first answer
                      </Link>
                    </td>
                  </tr>
                ) : (
                  profile.recentSubmissions.map((submission) => {
                    const paperColor = getPaperColor(submission.paper);
                    const date = new Date(submission.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    });

                    return (
                      <tr key={submission.id} className="group hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 border"
                              style={{
                                backgroundColor: `var(--color-${paperColor}-500, #3b82f6)1a`,
                                color: `var(--color-${paperColor}-400, #60a5fa)`,
                                borderColor: `var(--color-${paperColor}-500, #3b82f6)1a`,
                              }}
                            >
                              {submission.paper}
                            </div>
                            <div>
                              <p className="font-semibold text-white">{submission.title}</p>
                              {submission.question && (
                                <p className="text-xs text-slate-400">{submission.question}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-300">{date}</td>
                        <td className="px-6 py-4">
                          {submission.status === "reviewed" ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                              Reviewed
                            </span>
                          ) : submission.status === "under_review" ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                              Under Review
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse"></span>
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            href={`/student/submissions/${submission.id}`}
                            className="text-slate-400 hover:text-white transition-colors"
                          >
                            <span className="material-symbols-outlined text-xl">
                              {submission.status === "reviewed" ? "download" : "visibility"}
                            </span>
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
