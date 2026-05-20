import { supabase } from './supabase';

/**
 * Upload an image to Supabase Storage and return the public CDN URL.
 * All images go through this single pipeline — never store raw files in the DB,
 * only the returned CDN URL string.
 *
 * @param file - The File object to upload
 * @param bucket - The storage bucket name ('product-images' | 'section-images' | 'drop-covers')
 * @returns The public CDN URL of the uploaded image
 */
export async function uploadImage(
  file: File,
  bucket: 'product-images' | 'section-images' | 'drop-covers'
): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file, {
      cacheControl: '31536000', // 1 year cache
      upsert: false,
    });

  if (error) {
    console.error(`Upload failed for ${file.name}:`, error);
    throw new Error(`Failed to upload image: ${error.message}`);
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
  return data.publicUrl;
}

/**
 * Delete an image from Supabase Storage.
 *
 * @param url - The full CDN URL of the image
 * @param bucket - The storage bucket name
 */
export async function deleteImage(
  url: string,
  bucket: 'product-images' | 'section-images' | 'drop-covers'
): Promise<void> {
  // Extract the filename from the CDN URL
  const parts = url.split('/');
  const fileName = parts[parts.length - 1];

  if (!fileName) {
    throw new Error('Could not extract filename from URL');
  }

  const { error } = await supabase.storage.from(bucket).remove([fileName]);

  if (error) {
    console.error(`Delete failed for ${fileName}:`, error);
    throw new Error(`Failed to delete image: ${error.message}`);
  }
}

/**
 * Upload multiple images and return their CDN URLs.
 *
 * @param files - Array of File objects
 * @param bucket - The storage bucket name
 * @returns Array of public CDN URLs
 */
export async function uploadMultipleImages(
  files: File[],
  bucket: 'product-images' | 'section-images' | 'drop-covers'
): Promise<string[]> {
  const results = await Promise.allSettled(
    files.map((file) => uploadImage(file, bucket))
  );

  const urls: string[] = [];
  const errors: string[] = [];

  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      urls.push(result.value);
    } else {
      errors.push(`${files[index].name}: ${result.reason?.message || 'Unknown error'}`);
    }
  });

  if (errors.length > 0) {
    console.warn('Some uploads failed:', errors);
  }

  return urls;
}

/**
 * List all files in a Supabase Storage bucket.
 *
 * @param bucket - The storage bucket name
 * @returns Array of file objects with public URLs
 */
export async function listBucketFiles(
  bucket: 'product-images' | 'section-images' | 'drop-covers'
) {
  const { data, error } = await supabase.storage.from(bucket).list('', {
    limit: 500,
    sortBy: { column: 'created_at', order: 'desc' },
  });

  if (error) {
    console.error(`Failed to list files in ${bucket}:`, error);
    throw new Error(`Failed to list files: ${error.message}`);
  }

  return (data || [])
    .filter((f) => f.name !== '.emptyFolderPlaceholder')
    .map((file) => {
      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(file.name);
      return {
        ...file,
        bucket_id: bucket,
        publicUrl: urlData.publicUrl,
      };
    });
}
