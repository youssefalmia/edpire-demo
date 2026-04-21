import { redirect } from "next/navigation"

interface Props {
  searchParams: Promise<{
    submission_id?: string
    score?: string
    max_score?: string
  }>
}

export default async function SimpleRedirectCallbackPage({ searchParams }: Props) {
  const params = await searchParams
  const nextParams = new URLSearchParams()

  if (params.submission_id) nextParams.set("submission_id", params.submission_id)
  if (params.score) nextParams.set("score", params.score)
  if (params.max_score) nextParams.set("max_score", params.max_score)

  const nextUrl = nextParams.toString()
    ? `/simple-redirect?${nextParams.toString()}`
    : "/simple-redirect"

  redirect(nextUrl)
}
