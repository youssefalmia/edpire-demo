"use client"

import { useState } from "react"
import type { Assessment } from "@/lib/edpire"
import { ExternalLink, User } from "lucide-react"

interface Props {
  assessments: Assessment[]
}

export function RedirectLauncher({ assessments }: Props) {
  const [learnerId, setLearnerId] = useState("demo-user-01")

  const takeBase = process.env.NEXT_PUBLIC_EDPIRE_TAKE_BASE_URL ?? ""
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ""
  const orgSlug = process.env.NEXT_PUBLIC_EDPIRE_ORG_SLUG ?? ""

  function buildTakeUrl(shareCode: string): string {
    if (!takeBase) return "#"
    const params = new URLSearchParams({
      learner_ref: learnerId,
      return_url: `${appUrl}/redirect/callback`,
    })
    // If no branded subdomain is provisioned yet, route via main domain using ?_subdomain=
    if (orgSlug) params.set("_subdomain", orgSlug)
    return `${takeBase}/${shareCode}?${params.toString()}`
  }

  const ready = !!takeBase && !!orgSlug

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4">
        <User size={16} className="text-slate-400" />
        <label className="text-sm text-slate-600 shrink-0">Learner ID</label>
        <input
          type="text"
          value={learnerId}
          onChange={(e) => setLearnerId(e.target.value)}
          className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-1.5 outline-none focus:border-indigo-400"
          placeholder="your-internal-user-id"
        />
      </div>

      <div className="space-y-3">
        {assessments.map((a) => {
          const url = buildTakeUrl(a.share_code)
          return (
            <div
              key={a.id}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4"
            >
              <div>
                <p className="font-medium text-slate-900">{a.title}</p>
                <p className="text-sm text-slate-500 mt-0.5">{a.max_score} pts</p>
              </div>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className={[
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  ready
                    ? "bg-indigo-600 text-white hover:bg-indigo-700"
                    : "bg-slate-100 text-slate-400 cursor-not-allowed pointer-events-none",
                ].join(" ")}
              >
                Start <ExternalLink size={13} />
              </a>
            </div>
          )
        })}
      </div>

      {!takeBase && (
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          Set <code className="font-mono">NEXT_PUBLIC_EDPIRE_TAKE_BASE_URL</code> in your <code className="font-mono">.env.local</code>.
        </p>
      )}
      {takeBase && !orgSlug && (
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          Set <code className="font-mono">NEXT_PUBLIC_EDPIRE_ORG_SLUG</code> to your org slug — used to route the assessment player correctly.
        </p>
      )}

      <div className="rounded-lg bg-slate-50 border border-slate-200 p-4">
        <p className="text-xs font-medium text-slate-500 mb-2">Generated take URL</p>
        <code className="text-xs text-slate-600 break-all">
          {assessments[0]
            ? buildTakeUrl(assessments[0].share_code)
            : `https://edpire.com/take/SHARE_CODE?_subdomain=${orgSlug || "your-org-slug"}&learner_ref=${learnerId}&return_url=${appUrl}/redirect/callback`}
        </code>
      </div>
    </div>
  )
}
