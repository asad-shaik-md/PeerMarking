import Link from "next/link";
import LandingNav from "./LandingNav";

export default function LandingPage() {
  return (
    <div className="relative flex min-h-screen flex-col">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background-dark/80 backdrop-blur-md">
        <div className="flex h-16 items-center justify-between px-4 md:px-6 lg:px-20 max-w-[1440px] mx-auto w-full">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Marklynx" className="size-8" />
            <span className="text-lg font-bold tracking-tight text-white">
              <span className="text-primary">Mark</span>lynx
            </span>
          </div>
          <div className="flex items-center gap-4">
            <LandingNav />
            <Link
              href="/login"
              className="hidden md:flex items-center justify-center h-10 px-6 rounded-full bg-primary text-background-dark text-sm font-bold hover:bg-primary/90 transition-all shadow-[0_0_15px_rgba(56,224,123,0.3)]"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-[1440px] mx-auto flex flex-col">
        {/* Hero Section */}
        <section className="relative px-6 py-16 md:py-24 lg:px-20">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            <div className="flex-1 flex flex-col gap-8 max-w-2xl">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight text-white">
                Upload your <span className="text-primary">ACCA</span> practice answer.{" "}
                <br className="hidden lg:block" />
                Get it marked by a senior.
              </h1>
              <p className="text-lg text-gray-400 leading-relaxed max-w-xl">
                Stop guessing if you passed. Upload your Word or Excel files and get detailed
                feedback from qualified seniors within 24 hours. Aim for that P-Level pass with
                confidence.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <Link
                  href="/login"
                  className="h-12 px-8 rounded-full bg-primary text-background-dark text-base font-bold hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(56,224,123,0.4)] flex items-center gap-2"
                >
                  <span className="material-symbols-outlined">upload_file</span>
                  Submit Practice Answer
                </Link>
                <Link
                  href="/login"
                  className="h-12 px-8 rounded-full border border-white/20 bg-transparent text-white text-base font-bold hover:bg-white/10 transition-colors flex items-center gap-2"
                >
                  <span className="material-symbols-outlined">rate_review</span>
                  Become a Marker
                </Link>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500 mt-4">
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[18px] text-blue-500">
                    description
                  </span>
                  Supports .docx
                </div>
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[18px] text-green-500">
                    table_view
                  </span>
                  Supports .xlsx
                </div>
              </div>
            </div>
            <div className="flex-1 w-full lg:h-auto min-h-[300px] lg:min-h-[500px] relative">
              {/* Abstract Dashboard Representation */}
              <div className="relative w-full aspect-square md:aspect-video lg:aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-surface-dark to-background-dark border border-white/10 shadow-2xl group">
                {/* Background Pattern */}
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage: "radial-gradient(#38e07b 1px, transparent 1px)",
                    backgroundSize: "24px 24px",
                  }}
                ></div>
                {/* Floating Card 1 */}
                <div className="absolute top-[20%] left-[10%] right-[20%] bg-surface-dark border border-white/10 rounded-lg p-6 shadow-xl z-10 transform transition-transform duration-500 group-hover:-translate-y-2">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                        <span className="material-symbols-outlined">description</span>
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">PM_Mock_Exam_Sept.docx</div>
                        <div className="text-xs text-gray-400">Uploaded 2 hours ago</div>
                      </div>
                    </div>
                    <div className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded text-xs font-bold">
                      Pending
                    </div>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full w-full mb-2"></div>
                  <div className="h-2 bg-white/5 rounded-full w-2/3"></div>
                </div>
                {/* Floating Card 2 (Result) */}
                <div className="absolute bottom-[20%] right-[10%] left-[20%] bg-surface-dark border border-primary/30 rounded-lg p-6 shadow-2xl z-20 backdrop-blur-sm transform transition-transform duration-500 group-hover:translate-y-2">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-sm">check</span>
                      </div>
                      <div className="text-sm font-bold text-white">Feedback Received</div>
                    </div>
                    <div className="text-primary text-xl font-black">68%</div>
                  </div>
                  <p className="text-xs text-gray-400 mb-3">
                    &ldquo;Good application of the model in part B. Watch out for time management in
                    section C.&rdquo;
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="material-symbols-outlined text-[14px]">person</span>
                    Marked by Senior Reviewer
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section
          id="how-it-works"
          className="px-6 py-16 lg:px-20 bg-surface-dark/30 rounded-[3rem] my-8 mx-4 md:mx-0"
        >
          <div className="max-w-[960px] mx-auto">
            <div className="flex flex-col gap-4 mb-12 text-center md:text-left">
              <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white">
                Simple 3-Step Process
              </h2>
              <p className="text-lg text-gray-400 max-w-2xl">
                Get the professional feedback you need in record time without the hassle.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Step 1 */}
              <div className="flex flex-col p-8 rounded-lg bg-surface-dark border border-white/5 hover:border-primary/50 transition-colors group">
                <div className="mb-6 size-14 rounded-full bg-background-dark flex items-center justify-center text-primary border border-white/10 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[32px]">filter_1</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Select Module</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Choose from PM, TX, FR, AA and more. We cover all Applied Skills and Strategic
                  Professional papers.
                </p>
              </div>
              {/* Step 2 */}
              <div className="flex flex-col p-8 rounded-lg bg-surface-dark border border-white/5 hover:border-primary/50 transition-colors group">
                <div className="mb-6 size-14 rounded-full bg-background-dark flex items-center justify-center text-primary border border-white/10 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[32px]">upload_file</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Upload Files</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Upload your .docx or .xlsx practice answers directly. No need to convert to PDF.
                </p>
              </div>
              {/* Step 3 */}
              <div className="flex flex-col p-8 rounded-lg bg-surface-dark border border-white/5 hover:border-primary/50 transition-colors group">
                <div className="mb-6 size-14 rounded-full bg-background-dark flex items-center justify-center text-primary border border-white/10 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[32px]">assignment_turned_in</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Receive Feedback</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Get detailed, annotated feedback and a pass/fail grade from a qualified senior
                  within 24 hours.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="px-6 py-16 lg:px-20">
          <div className="max-w-[1200px] mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
              <div>
                <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-4">
                  Tailored for ACCA Success
                </h2>
                <p className="text-gray-400 text-lg max-w-xl">
                  Our platform is built specifically for the nuances of ACCA exams.
                </p>
              </div>
              <a
                className="text-primary font-bold hover:underline flex items-center gap-1"
                href="#"
              >
                View all features{" "}
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </a>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-surface-dark p-6 rounded-lg border border-white/5">
                <span className="material-symbols-outlined text-primary text-[32px] mb-4">
                  functions
                </span>
                <h4 className="text-lg font-bold text-white mb-2">Excel Formula Check</h4>
                <p className="text-sm text-gray-400">
                  Markers verify your spreadsheet formulas for correctness, just like the real exam
                  environment.
                </p>
              </div>
              <div className="bg-surface-dark p-6 rounded-lg border border-white/5">
                <span className="material-symbols-outlined text-primary text-[32px] mb-4">
                  stars
                </span>
                <h4 className="text-lg font-bold text-white mb-2">Professional Marks</h4>
                <p className="text-sm text-gray-400">
                  Specific feedback on layout, tone, and structure to help you bag those crucial
                  professional marks.
                </p>
              </div>
              <div className="bg-surface-dark p-6 rounded-lg border border-white/5">
                <span className="material-symbols-outlined text-primary text-[32px] mb-4">
                  timer
                </span>
                <h4 className="text-lg font-bold text-white mb-2">24h Turnaround</h4>
                <p className="text-sm text-gray-400">
                  Don&apos;t wait weeks. Get feedback while the practice question is still fresh in
                  your mind.
                </p>
              </div>
              <div className="bg-surface-dark p-6 rounded-lg border border-white/5">
                <span className="material-symbols-outlined text-primary text-[32px] mb-4">
                  groups
                </span>
                <h4 className="text-lg font-bold text-white mb-2">Peer Community</h4>
                <p className="text-sm text-gray-400">
                  Connect with other students in your module for study groups and quick query
                  resolution.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="px-6 pb-24 lg:px-20 text-center">
          <div className="max-w-2xl mx-auto flex flex-col gap-6">
            <h2 className="text-3xl font-black text-white">Ready to ace your next exam?</h2>
            <p className="text-gray-400 mb-4">
              Join thousands of students getting the feedback they deserve.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/login"
                className="h-12 px-8 rounded-full bg-primary text-background-dark text-base font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center"
              >
                Get Started for Free
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-background-dark py-12 px-6 lg:px-20">
        <div className="max-w-[1440px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="Marklynx" className="size-6" />
              <span className="text-base font-bold text-white">
                <span className="text-primary">Mark</span>lynx
              </span>
            </div>
            <p className="text-sm text-gray-400">
              The #1 peer marking community for ACCA students worldwide.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <h4 className="font-bold text-white">Platform</h4>
            <a className="text-sm text-gray-400 hover:text-primary" href="#">
              How it works
            </a>
            <a className="text-sm text-gray-400 hover:text-primary" href="#">
              Pricing
            </a>
            <a className="text-sm text-gray-400 hover:text-primary" href="#">
              Become a Marker
            </a>
          </div>
          <div className="flex flex-col gap-3">
            <h4 className="font-bold text-white">Support</h4>
            <a className="text-sm text-gray-400 hover:text-primary" href="#">
              Help Center
            </a>
            <a className="text-sm text-gray-400 hover:text-primary" href="#">
              Contact Us
            </a>
            <a className="text-sm text-gray-400 hover:text-primary" href="#">
              Community Guidelines
            </a>
          </div>
          <div className="flex flex-col gap-3">
            <h4 className="font-bold text-white">Legal</h4>
            <a className="text-sm text-gray-400 hover:text-primary" href="#">
              Terms of Service
            </a>
            <a className="text-sm text-gray-400 hover:text-primary" href="#">
              Privacy Policy
            </a>
          </div>
        </div>
        <div className="max-w-[1440px] mx-auto pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <p>© 2024 Marklynx. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
