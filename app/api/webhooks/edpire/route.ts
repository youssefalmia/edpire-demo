import { applyWebhookSubmissionResult, verifyWebhookSignature } from "@/lib/demo-runtime"

interface SubmissionGradedPayload {
  event: "submission.graded"
  submission_id: string
  assessment_id: string
  learner_ref: string
  score: number
  max_score: number
  percentage: number
  passed: boolean
  submitted_at: string
}

export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  const rawBody = await req.text()
  const signature = req.headers.get("x-edpire-signature")

  if (!verifyWebhookSignature(rawBody, signature)) {
    return new Response("Unauthorized", { status: 401 })
  }

  let payload: SubmissionGradedPayload

  try {
    payload = JSON.parse(rawBody) as SubmissionGradedPayload
  } catch {
    return new Response("Bad Request", { status: 400 })
  }

  if (payload.event !== "submission.graded") {
    return new Response("Ignored", { status: 200 })
  }

  // This demo intentionally keeps webhook handling narrow:
  // it only shows how a graded submission can update local wrapper data.
  applyWebhookSubmissionResult({
    id: payload.submission_id,
    assessment_id: payload.assessment_id,
    learner_ref: payload.learner_ref,
    score: payload.score,
    max_score: payload.max_score,
    percentage: payload.percentage,
    passed: payload.passed,
    submitted_at: payload.submitted_at,
  })

  return new Response("OK", { status: 200 })
}
