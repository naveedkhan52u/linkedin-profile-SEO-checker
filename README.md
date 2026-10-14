# LinkedIn Profile SEO Checker

A URL-first LinkedIn profile SEO analysis tool with a manual-text fallback.

## Current behavior

1. The user enters a LinkedIn profile URL.
2. If `VITE_PROFILE_ANALYSIS_API_URL` points to a configured backend endpoint, the app requests profile text from that endpoint.
3. If no endpoint is configured, or retrieval fails, the app keeps the URL and opens the existing manual-text form.
4. The user reviews or enters the profile text and generates the advisory SEO report.

**Live profile retrieval is not enabled by default.** The current report scoring is a local heuristic, not an official LinkedIn ranking score or a verified LinkedIn search-ranking prediction.

## Configure an authorized retrieval backend

Create a local `.env` file based on `.env.example` and set `VITE_PROFILE_ANALYSIS_API_URL` to an endpoint you control. Restart the Vite dev server after changing environment variables.

The endpoint must be backed by a provider and data-access method you are authorized to use. Provider API keys, LinkedIn client secrets, and access tokens must remain on the backend. Never put secrets in a `VITE_*` variable because Vite exposes those values to browser code.

The frontend sends a GET request with a URL-encoded `url` query parameter. A successful endpoint response should follow this shape:

```json
{
  "profile": {
    "headline": "Example headline",
    "about": "Example About section",
    "experience": "Example work experience",
    "skills": ["SEO", "Web Development"],
    "education": "Example qualification"
  }
}
```

Each profile field is optional, but at least one usable text field is required. `skills` may be either a string or an array of strings. The endpoint should return an appropriate non-2xx response when it cannot lawfully or reliably retrieve the requested profile. The UI then falls back to manual text entry.

## LinkedIn access and compliance

Do not implement HTML scraping, session-cookie reuse, or browser automation to extract LinkedIn profiles. LinkedIn restricts unauthorized scraping and its official Profile API is not a general endpoint for looking up any public profile from a URL. Official API access requires the relevant approval, permissions, and member authorization. For analyzing arbitrary public URLs, use only a reputable provider whose collection method, terms, and permitted use you have verified; do not assume such a provider has LinkedIn authorization just because it offers an API.

Useful references:
- [LinkedIn Profile API](https://learn.microsoft.com/en-us/linkedin/shared/integrations/people/profile-api?view=li-lms-2025-04)
- [LinkedIn API Terms](https://developer.linkedin.com/legal)
- [LinkedIn OAuth 2.0](https://learn.microsoft.com/en-us/linkedin/shared/authentication/authentication?view=li-lms-2026-01)

## Development

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```
