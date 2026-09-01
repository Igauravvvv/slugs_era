import type { VercelRequest, VercelResponse } from '@vercel/node';
import { adminConfig, adminDbHeaders, requireSignedInAdmin } from '../../_lib/admin.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ success: false, error: 'Method not allowed' });
  try {
    await requireSignedInAdmin(req);
    const { url } = adminConfig();
    const response = await fetch(`${url}/rest/v1/notifications?select=*&order=created_at.desc&limit=50`, {
      headers: adminDbHeaders(),
    });
    if (!response.ok) throw new Error('Could not load notifications.');
    return res.status(200).json({ success: true, data: await response.json() });
  } catch (error: any) {
    return res.status(error?.statusCode || 500).json({ success: false, error: error?.message || 'Could not load notifications.' });
  }
}
