import { redirect } from "next/navigation";
import { getUser, getUserRole, signOut } from "@/lib/auth/actions";
import Link from "next/link";
import MarkerNav from "./MarkerNav";

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

  const userName = user.user_metadata?.full_name || user.email?.split("@")[0] || "Marker";

  return (
    <div className="min-h-screen bg-background-dark">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background-dark/80 backdrop-blur-md">
        <div className="flex h-16 items-center justify-between px-4 md:px-6 lg:px-10 max-w-[1440px] mx-auto w-full">
          <div className="flex items-center gap-4 md:gap-6">
            <Link href="/marker/dashboard" className="flex items-center gap-2">
              <img src="/logo.png" alt="Marklynx" className="size-8" />
              <span className="text-lg font-bold tracking-tight text-white hidden sm:inline">
                <span className="text-primary">Mark</span>lynx
              </span>
            </Link>
            <MarkerNav />
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
