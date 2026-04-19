import { NextResponse } from "next/server"
import { listCollections } from "@/lib/edpire"

export async function GET() {
  try {
    const collections = await listCollections()
    return NextResponse.json({ data: collections })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
