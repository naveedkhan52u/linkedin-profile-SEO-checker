import { getConfig, seal, cookie, randomState, methodNotAllowed } from '../../lib/linkedin-oauth.js';

export default function handler(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res);
  let config;
  try { config = getConfig(); } catch {
    return res.status(500).send('LinkedIn sign-in is not configured yet. The site owner must add the required Vercel environment variables.');
  }

  const state = randomState();
  const stateCookie = seal({ state, exp: Date.now() + 10 * 60 * 1000 }, config.secret);
  const authorize = new URL('https://www.linkedin.com/oauth/v2/authorization');
  authorize.search = new URLSearchParams({
    response_type: 'code',
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    state,
    scope: 'openid profile email'
  }).toString();

  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Set-Cookie', cookie('linkedin_oauth_state', stateCookie, { maxAge: 600 }));
  return res.redirect(302, authorize.toString());
}
