"use client"

import { useState } from "react"
import { ExternalLink, User } from "lucide-react"
import type { AssessmentSummary } from "@/lib/edpire"
import { buildEdpireTakeUrl, getTakeUrlReadiness } from "@/lib/take-url"

interface Props {
  assessments: AssessmentSummary[]
  returnPath?: string
}

export function RedirectLauncher({
  assessments,
  returnPath = "/simple-redirect",
}: Props) {
  const [learnerId, setLearnerId] = useState("demo-user-01")
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ""
  const { orgSlug, configuredTenantOrigin, fallbackTakeBase, ready } = getTakeUrlReadiness()

  function buildTakeUrl(shareCode: string) {
    if (!ready) return "#"
    return buildEdpireTakeUrl({
      shareCode,
      learnerRef: learnerId,
      returnUrl: `${appUrl}${returnPath}`,
      backUrl: `${appUrl}/simple-redirect`,
      backLabel: "Back to your platform",
      reportLabel: "Return to platform",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4">
        <User size={16} className="text-slate-400" />
        <label className="shrink-0 text-sm text-slate-600">Learner ID</label>
        <input
          type="text"
          value={learnerId}
          onChange={(event) => setLearnerId(event.target.value)}
          className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-indigo-400"
          placeholder="your-internal-user-id"
        />
      </div>

      <div className="space-y-3">
        {assessments.map((assessment) => {
          const url = buildTakeUrl(assessment.share_code)

          return (
            <div
              key={assessment.id}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4"
            >
              <div>
                <p className="font-medium text-slate-900">{assessment.title}</p>
                <p className="mt-0.5 text-sm text-slate-500">{assessment.max_score} pts</p>
              </div>
              <a
                href={url}
                className={[
                  "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                  ready
                    ? "bg-indigo-600 text-white hover:bg-indigo-700"
                    : "pointer-events-none cursor-not-allowed bg-slate-100 text-slate-400",
                ].join(" ")}
              >
                Start <ExternalLink size={13} />
              </a>
            </div>
          )
        })}
      </div>

      {!ready && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
          Set <code className="font-mono">NEXT_PUBLIC_EDPIRE_ORG_SLUG</code> to your assigned slug,
          or provide <code className="font-mono">NEXT_PUBLIC_EDPIRE_TENANT_ORIGIN</code> directly.
        </p>
      )}

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
        <p className="mb-2 text-xs font-medium text-slate-500">Generated take URL</p>
        <code className="break-all text-xs text-slate-600">
          {assessments[0]
            ? buildTakeUrl(assessments[0].share_code)
            : configuredTenantOrigin
            ? `${configuredTenantOrigin}/take/SHARE_CODE?learner_ref=${learnerId}&return_url=${appUrl}${returnPath}`
            : orgSlug
            ? `https://${orgSlug}.edpire.com/take/SHARE_CODE?learner_ref=${learnerId}&return_url=${appUrl}${returnPath}`
            : `${fallbackTakeBase}/SHARE_CODE?learner_ref=${learnerId}&return_url=${appUrl}${returnPath}`}
        </code>
      </div>
    </div>
  )
}
