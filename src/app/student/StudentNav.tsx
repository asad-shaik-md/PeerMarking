"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function StudentNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/student/dashboard") {
      return pathname === "/student/dashboard" || pathname === "/student";
    }
    // For submissions list, only match exact path or individual submission pages (not /new)
    if (href === "/student/submissions") {
      return pathname === "/student/submissions" || 
        (pathname.startsWith("/student/submissions/") && !pathname.startsWith("/student/submissions/new"));
    }
    // For upload page, match exact path
    if (href === "/student/submissions/new") {
      return pathname === "/student/submissions/new";
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="hidden md:flex items-center gap-6">
      <Link
        href="/student/dashboard"
        className={`text-sm font-medium transition-colors ${
          isActive("/student/dashboard") ? "text-primary" : "text-gray-400 hover:text-white"
        }`}
      >
        Dashboard
      </Link>
      <Link
        href="/student/submissions"
        className={`text-sm font-medium transition-colors ${
          isActive("/student/submissions") ? "text-primary" : "text-gray-400 hover:text-white"
        }`}
      >
        My Submissions
      </Link>
      <Link
        href="/student/submissions/new"
        className={`text-sm font-medium transition-colors ${
          isActive("/student/submissions/new") ? "text-primary" : "text-gray-400 hover:text-white"
        }`}
      >
        Upload Answer
      </Link>
    </nav>
  );
}
