const BASE_URL = process.env.EDPIRE_API_BASE_URL ?? "https://edpire.com"
const API_KEY = process.env.EDPIRE_API_KEY ?? ""

interface ApiError {
  message?: string
}

interface ApiEnvelope<T> {
  data: T | null
  error?: ApiError | string | null
  meta?: {
    total?: number
    count?: number
    last_page?: number
    current_page?: number
  } | null
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}/api/v1${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
      ...options?.headers,
    },
    cache: options?.cache ?? "no-store",
  })

  const json = (await res.json()) as ApiEnvelope<T>

  if (!res.ok || json.error) {
    const msg =
      typeof json.error === "string"
        ? json.error
        : json.error?.message ?? `API error ${res.status}`
    throw new Error(msg)
  }

  if (json.data === null) {
    throw new Error(`Edpire returned empty data for ${path}`)
  }

  return json.data
}

export interface Collection {
  id: string
  name: string
  slug: string
  description: string | null
  item_count: number
}

export interface AssessmentSummary {
  id: string
  title: string
  description: string | null
  type: string
  status: string
  share_code: string
  max_score: number
  exercise_count: number
}

export interface SubmissionResult {
  id: string
  assessment_id: string
  learner_ref: string
  score: number
  max_score: number
  percentage: number
  passed: boolean
  submitted_at: string
}

export async function listCollections(): Promise<Collection[]> {
  return apiFetch<Collection[]>("/collections")
}

export async function listAssessments(): Promise<AssessmentSummary[]> {
  if (!API_KEY) return []

  const all: AssessmentSummary[] = []
  let page = 1
  const perPage = 20

  while (true) {
    const params = new URLSearchParams({
      page: String(page),
      per_page: String(perPage),
    })

    const res = await fetch(`${BASE_URL}/api/v1/assessments?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })

    const json = (await res.json()) as ApiEnvelope<AssessmentSummary[]>

    if (!res.ok || json.error) {
      const msg =
        typeof json.error === "string"
          ? json.error
          : json.error?.message ?? `API error ${res.status}`
      throw new Error(msg)
    }

    const items = json.data ?? []
    all.push(...items)

    const lastPage = json.meta?.last_page
    if (lastPage !== undefined) {
      if (page >= lastPage) break
    } else if (items.length < perPage) {
      break
    }

    page += 1
  }

  return all
}

export async function getSubmission(submissionId: string): Promise<SubmissionResult | null> {
  if (!submissionId || !API_KEY) return null

  try {
    return await apiFetch<SubmissionResult>(`/submissions/${submissionId}`, {
      cache: "no-store",
    })
  } catch {
    return null
  }
}
