import { redirect } from "next/navigation";
import { getUser, getUserRole, signOut } from "@/lib/auth/actions";
import Link from "next/link";
import StudentNav from "./StudentNav";

export default async function StudentDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();
  const role = await getUserRole();

  if (!user) {
    redirect("/login");
  }

  // If user is a marker, redirect them to marker dashboard
  if (role === "marker") {
    redirect("/marker/dashboard");
  }

  const userName = user.user_metadata?.full_name || user.email?.split("@")[0] || "Student";

  return (
    <div className="min-h-screen bg-background-dark">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background-dark/80 backdrop-blur-md">
        <div className="flex h-16 items-center justify-between px-4 md:px-6 lg:px-10 max-w-[1440px] mx-auto w-full">
          <div className="flex items-center gap-4 md:gap-6">
            <StudentNav />
            <Link href="/student/dashboard" className="flex items-center gap-3">
              <div className="flex items-center justify-center size-8 rounded-full bg-primary text-background-dark">
                <span className="material-symbols-outlined text-[20px]">school</span>
              </div>
              <span className="text-lg font-bold tracking-tight text-white hidden sm:inline">PeerMarking</span>
            </Link>
          </div>
          <div className="flex items-center gap-3 md:gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span className="material-symbols-outlined text-[20px]">person</span>
              <span className="hidden sm:inline">{userName}</span>
            </div>
            <form action={signOut}>
              <button
                type="submit"
                className="flex items-center gap-1 text-sm font-medium text-gray-400 hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">logout</span>
                <span className="hidden sm:inline">Logout</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="w-full max-w-[1440px] mx-auto px-4 md:px-6 lg:px-10 py-6 md:py-8">{children}</main>
    </div>
  );
}
