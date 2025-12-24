import { redirect } from "next/navigation";
import Link from "next/link";
import { getMarkerPublicProfile } from "@/lib/profile/actions";
import { getPaperColor } from "@/types/submission";
import { getUser, getUserRole } from "@/lib/auth/actions";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function MarkerPublicProfilePage({ params }: Props) {
  const { id } = await params;
  const user = await getUser();
  const role = await getUserRole();

  if (!user) {
    redirect("/login");
  }

  const profile = await getMarkerPublicProfile(id);

  if (!profile) {
    redirect(role === "marker" ? "/marker/dashboard" : "/student/dashboard");
  }

  // Calculate reputation score
  const reputationScore = Math.min(
    5,
    4 + (profile.helpfulFeedbackCount / Math.max(profile.totalReviews, 1)) * 0.5
  ).toFixed(1);

  // Calculate helpful percentage
  const helpfulPercent =
    profile.totalReviews > 0
      ? Math.round((profile.helpfulFeedbackCount / profile.totalReviews) * 100)
      : 0;

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
          </div>
          <div className="flex items-center gap-4">
            <Link
              href={dashboardLink}
              className="flex items-center gap-1 text-sm font-medium text-gray-400 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
              <span className="hidden sm:inline">Back to Dashboard</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="w-full max-w-[1440px] mx-auto px-6 lg:px-10 py-8">
        <div className="flex flex-col gap-8 pb-20">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-[#9eb7a8]">
            <Link href={dashboardLink} className="hover:text-primary transition-colors">
              Dashboard
            </Link>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="hover:text-primary cursor-pointer transition-colors">Markers</span>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="text-white font-medium">Profile</span>
          </div>

          {/* Profile Header */}
          <div className="bg-surface-dark rounded-2xl p-6 md:p-8 border border-white/5 relative overflow-hidden flex flex-col md:flex-row gap-6 md:gap-10 items-start md:items-center">
            <div className="flex items-center gap-6 flex-1">
              {/* Avatar */}
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-white/5 flex items-center justify-center border-4 border-white/5 overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
                  <span className="font-display text-3xl md:text-4xl font-bold text-white">
                    {profile.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl md:text-3xl font-bold text-white">{profile.fullName}</h1>
                  <span
                    className="material-symbols-outlined text-primary text-xl"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                    title="Verified Senior Marker"
                  >
                    verified
                  </span>
                </div>
                <p className="text-primary font-medium text-lg">Senior Marker</p>
                <p className="text-[#9eb7a8] text-sm flex items-center gap-1 mt-1">
                  <span className="material-symbols-outlined text-base">location_on</span>
                  London, UK • Joined 2021
                </p>
              </div>
            </div>

            {/* Right side badges */}
            <div className="flex flex-col gap-4 md:items-end min-w-[200px] w-full md:w-auto">
              <div className="inline-flex items-center justify-center md:justify-end gap-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-full">
                <span
                  className="material-symbols-outlined text-yellow-500 text-xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  workspace_premium
                </span>
                <span className="text-yellow-400 font-bold text-sm">Gold Tier Marker</span>
              </div>
              <div className="flex flex-col md:items-end gap-2">
                <span className="text-xs uppercase tracking-wider font-semibold text-[#9eb7a8]">
                  Papers Qualified
                </span>
                <div className="flex gap-2">
                  {profile.papersPassed.map((paper) => (
                    <span
                      key={paper}
                      className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-xs font-bold text-slate-300"
                    >
                      {paper}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-surface-dark p-5 rounded-2xl border border-white/5 flex flex-col gap-2 hover:border-primary/20 transition-colors">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 mb-1">
                <span className="material-symbols-outlined">rate_review</span>
              </div>
              <span className="text-2xl font-bold text-white">{profile.totalReviews}</span>
              <span className="text-sm text-[#9eb7a8]">Reviews Completed</span>
            </div>

            <div className="bg-surface-dark p-5 rounded-2xl border border-white/5 flex flex-col gap-2 hover:border-primary/20 transition-colors">
              <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 mb-1">
                <span className="material-symbols-outlined">local_fire_department</span>
              </div>
              <span className="text-2xl font-bold text-white">12 Days</span>
              <span className="text-sm text-[#9eb7a8]">Active Streak</span>
            </div>

            <div className="bg-surface-dark p-5 rounded-2xl border border-white/5 flex flex-col gap-2 hover:border-primary/20 transition-colors">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-1">
                <span className="material-symbols-outlined">thumb_up</span>
              </div>
              <span className="text-2xl font-bold text-white">{helpfulPercent}%</span>
              <span className="text-sm text-[#9eb7a8]">Helpful Feedback</span>
            </div>

            <div className="bg-surface-dark p-5 rounded-2xl border border-white/5 flex flex-col gap-2 hover:border-primary/20 transition-colors">
              <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500 mb-1">
                <span className="material-symbols-outlined">stars</span>
              </div>
              <span className="text-2xl font-bold text-white">{reputationScore}/5</span>
              <span className="text-sm text-[#9eb7a8]">Reputation Score</span>
            </div>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Badges & Reviews */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              {/* Badges */}
              <div className="bg-surface-dark rounded-2xl p-6 border border-white/5">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">military_tech</span>
                  Badges & Recognition
                </h3>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-3 pr-6 pl-2 py-2 rounded-xl bg-white/5 border border-white/5">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-white shadow-lg shadow-yellow-500/20">
                      <span className="material-symbols-outlined text-xl">school</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white">Top Mentor</span>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wide">2023 Award</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pr-6 pl-2 py-2 rounded-xl bg-white/5 border border-white/5">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                      <span className="material-symbols-outlined text-xl">speed</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white">Quick Turnaround</span>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wide">Avg &lt; 24h</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pr-6 pl-2 py-2 rounded-xl bg-white/5 border border-white/5">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white shadow-lg shadow-primary/20">
                      <span className="material-symbols-outlined text-xl">psychology</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white">Audit Expert</span>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wide">50+ AA Reviews</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Reviews */}
              <div className="bg-surface-dark rounded-2xl p-6 border border-white/5 flex flex-col gap-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-white">Recent Reviews History</h3>
                </div>

                {/* Table header */}
                <div className="hidden md:grid grid-cols-12 px-2 pb-2 text-xs font-semibold uppercase tracking-wider text-[#9eb7a8]">
                  <div className="col-span-5">Submission</div>
                  <div className="col-span-4">Date Reviewed</div>
                  <div className="col-span-3 text-right">Verdict</div>
                </div>

                {/* Reviews list */}
                <div className="flex flex-col gap-2">
                  {profile.recentReviews.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">
                      No reviews completed yet.
                    </div>
                  ) : (
                    profile.recentReviews.map((review) => {
                      const paperColor = getPaperColor(review.paper);
                      const reviewDate = review.reviewed_at
                        ? new Date(review.reviewed_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "—";
                      const isPassing = review.score && review.score >= 50;

                      return (
                        <div
                          key={review.id}
                          className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-0 items-center p-3 rounded-xl bg-white/5"
                        >
                          <div className="col-span-5 flex items-center gap-3">
                            <div
                              className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                              style={{
                                backgroundColor: `color-mix(in srgb, var(--color-${paperColor}-500, #3b82f6) 20%, transparent)`,
                                color: `var(--color-${paperColor}-400, #60a5fa)`,
                              }}
                            >
                              {review.paper}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white line-clamp-1">
                                {review.question || review.title}
                              </p>
                              <p className="text-xs text-slate-400">Student: Anonymous</p>
                            </div>
                          </div>
                          <div className="col-span-4 text-sm text-slate-300">{reviewDate}</div>
                          <div className="col-span-3 text-right">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                                isPassing
                                  ? "bg-primary/10 text-primary border border-primary/20"
                                  : "bg-red-500/10 text-red-400 border border-red-500/20"
                              }`}
                            >
                              {isPassing ? "Pass" : "Needs Work"}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Right Sidebar: About */}
            <div className="flex flex-col gap-6">
              <div className="bg-surface-dark rounded-2xl p-6 border border-white/5">
                <h3 className="text-lg font-bold text-white mb-4">About the Marker</h3>
                <p className="text-slate-400 text-sm leading-relaxed border-l-2 border-primary/30 pl-4">
                  I&apos;m a newly qualified ACCA member passionate about helping students master
                  Performance Management and Audit. My feedback focuses on exam technique and
                  maximizing professional marks.
                </p>

                <div className="mt-6 space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Response Time</span>
                    <span className="text-white font-medium">~18 Hours</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Focus Areas</span>
                    <span className="text-white font-medium">
                      {profile.papersPassed.slice(0, 3).join(", ")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Language</span>
                    <span className="text-white font-medium">English</span>
                  </div>
                </div>

                {/* Request Review button - only for students */}
                {role === "student" && (
                  <button className="w-full mt-6 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-primary text-background-dark font-bold text-sm hover:bg-primary-dark transition-colors">
                    <span className="material-symbols-outlined text-[20px]">send</span>
                    Request Review
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
