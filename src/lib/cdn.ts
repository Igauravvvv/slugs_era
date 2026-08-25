/**
 * Supabase Storage CDN URLs
 *
 * All static assets are hosted in the Supabase Storage bucket "assets".
 * This module provides type-safe, centralized access to every asset URL.
 *
 * Upload files to Supabase → Storage → assets bucket.
 * Filenames are sanitized (spaces→hyphens, &→and, apostrophes removed).
 */

// Use Vercel's edge network for static assets (automatically served from /public/images)
const ACTIVE_CDN_BASE = '/images';

/** Build a CDN URL for any file in the assets bucket */
export function cdnUrl(filename: string): string {
  return `${ACTIVE_CDN_BASE}/${filename}`;
}

/**
 * Deliver dynamic Supabase product uploads through the site's cached WebP
 * image endpoint. Static brand assets already use Vercel's edge CDN.
 */
export function optimizedProductImageUrl(source: string, width = 640, quality = 72): string {
  if (isVideoMedia(source)) return source;
  if (!source.includes('usymwbefimqcsxbbojyt.supabase.co/storage/v1/object/public/product-images/')) return source;
  return `/api/image?src=${encodeURIComponent(source)}&w=${width}&q=${quality}`;
}

export function optimizedProductImageSrcSet(source: string): string | undefined {
  if (isVideoMedia(source)) return undefined;
  if (!source.includes('usymwbefimqcsxbbojyt.supabase.co/storage/v1/object/public/product-images/')) return undefined;
  return [320, 640, 960]
    .map((width) => `${optimizedProductImageUrl(source, width)} ${width}w`)
    .join(', ');
}

/** Warm the browser cache for the next gallery image at the size it will use. */
export function preloadProductImage(source: string, sizes: string): void {
  if (typeof window === 'undefined' || !source || isVideoMedia(source)) return;
  const image = new Image();
  const srcSet = optimizedProductImageSrcSet(source);
  if (srcSet) image.srcset = srcSet;
  image.sizes = sizes;
  image.src = optimizedProductImageUrl(source, 960);
  image.decoding = 'async';
}

/** Detect product videos stored alongside images in the product media array. */
export function isVideoMedia(source = ''): boolean {
  const pathname = source.split(/[?#]/, 1)[0].toLowerCase();
  return /\.(mp4|webm|mov|m4v|ogv)$/.test(pathname);
}

const STATIC_RESPONSIVE_IMAGES: Record<string, string> = {
  'Fluidfits.webp': 'value-fluid-fits',
  'transparency.webp': 'value-transparency',
  'ArtWork.webp': 'value-artwork',
  'Red_on_table.webp': 'value-print',
  'fabricloading.webp': 'value-sourcing',
  'community.webp': 'value-community',
};

export function responsiveStaticImageSrcSet(source: string): string | undefined {
  const filename = source.split('/').pop() || '';
  const optimizedName = STATIC_RESPONSIVE_IMAGES[filename];
  return optimizedName
    ? `/images/cdn/${optimizedName}-480.webp 480w, /images/cdn/${optimizedName}-960.webp 960w`
    : undefined;
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

  /** First image in the live homepage hero slider. */
  MODEL_HERO: cdnUrl('Female_model_vinyl.webp'),

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
