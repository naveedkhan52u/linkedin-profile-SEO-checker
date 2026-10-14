import { createHmac, randomBytes, timingSafeEqual, createHash } from 'node:crypto';

export function getConfig() {
  const { LINKEDIN_CLIENT_ID, LINKEDIN_CLIENT_SECRET, LINKEDIN_REDIRECT_URI, LINKEDIN_APP_URL, LINKEDIN_OAUTH_SECRET } = process.env;
  if (!LINKEDIN_CLIENT_ID || !LINKEDIN_CLIENT_SECRET || !LINKEDIN_REDIRECT_URI || !LINKEDIN_APP_URL || !LINKEDIN_OAUTH_SECRET) {
    throw new Error('LinkedIn OAuth environment variables are incomplete.');
  }
  if (LINKEDIN_OAUTH_SECRET.length < 32) {
    throw new Error('LINKEDIN_OAUTH_SECRET must contain at least 32 characters.');
  }
  return { clientId: LINKEDIN_CLIENT_ID, clientSecret: LINKEDIN_CLIENT_SECRET, redirectUri: LINKEDIN_REDIRECT_URI, appUrl: LINKEDIN_APP_URL.replace(/\/$/, ''), secret: LINKEDIN_OAUTH_SECRET };
}

export function sign(value, secret) {
  return createHmac('sha256', secret).update(value).digest('base64url');
}

export function seal(payload, secret) {
  const value = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return value + '.' + sign(value, secret);
}

export function unseal(value, secret) {
  if (!value || typeof value !== 'string') return null;
  const [body, signature, extra] = value.split('.');
  if (!body || !signature || extra) return null;
  const expected = sign(body, secret);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (!payload || !Number.isFinite(payload.exp) || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export function parseCookies(req) {
  const result = {};
  for (const part of (req.headers.cookie || '').split(';')) {
    const index = part.indexOf('=');
    if (index > 0) result[part.slice(0, index).trim()] = decodeURIComponent(part.slice(index + 1).trim());
  }
  return result;
}

export function cookie(name, value, options = {}) {
  const { maxAge = 0, path = '/api/linkedin', httpOnly = true } = options;
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `${name}=${encodeURIComponent(value)}; Path=${path}; Max-Age=${maxAge}; HttpOnly; SameSite=Lax${secure}`;
}

export function methodNotAllowed(res) {
  res.setHeader('Allow', 'GET');
  return res.status(405).json({ error: 'Method not allowed.' });
}

export function randomState() {
  return randomBytes(32).toString('base64url');
}

export function createVerifier() {
  return randomBytes(48).toString('base64url');
}

export function challengeFor(verifier) {
  return createHash('sha256').update(verifier).digest('base64url');
}
