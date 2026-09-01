import type { VercelRequest, VercelResponse } from '@vercel/node';
import { adminConfig, adminDbHeaders, requireSignedInAdmin } from '../../_lib/admin.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });
  try {
    await requireSignedInAdmin(req);
    const { url } = adminConfig();
    const ids = Array.isArray(req.body?.ids)
      ? req.body.ids.filter((id: unknown): id is string => typeof id === 'string' && /^[a-f0-9-]{36}$/i.test(id))
      : [];
    const endpoint = new URL(`${url}/rest/v1/notifications`);
    endpoint.searchParams.set(ids.length > 0 ? 'id' : 'is_read', ids.length > 0 ? `in.(${ids.join(',')})` : 'eq.false');
    const response = await fetch(endpoint, {
      method: 'PATCH',
      headers: { ...adminDbHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_read: true }),
    });
    if (!response.ok) throw new Error('Could not update notifications.');
    return res.status(200).json({ success: true });
  } catch (error: any) {
    return res.status(error?.statusCode || 500).json({ success: false, error: error?.message || 'Could not update notifications.' });
  }
}
