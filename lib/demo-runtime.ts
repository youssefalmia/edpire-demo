import "server-only"

import { createHmac, timingSafeEqual } from "crypto"
import { revalidatePath } from "next/cache"
import { getSubmission, type SubmissionResult } from "@/lib/edpire"
import {
  getAttemptById,
  updateAttemptFromSubmissionResult,
  updateLatestPendingAttemptFromWebhook,
} from "@/lib/demo-store"

function refreshDemoPaths() {
  revalidatePath("/")
  revalidatePath("/builder")
  revalidatePath("/library")
  revalidatePath("/library/evaluations")
  revalidatePath("/library/exams")
}

export async function resolveAttemptResult(attemptId: string, submissionId: string) {
  const attempt = getAttemptById(attemptId)
  if (!attempt || !submissionId) return attempt
  if (attempt.submissionId === submissionId && attempt.status === "completed") return attempt

  const result = await getSubmission(submissionId)
  if (!result) return attempt

  const updated = updateAttemptFromSubmissionResult({
    attemptId,
    result,
    updatedViaWebhook: false,
  })

  if (updated) {
    refreshDemoPaths()
  }

  return updated
}

export function verifyWebhookSignature(rawBody: string, header: string | null) {
  const secret = process.env.EDPIRE_WEBHOOK_SECRET
  if (!secret || !header) return false

  const expected = `sha256=${createHmac("sha256", secret).update(rawBody, "utf8").digest("hex")}`

  try {
    return timingSafeEqual(Buffer.from(expected, "utf8"), Buffer.from(header, "utf8"))
  } catch {
    return false
  }
}

export function applyWebhookSubmissionResult(result: SubmissionResult) {
  const updated = updateLatestPendingAttemptFromWebhook(result)
  if (updated) {
    refreshDemoPaths()
  }

  return updated
}
