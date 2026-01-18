"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function StudentNav() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

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

  const navLinks = [
    { href: "/student/dashboard", label: "Dashboard", icon: "dashboard" },
    { href: "/student/submissions", label: "My Submissions", icon: "folder" },
    { href: "/student/submissions/new", label: "Upload Answer", icon: "upload_file" },
  ];

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center gap-6">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`text-sm font-medium transition-colors ${
              isActive(link.href) ? "text-primary" : "text-gray-400 hover:text-white"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden p-2 -ml-2 text-gray-400 hover:text-white transition-colors"
        aria-label="Toggle menu"
      >
        <span className="material-symbols-outlined text-2xl">
          {isMobileMenuOpen ? "close" : "menu"}
        </span>
      </button>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu Drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-background-dark border-r border-white/10 z-50 transform transition-transform duration-300 ease-out md:hidden ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Menu Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="Marklynx" className="size-8" />
              <span className="text-lg font-bold text-white">
                <span className="text-primary">Mark</span>lynx
              </span>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Menu Links */}
          <nav className="flex-1 p-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive(link.href)
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className="material-symbols-outlined text-xl">{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Menu Footer */}
          <div className="p-4 border-t border-white/10">
            <p className="text-xs text-gray-500 text-center">Student Portal</p>
          </div>
        </div>
      </div>
    </>
  );
}
