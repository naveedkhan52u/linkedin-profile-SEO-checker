import { getConfig, unseal, seal, parseCookies, cookie, methodNotAllowed } from '../../lib/linkedin-oauth.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res);
  let config;
  try { config = getConfig(); } catch {
    return res.status(500).send('LinkedIn sign-in is not configured yet. The site owner must add the required Vercel environment variables.');
  }

  const fail = () => {
    res.setHeader('Set-Cookie', cookie('linkedin_oauth_state', '', { maxAge: 0 }));
    res.setHeader('Cache-Control', 'no-store');
    return res.redirect(302, config.appUrl + '/?linkedin=error');
  };

  const { code, state, error } = req.query || {};
  if (error || typeof code !== 'string' || typeof state !== 'string') return fail();
  const cookies = parseCookies(req);
  const saved = unseal(cookies.linkedin_oauth_state, config.secret);
  if (!saved || saved.state !== state) return fail();

  try {
    const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: config.redirectUri,
        client_id: config.clientId,
        client_secret: config.clientSecret
      }),
      signal: AbortSignal.timeout(10000)
    });
    if (!tokenResponse.ok) return fail();
    const tokenData = await tokenResponse.json();
    if (typeof tokenData.access_token !== 'string') return fail();

    const userResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: { Authorization: 'Bearer ' + tokenData.access_token, Accept: 'application/json' },
      signal: AbortSignal.timeout(10000)
    });
    if (!userResponse.ok) return fail();
    const user = await userResponse.json();
    if (typeof user.sub !== 'string') return fail();

    // Store only basic OIDC identity details. Never persist the access token in the browser or session cookie.
    const profile = {
      sub: user.sub,
      name: typeof user.name === 'string' ? user.name : '',
      given_name: typeof user.given_name === 'string' ? user.given_name : '',
      family_name: typeof user.family_name === 'string' ? user.family_name : '',
      picture: typeof user.picture === 'string' ? user.picture : '',
      email: typeof user.email === 'string' ? user.email : '',
      exp: Date.now() + 7 * 24 * 60 * 60 * 1000
    };
    const session = seal(profile, config.secret);
    res.setHeader('Set-Cookie', [
      cookie('linkedin_oauth_state', '', { maxAge: 0 }),
      cookie('linkedin_profile', session, { maxAge: 7 * 24 * 60 * 60 })
    ]);
    res.setHeader('Cache-Control', 'no-store');
    return res.redirect(302, config.appUrl + '/?linkedin=connected');
  } catch {
    return fail();
  }
}
