"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function MarkerNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/marker/dashboard") {
      return pathname === "/marker/dashboard" || pathname === "/marker";
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="hidden md:flex items-center gap-6">
      <Link
        href="/marker/dashboard"
        className={`text-sm font-medium transition-colors ${
          isActive("/marker/dashboard") ? "text-primary" : "text-gray-400 hover:text-white"
        }`}
      >
        Dashboard
      </Link>
      <Link
        href="/marker/queue"
        className={`text-sm font-medium transition-colors ${
          isActive("/marker/queue") ? "text-primary" : "text-gray-400 hover:text-white"
        }`}
      >
        Review Queue
      </Link>
      <Link
        href="/marker/reviews"
        className={`text-sm font-medium transition-colors ${
          isActive("/marker/reviews") ? "text-primary" : "text-gray-400 hover:text-white"
        }`}
      >
        My Reviews
      </Link>
    </nav>
  );
}
