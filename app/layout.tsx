import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Edpire Integration Examples",
  description: "Working examples of Edpire integration patterns.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-4xl px-6 py-4 flex items-center gap-3">
            <a href="/" className="font-semibold text-lg tracking-tight text-slate-900">
              Edpire <span className="text-slate-400 font-normal">Integration Examples</span>
            </a>
          </div>
        </header>
        <main className="mx-auto max-w-4xl px-6 py-12">
          {children}
        </main>
      </body>
    </html>
  )
}
