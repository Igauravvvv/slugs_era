/**
 * Supabase Storage CDN URLs
 *
 * All static assets are hosted in the Supabase Storage bucket "assets".
 * This module provides type-safe, centralized access to every asset URL.
 *
 * Upload files to Supabase → Storage → assets bucket.
 * Filenames are sanitized (spaces→hyphens, &→and, apostrophes removed).
 */

const SUPABASE_CDN_BASE = import.meta.env.VITE_SUPABASE_URL 
  ? `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/assets`
  : '/images';

// Use Supabase CDN for all static assets
const ACTIVE_CDN_BASE = SUPABASE_CDN_BASE;

/** Build a CDN URL for any file in the assets bucket */
export function cdnUrl(filename: string): string {
  return `${ACTIVE_CDN_BASE}/${filename}`;
}

/**
 * All brand / site-wide assets
 */
export const CDN = {
  /** Slug's Era logo (PNG, 80 KB) */
  LOGO: cdnUrl('logo.webp'),

  /** Animated logo video (MP4, 460 KB) */
  LOGO_ANIMATED: cdnUrl('logos-animated.mp4'),

  /** Text logo for marquee / footer (PNG, 86 KB) */
  TEXT_LOGO: cdnUrl('TEXT-LOGO.webp'),

  /** Hero model image (PNG, 8.3 MB) */
  MODEL_HERO: cdnUrl('MODEL-WITH-SHIRT.webp'),

  // ── Product Images ───────────────────────────────

  /** Let The Moment Play tee */
  VINYL_MOMENT: cdnUrl('vinyl-moment.webp'),

  /** The Tortoise tee */
  TORTOISE: cdnUrl('tortoise.webp'),

  /** Slow Down tee */
  SLOTH: cdnUrl('sloth.webp'),

  /** The Slow Club tee */
  SLOW_CLUB: cdnUrl('slow-club.webp'),

  /** Slugs Era Intro – Barbed Wire tee */
  BARBED_WIRE: cdnUrl('barbed-wire.webp'),

  /** NYT & WAVES shirt */
  NYT_WAVES: cdnUrl('NYT-and-WAVES.webp'),

  /** SUNLIGHT & WAVES shirt */
  SUNLIGHT_WAVES: cdnUrl('SUNLIGHT-and-WAVES.webp'),

  /** Classic Embroidered Logo hoodie */
  HOODIE_BLACK: cdnUrl('hoodie-black.webp'),

  /** White hoodie */
  WHITE_HOODIE_TABLE: cdnUrl('white_hoodie.webp'),

  /** Red on table */
  RED_ON_TABLE: cdnUrl('Red_on_table.webp'),

  /** Vintage Patchwork hoodie */
  PATCHWORK_HOODIE: cdnUrl('patchwork-hoodie.webp'),

  /** Graphic Print Club hoodie */
  PRINTED_HOODIE: cdnUrl('printed-hoodie.webp'),

  /** Transparency Background Image */
  TRANSPARENCY_BG: cdnUrl('transparency.png'),

  /** Value Pillars Background Images */
  ARTWORK_BG: cdnUrl('ArtWork.png'),
  COMMUNITY_BG: cdnUrl('community.png'),
  FOOTPRINT_BG: cdnUrl('footprint.png'),
  FLUID_FITS_BG: cdnUrl('Fluidfits.png'),
  MOVEMENT_BG: cdnUrl('Movement.png'),
  INSPIRATION_BG: cdnUrl('inspiration.png'),
  FABRIC_LOADING_BG: cdnUrl('fabricloading.jpg'),
} as const;

export type CDNKey = keyof typeof CDN;
