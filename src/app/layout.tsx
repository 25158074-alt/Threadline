import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Threadline — Decisions you'll never forget",
  description:
    "Turn raw meeting notes into an accountable, searchable record of decisions — who owns what, when it's due, and why.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/80 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2.5">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" className="text-fuchsia-600">
                <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.8" />
                <path d="M8 12h8M12 8v8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              <span className="text-lg font-bold tracking-tight text-slate-900">
                Threadline
              </span>
            </div>
            <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 sm:flex">
              <a href="#capture" className="transition hover:text-fuchsia-600">Capture</a>
              <a href="#thread" className="transition hover:text-fuchsia-600">Thread</a>
              <a href="#recall" className="transition hover:text-fuchsia-600">Recall</a>
            </nav>
            <span className="rounded-full border border-fuchsia-200 bg-fuchsia-50 px-3 py-1 text-xs font-semibold text-fuchsia-700">
              AI extraction
            </span>
          </div>
        </header>

        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-x-0 -top-24 h-72 bg-gradient-to-br from-fuchsia-100 via-violet-50 to-transparent" />
          <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-14 text-center sm:px-6 lg:px-8">
            <p className="mx-auto inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Ending decision amnesia, one meeting at a time
            </p>
            <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-extrabold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Every decision,{" "}
              <span className="bg-gradient-to-r from-fuchsia-600 to-violet-600 bg-clip-text text-transparent">
                owned, timed, remembered.
              </span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
              Paste your meeting notes and Threadline&rsquo;s AI turns them into
              accountable decision cards — with owners, deadlines, and reasoning. Then ask
              <em> why we decided that</em>, and get a grounded answer from your own record.
            </p>
            <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href="#capture"
                className="rounded-xl bg-gradient-to-r from-fuchsia-600 to-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/30 transition hover:brightness-110"
              >
                Capture a meeting →
              </a>
              <a
                href="#recall"
                className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                Recall a decision
              </a>
            </div>
          </div>
        </section>

        {children}

        <footer className="border-t border-slate-200 py-10">
          <div className="mx-auto max-w-7xl px-4 text-center text-sm text-slate-500 sm:px-6 lg:px-8">
            <p className="font-medium text-slate-700">Threadline</p>
            <p className="mt-1">
              Capture → Track → Recall. A living, accountable record of every decision.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
