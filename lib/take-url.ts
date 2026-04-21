type BuildTakeUrlInput = {
  shareCode: string
  learnerRef: string
  returnUrl: string
  backUrl?: string
  backLabel?: string
  reportLabel?: string
}

function getOrgSlug() {
  return process.env.NEXT_PUBLIC_EDPIRE_ORG_SLUG ?? ""
}

function getConfiguredTenantOrigin() {
  return process.env.NEXT_PUBLIC_EDPIRE_TENANT_ORIGIN ?? ""
}

function getFallbackTakeBase() {
  return process.env.NEXT_PUBLIC_EDPIRE_TAKE_BASE_URL ?? "https://edpire.com/take"
}

// Mirrors the Edulylo pattern:
// - prefer a branded tenant origin like https://{slug}.edpire.com
// - otherwise allow an explicit prebuilt take base for teams that already have
//   their own known take entrypoint
export function buildEdpireTakeUrl({
  shareCode,
  learnerRef,
  returnUrl,
  backUrl,
  backLabel,
  reportLabel,
}: BuildTakeUrlInput) {
  const orgSlug = getOrgSlug()
  const configuredTenantOrigin = getConfiguredTenantOrigin().trim()
  const fallbackTakeBase = getFallbackTakeBase().trim()

  const tenantOrigin = configuredTenantOrigin || (orgSlug ? `https://${orgSlug}.edpire.com` : "")

  const takeUrl = tenantOrigin
    ? new URL(`/take/${shareCode}`, tenantOrigin)
    : new URL(`${fallbackTakeBase.replace(/\/$/, "")}/${shareCode}`)

  takeUrl.searchParams.set("learner_ref", learnerRef)
  takeUrl.searchParams.set("return_url", returnUrl)

  if (backUrl) takeUrl.searchParams.set("back_url", backUrl)
  if (backLabel) takeUrl.searchParams.set("back_label", backLabel)
  if (reportLabel) takeUrl.searchParams.set("report_label", reportLabel)

  return takeUrl.toString()
}

export function getTakeUrlReadiness() {
  const orgSlug = getOrgSlug()
  const configuredTenantOrigin = getConfiguredTenantOrigin().trim()
  const fallbackTakeBase = getFallbackTakeBase().trim()

  return {
    orgSlug,
    configuredTenantOrigin,
    fallbackTakeBase,
    ready: Boolean(configuredTenantOrigin || orgSlug || fallbackTakeBase),
  }
}
