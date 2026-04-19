import { NextResponse } from "next/server"
import { listAssessments } from "@/lib/edpire"

export async function GET() {
  try {
    const data = await listAssessments()
    return NextResponse.json({ data })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
