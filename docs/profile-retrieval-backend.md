# Profile retrieval backend contract

The frontend intentionally does not scrape LinkedIn. This document defines the interface for a future backend integration.

## Endpoint

Configure `VITE_PROFILE_ANALYSIS_API_URL` with an endpoint controlled by this project. The frontend calls it with a URL-encoded `url` query parameter.

Example request:

```
GET /api/profile-analysis?url=https%3A%2F%2Fwww.linkedin.com%2Fin%2Fexample%2F
Accept: application/json
```

Success response:

```json
{
  "profile": {
    "headline": "Product Designer | Accessibility",
    "about": "Profile summary text",
    "experience": "Relevant role and achievement text",
    "skills": ["Product Design", "Accessibility"],
    "education": "Degree or qualification"
  }
}
```

Return only profile fields that the selected provider is authorized to provide. A missing field can be omitted. `skills` accepts a string or an array of strings.

## Backend requirements before enabling live retrieval

- Choose a provider only after verifying its documented source, permission to collect and process LinkedIn profile data, terms, retention rules, and permitted commercial use.
- Keep provider API keys, OAuth client secrets, and access tokens in server-side environment variables or a secrets manager. Never send them to the browser.
- Validate that the input is a LinkedIn profile URL and restrict outbound requests to the selected provider. Do not fetch arbitrary URLs from the server, which can create an SSRF vulnerability.
- Add rate limits, timeouts, response-size limits, and clear error handling.
- Do not bypass login, access controls, robots protections, or LinkedIn restrictions.
- Do not report a live analysis as successful unless the backend returns real, authorized profile text.
- If the provider cannot retrieve the profile, return a non-2xx response and let the existing manual-text form handle the case.

## Important limitation

LinkedIn's official Profile API requires approved access and member authorization; it is not a general public-profile lookup API. If the product must analyze any public profile URL, a third-party provider must be independently vetted for lawful and contractually permitted access. Until then, leave the environment variable blank and use manual text entry.
