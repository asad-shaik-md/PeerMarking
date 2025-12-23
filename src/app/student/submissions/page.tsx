import Link from "next/link";
import { getMySubmissions } from "@/lib/submissions/actions";
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
        <span className="inline-flex items-center gap-1.5 pl-1.5 pr-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
          <span className="material-symbols-outlined text-sm">schedule</span>
          Under Review
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 pl-1.5 pr-2.5 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
          <span className="material-symbols-outlined text-sm animate-pulse">hourglass_top</span>
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
      return "bg-blue-500";
    default:
      return "bg-yellow-500";
  }
}

export default async function AllSubmissionsPage() {
  const submissions = await getMySubmissions();
  const error = submissions.length === 0 ? null : null;

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex flex-col gap-2">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-2 text-sm text-gray-400">
              <li>
                <Link href="/student/dashboard" className="hover:text-primary transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <span className="material-symbols-outlined text-xs">chevron_right</span>
              </li>
              <li className="text-white font-medium">Submissions</li>
            </ol>
          </nav>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">All Submissions</h1>
          <p className="text-gray-400 max-w-2xl">
            View the status of your practice answers and access feedback from senior reviewers.
          </p>
        </div>
        <Link
          href="/student/submissions/new"
          className="bg-primary hover:bg-primary/90 text-background-dark font-bold py-3 px-6 rounded-full inline-flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(56,224,123,0.3)] hover:shadow-[0_0_30px_rgba(56,224,123,0.4)] transform hover:-translate-y-0.5 whitespace-nowrap"
        >
          <span className="material-symbols-outlined">add</span>
          Upload New Answer
        </Link>
      </header>

      {/* Filters */}
      <div className="bg-surface-dark p-2 rounded-2xl border border-white/5 flex flex-col md:flex-row items-center gap-2">
        <div className="relative flex-1 w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            search
          </span>
          <input
            className="w-full pl-10 pr-4 py-2.5 bg-transparent border-none text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-0"
            placeholder="Search by paper or question..."
            type="text"
          />
        </div>
        <div className="w-px h-8 bg-white/10 hidden md:block" />
        <div className="flex items-center gap-2 w-full md:w-auto">
          <select className="flex-1 md:w-auto bg-white/5 border-none rounded-xl text-sm font-medium text-gray-300 py-2.5 pl-4 pr-8 focus:ring-2 focus:ring-primary/50 cursor-pointer">
            <option>All Papers</option>
            <option value="PM">PM</option>
            <option value="FM">FM</option>
            <option value="AA">AA</option>
            <option value="TX">TX</option>
            <option value="FR">FR</option>
            <option value="SBL">SBL</option>
            <option value="SBR">SBR</option>
            <option value="APM">APM</option>
            <option value="AFM">AFM</option>
            <option value="ATX">ATX</option>
            <option value="AAA">AAA</option>
          </select>
          <select className="flex-1 md:w-auto bg-white/5 border-none rounded-xl text-sm font-medium text-gray-300 py-2.5 pl-4 pr-8 focus:ring-2 focus:ring-primary/50 cursor-pointer">
            <option>All Status</option>
            <option value="reviewed">Reviewed</option>
            <option value="under_review">Under Review</option>
            <option value="pending">Pending</option>
          </select>
          <select className="flex-1 md:w-auto bg-white/5 border-none rounded-xl text-sm font-medium text-gray-300 py-2.5 pl-4 pr-8 focus:ring-2 focus:ring-primary/50 cursor-pointer">
            <option>Newest First</option>
            <option>Oldest First</option>
          </select>
        </div>
      </div>

      {/* Empty State */}
      {submissions.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 px-4 bg-surface-dark rounded-2xl border border-white/5">
          <div className="bg-white/5 p-4 rounded-full mb-4">
            <span className="material-symbols-outlined text-4xl text-gray-400">folder_open</span>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No submissions yet</h3>
          <p className="text-gray-400 text-center max-w-md mb-6">
            You haven&apos;t submitted any answers for review. Start by uploading your first practice answer.
          </p>
          <Link
            href="/student/submissions/new"
            className="bg-primary hover:bg-primary/90 text-background-dark font-bold py-3 px-6 rounded-full inline-flex items-center gap-2 transition-all"
          >
            <span className="material-symbols-outlined">add</span>
            Upload Your First Answer
          </Link>
        </div>
      )}

      {/* Submissions List */}
      {submissions.length > 0 && (
        <>
          {/* Table Header - Desktop */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 text-xs font-semibold uppercase tracking-wider text-gray-400">
            <div className="col-span-5">Paper &amp; Question</div>
            <div className="col-span-3">Submitted Date</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2 text-right">Action</div>
          </div>

          {/* Submissions */}
          <div className="flex flex-col gap-3">
            {submissions.map((submission) => {
              const paperColor = getPaperColor(submission.paper);
              
              return (
                <div
                  key={submission.id}
                  className="group relative bg-surface-dark rounded-xl p-4 md:px-6 md:py-5 border border-white/5 hover:border-primary/30 transition-all duration-200"
                >
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    {/* Paper & Question */}
                    <div className="md:col-span-5 flex items-center gap-4">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 border"
                        style={{
                          backgroundColor: `${paperColor}20`,
                          borderColor: `${paperColor}30`,
                          color: paperColor,
                        }}
                      >
                        {submission.paper}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <h3 className="text-sm font-bold text-white truncate">
                          {submission.title}
                        </h3>
                        <p className="text-xs text-gray-400 truncate">
                          {getPaperLabel(submission.paper)}
                          {submission.question && ` - ${submission.question}`}
                        </p>
                      </div>
                    </div>

                    {/* Date */}
                    <div className="md:col-span-3 flex items-center gap-2 md:gap-0">
                      <span className="md:hidden text-xs font-medium text-gray-500 uppercase w-20">
                        Date:
                      </span>
                      <div className="flex items-center gap-2 text-gray-300 text-sm">
                        <span className="material-symbols-outlined text-lg text-gray-400">
                          calendar_today
                        </span>
                        {formatDate(submission.created_at)}
                      </div>
                    </div>

                    {/* Status */}
                    <div className="md:col-span-2 flex items-center gap-2 md:gap-0">
                      <span className="md:hidden text-xs font-medium text-gray-500 uppercase w-20">
                        Status:
                      </span>
                      {getStatusBadge(submission.status)}
                    </div>

                    {/* Action */}
                    <div className="md:col-span-2 flex justify-end gap-2">
                      <Link
                        href={`/student/submissions/${submission.id}`}
                        className="md:w-full bg-white/5 hover:bg-primary hover:text-background-dark text-gray-300 py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <span className="material-symbols-outlined text-lg">
                          {submission.status === "reviewed" ? "download" : "visibility"}
                        </span>
                        <span className="hidden lg:inline">
                          {submission.status === "reviewed" ? "Feedback" : "View"}
                        </span>
                      </Link>
                    </div>
                  </div>

                  {/* Status Indicator Bar */}
                  <div
                    className={`absolute left-0 top-4 bottom-4 w-1 rounded-r-full ${getStatusIndicatorColor(
                      submission.status
                    )}`}
                  />
                </div>
              );
            })}
          </div>

          {/* Pagination - Basic */}
          <div className="flex items-center justify-between py-4">
            <p className="text-sm text-gray-400">
              Showing {submissions.length} submission{submissions.length !== 1 ? "s" : ""}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
