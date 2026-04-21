# Edpire Integration Examples

Live working examples of Edpire integration patterns. The redirect flow is available now, and the SDK flow is reserved for a future update.

**[Live demo ->](https://your-demo.vercel.app)**

---

## Patterns

### Pattern A - Redirect *(recommended starting point)*

Send learners to the Edpire-hosted player. Your app constructs a URL, the learner completes the assessment, and Edpire redirects back with the score.

**When to use:** You want to embed assessments in under a day, or you want Edpire's full UI (timer, hints, rich media).

```text
YOUR APP  ->  redirect to https://{org}.edpire.com/take/{shareCode}?learner_ref=...&return_url=...
                       learner completes assessment
YOUR APP  <-  https://your-app.com/callback?submission_id=...&score=...&max_score=...
```

### Pattern B - SDK integration *(coming soon)*

An embedded SDK-based flow will be added back in a future update. The current demo intentionally does not ship that implementation.

---

## Setup

```bash
git clone https://github.com/your-org/edpire-integration-demo
cd edpire-integration-demo
npm install

cp .env.example .env.local
# Fill in your API key and org details in .env.local

npm run dev
# Open http://localhost:3000
```

### Environment variables

| Variable | Required | Description |
|---|---|---|
| `EDPIRE_API_KEY` | Yes | API key from Settings -> Integrations -> API Keys |
| `EDPIRE_API_BASE_URL` | No | Default: `https://app.edpire.com` |
| `NEXT_PUBLIC_EDPIRE_TAKE_BASE_URL` | Pattern A | e.g. `https://your-org.edpire.com/take` |
| `NEXT_PUBLIC_APP_URL` | Pattern A | This app's public URL (for `return_url`) |

---

## Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-org/edpire-integration-demo)

Set the environment variables in the Vercel dashboard after deploying.

---

## Security

- Your `EDPIRE_API_KEY` is never sent to the browser; all API calls are proxied through Next.js server routes.
- The `learner_ref` field is your internal user ID; use your authenticated user's ID in production.
