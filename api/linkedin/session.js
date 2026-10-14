import { getConfig, unseal, parseCookies, methodNotAllowed } from '../../lib/linkedin-oauth.js';

export default function handler(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res);
  let config;
  try { config = getConfig(); } catch {
    return res.status(500).json({ error: 'LinkedIn sign-in is not configured.' });
  }
  const cookies = parseCookies(req);
  const profile = unseal(cookies.linkedin_profile, config.secret);
  res.setHeader('Cache-Control', 'no-store, private');
  res.setHeader('Vary', 'Cookie');
  if (!profile) return res.status(200).json({ connected: false });
  const { exp, ...safeProfile } = profile;
  return res.status(200).json({ connected: true, profile: safeProfile });
}
