import type { VercelRequest, VercelResponse } from '@vercel/node';
import sharp from 'sharp';

const ALLOWED_HOST = 'usymwbefimqcsxbbojyt.supabase.co';
const ALLOWED_PATH = '/storage/v1/object/public/product-images/';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return res.status(405).end();
  }

  const sourceValue = Array.isArray(req.query.src) ? req.query.src[0] : req.query.src;
  if (!sourceValue) return res.status(400).json({ error: 'Missing image source.' });

  let source: URL;
  try {
    source = new URL(sourceValue);
  } catch {
    return res.status(400).json({ error: 'Invalid image source.' });
  }

  if (source.protocol !== 'https:' || source.hostname !== ALLOWED_HOST || !source.pathname.startsWith(ALLOWED_PATH)) {
    return res.status(403).json({ error: 'Image source is not allowed.' });
  }

  const widthValue = Array.isArray(req.query.w) ? req.query.w[0] : req.query.w;
  const qualityValue = Array.isArray(req.query.q) ? req.query.q[0] : req.query.q;
  const width = Math.min(1600, Math.max(160, Number(widthValue) || 640));
  const quality = Math.min(85, Math.max(45, Number(qualityValue) || 72));

  try {
    const upstream = await fetch(source, { headers: { Accept: 'image/avif,image/webp,image/*' } });
    if (!upstream.ok) return res.status(upstream.status).end();

    const image = await sharp(Buffer.from(await upstream.arrayBuffer()))
      .rotate()
      .resize({ width, withoutEnlargement: true })
      .webp({ quality, smartSubsample: true })
      .toBuffer();

    res.setHeader('Content-Type', 'image/webp');
    // Product filenames are immutable timestamped uploads, so browsers and the
    // Vercel edge can safely reuse transformed variants for a full year.
    res.setHeader('Cache-Control', 'public, max-age=31536000, s-maxage=31536000, immutable');
    res.setHeader('Content-Length', String(image.length));
    res.setHeader('X-Content-Type-Options', 'nosniff');
    return req.method === 'HEAD' ? res.status(200).end() : res.status(200).send(image);
  } catch {
    return res.status(502).json({ error: 'Unable to optimize image.' });
  }
}
