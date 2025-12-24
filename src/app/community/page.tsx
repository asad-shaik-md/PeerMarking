import { redirect } from "next/navigation";
import Link from "next/link";
import { getCommunitySubmissions } from "@/lib/profile/actions";
import { getUser, getUserRole } from "@/lib/auth/actions";
import { getPaperColor } from "@/types/submission";

export default async function CommunityPage() {
  const user = await getUser();
  const role = await getUserRole();

  if (!user) {
    redirect("/login");
  }

  const submissions = await getCommunitySubmissions();
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
      <main className="w-full max-w-[1440px] mx-auto px-6 lg:px-10 py-8">
        <div className="flex flex-col gap-8 pb-20">
          {/* Header */}
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-sm text-[#9eb7a8]">
                <span className="hover:text-primary cursor-pointer transition-colors">Community</span>
                <span className="material-symbols-outlined text-xs">chevron_right</span>
                <span className="text-white font-medium">Public Feed</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
                Community Submissions
              </h2>
              <p className="text-[#9eb7a8] max-w-2xl">
                Browse recent practice answers from students and see how they were marked by peers.
              </p>
            </div>
          </header>

          {/* Filters */}
          <div className="bg-surface-dark p-2 rounded-[12px] border border-white/5 flex flex-col md:flex-row items-center gap-2">
            <div className="relative flex-1 w-full">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                search
              </span>
              <input
                className="w-full pl-10 pr-4 py-2.5 bg-transparent border-none text-sm text-white placeholder-slate-400 focus:ring-0 focus:outline-none"
                placeholder="Search by paper or question..."
                type="text"
              />
            </div>
            <div className="w-px h-8 bg-white/10 hidden md:block"></div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <select className="flex-1 md:w-auto bg-white/5 border-none rounded-[10px] text-sm font-medium text-slate-300 py-2.5 pl-4 pr-8 focus:ring-2 focus:ring-primary/50 cursor-pointer">
                <option>All Papers</option>
                <option>PM</option>
                <option>FM</option>
                <option>AA</option>
                <option>TX</option>
              </select>
              <select className="flex-1 md:w-auto bg-white/5 border-none rounded-[10px] text-sm font-medium text-slate-300 py-2.5 pl-4 pr-8 focus:ring-2 focus:ring-primary/50 cursor-pointer">
                <option>Newest First</option>
                <option>Oldest First</option>
              </select>
            </div>
          </div>

          {/* Submissions Grid */}
          {submissions.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-3xl text-slate-400">
                  folder_open
                </span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">No reviewed submissions yet</h3>
              <p className="text-slate-400 text-sm">
                Reviewed submissions will appear here for the community to learn from.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {submissions.map((submission) => {
                const paperColor = getPaperColor(submission.paper);
                const reviewDate = submission.reviewedAt
                  ? new Date(submission.reviewedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "—";

                return (
                  <article
                    key={submission.id}
                    className="group bg-surface-dark rounded-[12px] p-5 border border-white/5 hover:border-primary/40 transition-all duration-300 flex flex-col h-full"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div
                        className="w-12 h-12 rounded-[10px] flex items-center justify-center font-bold text-sm border"
                        style={{
                          backgroundColor: `color-mix(in srgb, var(--color-${paperColor}-500, #3b82f6) 20%, transparent)`,
                          color: `var(--color-${paperColor}-400, #60a5fa)`,
                          borderColor: `color-mix(in srgb, var(--color-${paperColor}-500, #3b82f6) 20%, transparent)`,
                        }}
                      >
                        {submission.paper}
                      </div>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                        Reviewed
                      </span>
                    </div>

                    <div className="flex-1 mb-6">
                      <h3 className="text-base font-bold text-white mb-1.5 line-clamp-1">
                        {submission.title}
                      </h3>
                      <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">
                        {submission.question || "Practice answer submission"}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span className="material-symbols-outlined text-base">calendar_today</span>
                        {reviewDate}
                      </div>
                      <Link
                        href={`/community/${submission.id}`}
                        className="text-sm font-semibold text-primary hover:text-primary-dark transition-colors flex items-center gap-1 group/btn"
                      >
                        View Submission
                        <span className="material-symbols-outlined text-base group-hover/btn:translate-x-0.5 transition-transform">
                          arrow_forward
                        </span>
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {submissions.length > 0 && (
            <div className="flex items-center justify-between text-sm">
              <p className="text-slate-400">
                Showing 1 to {Math.min(submissions.length, 6)} of {submissions.length} results
              </p>
              <div className="flex items-center gap-2">
                <button className="p-2 rounded-lg bg-white/5 text-slate-400 hover:bg-white/10 transition-colors disabled:opacity-50">
                  <span className="material-symbols-outlined text-lg">chevron_left</span>
                </button>
                <button className="w-8 h-8 rounded-lg bg-primary text-background-dark font-bold text-sm">
                  1
                </button>
                <button className="w-8 h-8 rounded-lg bg-white/5 text-slate-300 hover:bg-white/10 font-medium text-sm transition-colors">
                  2
                </button>
                <button className="w-8 h-8 rounded-lg bg-white/5 text-slate-300 hover:bg-white/10 font-medium text-sm transition-colors">
                  3
                </button>
                <button className="p-2 rounded-lg bg-white/5 text-slate-400 hover:bg-white/10 transition-colors">
                  <span className="material-symbols-outlined text-lg">chevron_right</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
