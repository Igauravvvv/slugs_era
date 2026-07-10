/**
 * Supabase Storage CDN URLs
 *
 * All static assets are hosted in the Supabase Storage bucket "assets".
 * This module provides type-safe, centralized access to every asset URL.
 *
 * Upload files to Supabase → Storage → assets bucket.
 * Filenames are sanitized (spaces→hyphens, &→and, apostrophes removed).
 */

const env = typeof process !== 'undefined' && process.env.VITE_SUPABASE_URL ? process.env : (import.meta as any).env || {};
const isPlaceholder = !env.VITE_SUPABASE_URL || env.VITE_SUPABASE_URL.includes('your-project.supabase.co');

const SUPABASE_CDN_BASE = isPlaceholder 
  ? '/images'
  : `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/assets`;

// Use Vercel's edge network for static assets (automatically served from /public/images)
const ACTIVE_CDN_BASE = '/images';

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

  /** Owns the Game Hoodie */
  OWNS_THE_GAME_F: cdnUrl('owns_the_game_f.webp'),
  OWNS_THE_GAME_B: cdnUrl('owns_the_game_b.webp'),

  /** Cherry Blossom Hoodie */
  CHERRY_BLOSSOM_F: cdnUrl('cherry_blossom_f.webp'),
  CHERRY_BLOSSOM_B: cdnUrl('cherry_blossom_b.webp'),

  /** Brown Patch Hoodie */
  BROWN_PATCH_F: cdnUrl('brown_patch_f.webp'),
  BROWN_PATCH_B: cdnUrl('brown_patch_b.webp'),

  /** Couple Heart Patch Hoodies */
  COUPLE_FOR_EVER_F: cdnUrl('couple_for_ever_f.webp'),
  COUPLE_FOR_B: cdnUrl('couple_for_b.webp'),
  COUPLE_EVER_B: cdnUrl('couple_ever_b.webp'),

  /** Red Hoodie */
  RED_HOODIE_F: cdnUrl('red_hoodie_f.webp'),

  /** Red on table */
  RED_ON_TABLE: cdnUrl('Red_on_table.webp'),

  /** Transparency Background Image */
  TRANSPARENCY_BG: cdnUrl('transparency.webp'),

  /** Value Pillars Background Images */
  ARTWORK_BG: cdnUrl('ArtWork.webp'),
  COMMUNITY_BG: cdnUrl('community.webp'),
  FOOTPRINT_BG: cdnUrl('footprint.webp'),
  FLUID_FITS_BG: cdnUrl('Fluidfits.webp'),
  MOVEMENT_BG: cdnUrl('Movement.webp'),
  INSPIRATION_BG: cdnUrl('inspiration.webp'),
  FABRIC_LOADING_BG: cdnUrl('fabricloading.webp'),
} as const;

export type CDNKey = keyof typeof CDN;
