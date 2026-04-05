import express from 'express';
import { upload, uploadToSupabase } from '../lib/storage';

export const adminRouter = express.Router();

adminRouter.post('/upload', upload.single('productImage'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded',
      });
    }

    // Upload to supabase and get CDN path
    const publicUrl = await uploadToSupabase(req.file);

    res.status(200).json({
      success: true,
      data: {
        url: publicUrl
      }
    });
  } catch (error) {
    next(error);
  }
});
