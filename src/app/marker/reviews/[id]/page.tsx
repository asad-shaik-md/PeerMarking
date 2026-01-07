import { notFound } from "next/navigation";
import { getSubmissionForReview, getMarkerAllFileDownloadUrls } from "@/lib/marker/actions";
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

  // Get download URLs for all files
  const { originalFiles, markedFiles } = await getMarkerAllFileDownloadUrls(submission.id);

  return (
    <ReviewFormClient
      submission={submission}
      originalFiles={originalFiles}
      markedFilesFromServer={markedFiles}
    />
  );
}
