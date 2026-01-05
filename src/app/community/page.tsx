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

          {/* Results count */}
          {submissions.length > 0 && (
            <div className="flex items-center justify-between text-sm py-4">
              <p className="text-slate-400">
                Showing {submissions.length} reviewed submission{submissions.length !== 1 ? "s" : ""}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
