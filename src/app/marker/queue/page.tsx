import { getPendingSubmissions } from "@/lib/marker/actions";
import SubmissionsQueueClient from "./SubmissionsQueueClient";

export default async function SubmissionsToReviewPage() {
  const submissions = await getPendingSubmissions();

  return <SubmissionsQueueClient submissions={submissions} />;
}
