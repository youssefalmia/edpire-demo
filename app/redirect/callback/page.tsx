import { redirect } from "next/navigation"

export default function RedirectCallbackAliasPage() {
  redirect("/simple-redirect/callback")
}
