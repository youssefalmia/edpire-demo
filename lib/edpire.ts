const BASE_URL = process.env.EDPIRE_API_BASE_URL ?? "https://edpire.com"
const API_KEY = process.env.EDPIRE_API_KEY ?? ""

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}/api/v1${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
      ...options?.headers,
    },
  })
  const json = await res.json()
  if (!res.ok) {
    const msg = json?.error?.message ?? json?.error ?? `API error ${res.status}`
    throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg))
  }
  return json.data as T
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

export async function listCollections(): Promise<Collection[]> {
  return apiFetch<Collection[]>("/collections")
}

export async function listAssessments(): Promise<AssessmentSummary[]> {
  return apiFetch<AssessmentSummary[]>("/assessments")
}
