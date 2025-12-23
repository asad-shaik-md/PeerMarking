import { redirect } from "next/navigation";
import { getUser, getUserRole, signOut } from "@/lib/auth/actions";
import Link from "next/link";

export default async function MarkerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();
  const role = await getUserRole();

  if (!user) {
    redirect("/login");
  }

  // If user is a student, redirect them to student dashboard
  if (role === "student") {
    redirect("/student/dashboard");
  }

  return (
    <div className="min-h-screen bg-background-dark">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background-dark/80 backdrop-blur-md">
        <div className="flex h-16 items-center justify-between px-6 lg:px-10 max-w-[1440px] mx-auto w-full">
          <div className="flex items-center gap-6">
            <Link href="/marker/dashboard" className="flex items-center gap-3">
              <div className="flex items-center justify-center size-8 rounded-full bg-primary text-background-dark">
                <span className="material-symbols-outlined text-[20px]">school</span>
              </div>
              <span className="text-lg font-bold tracking-tight text-white">PeerMarking</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/marker/dashboard"
                className="text-sm font-medium text-white transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/marker/queue"
                className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
              >
                Review Queue
              </Link>
              <Link
                href="/marker/reviews"
                className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
              >
                My Reviews
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
              <span className="material-symbols-outlined text-primary text-[16px]">
                verified
              </span>
              <span className="text-xs font-bold text-primary">SENIOR MARKER</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span className="material-symbols-outlined text-[20px]">person</span>
              <span className="hidden sm:inline">{user.email}</span>
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
      <main className="w-full max-w-[1440px] mx-auto px-6 lg:px-10 py-8">{children}</main>
    </div>
  );
}
