import type { VercelRequest } from '@vercel/node';

export function adminConfig() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !anonKey || !serviceKey) {
    throw Object.assign(new Error('Admin notifications are not configured.'), { statusCode: 500 });
  }
  return { url, anonKey, serviceKey };
}

export async function requireSignedInAdmin(req: VercelRequest) {
  const authorization = typeof req.headers.authorization === 'string' ? req.headers.authorization : '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
  if (!token) throw Object.assign(new Error('Please sign in to view notifications.'), { statusCode: 401 });
  const { url, anonKey } = adminConfig();
  const response = await fetch(`${url}/auth/v1/user`, {
    headers: { apikey: anonKey, Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw Object.assign(new Error('Your session expired. Please sign in again.'), { statusCode: 401 });
  return response.json();
}

export function adminDbHeaders() {
  const { serviceKey } = adminConfig();
  return { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` };
}
