import { notFound } from "next/navigation";
import { getSubmissionForReview, getMarkerFileDownloadUrl } from "@/lib/marker/actions";
import ReviewFormClient from "./ReviewFormClient";

export default async function MarkerReviewDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const submission = await getSubmissionForReview(id);

  if (!submission) {
    notFound();
  }

  // Get download URLs with assignment verification
  const originalDownload = await getMarkerFileDownloadUrl(submission.file_path, submission.id);
  const markedDownload = submission.marked_file_path
    ? await getMarkerFileDownloadUrl(submission.marked_file_path, submission.id)
    : null;

  return (
    <ReviewFormClient
      submission={submission}
      originalDownloadUrl={originalDownload.url}
      markedDownloadUrl={markedDownload?.url || null}
    />
  );
}
