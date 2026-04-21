import type { Metadata } from "next"
import Link from "next/link"
import "./globals.css"

export const metadata: Metadata = {
  title: "Edpire Integration Demo",
  description: "Learner-facing and admin-style examples of building product wrappers around Edpire assessments.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_25%,#f8fafc_100%)] text-slate-900 antialiased">
        <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/85 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4">
            <Link href="/" className="font-semibold text-lg tracking-tight text-slate-900">
              Edpire <span className="font-normal text-slate-400">Integration Demo</span>
            </Link>
            <nav className="flex flex-wrap items-center gap-2 text-sm">
              <Link
                href="/library"
                className="rounded-full px-3 py-1.5 font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
              >
                Library
              </Link>
              <Link
                href="/builder"
                className="rounded-full px-3 py-1.5 font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
              >
                Builder
              </Link>
              <Link
                href="/simple-redirect"
                className="rounded-full px-3 py-1.5 font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
              >
                Simple Redirect
              </Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-6 py-10">
          {children}
        </main>
      </body>
    </html>
  )
}
