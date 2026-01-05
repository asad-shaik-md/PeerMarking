import { redirect } from "next/navigation";

// Signup is now unified with login - redirect to login page
export default function SignupPage() {
  redirect("/login");
}
