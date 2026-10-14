import { getConfig, cookie, methodNotAllowed } from '../../lib/linkedin-oauth.js';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }
  try { getConfig(); } catch {
    return res.status(500).json({ error: 'LinkedIn sign-in is not configured.' });
  }
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Set-Cookie', [
    cookie('linkedin_profile', '', { maxAge: 0 }),
    cookie('linkedin_oauth_state', '', { maxAge: 0 })
  ]);
  return res.status(200).json({ connected: false });
}
