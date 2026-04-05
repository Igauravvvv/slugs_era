import multer from 'multer';
import { supabaseAdmin } from './supabase';

// Configure multer for handling file uploads in memory.
// That way we can push the buffer directly to Supabase without saving to local disk.
const storage = multer.memoryStorage();
export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

/**
 * Helper to upload a file to Supabase Storage
 */
export const uploadToSupabase = async (file: Express.Multer.File): Promise<string> => {
  const fileExt = file.originalname.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  
  const { data, error } = await supabaseAdmin.storage
    .from('products')
    .upload(fileName, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (error) {
    throw new Error(`Failed to upload to Supabase: ${error.message}`);
  }

  const { data: publicUrlData } = supabaseAdmin.storage
    .from('products')
    .getPublicUrl(fileName);

  return publicUrlData.publicUrl;
};
