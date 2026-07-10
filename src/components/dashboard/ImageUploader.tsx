import { useState, useRef, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, CheckCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDashboardToast } from '@/store/dashboardToast';
import { uploadMultipleImages } from '@/lib/uploadImage';
import type { ProductImage } from '@/types/dashboard';

interface ImageUploaderProps {
  images: ProductImage[];
  onChange: (images: ProductImage[]) => void;
  bucket: 'product-images' | 'section-images' | 'drop-covers';
  maxFiles?: number;
}

export default function ImageUploader({ images, onChange, bucket, maxFiles = 8 }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useDashboardToast();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
    if (files.length > 0) {
      await processFiles(files);
    }
  }, [images, maxFiles]);

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).filter(file => file.type.startsWith('image/'));
      await processFiles(files);
    }
  };

  const processFiles = async (files: File[]) => {
    if (images.length + files.length > maxFiles) {
      addToast({ 
        type: 'error', 
        title: 'Too many files', 
        message: `You can only upload a maximum of ${maxFiles} images.` 
      });
      return;
    }

    setUploading(true);
    try {
      const urls = await uploadMultipleImages(files, bucket);
      
      const newImages = urls.map((url, index) => ({
        url,
        alt: files[index].name.split('.')[0], // Use filename as alt text by default
        isPrimary: images.length === 0 && index === 0, // First image is primary if list is empty
      }));

      onChange([...images, ...newImages]);
      addToast({ type: 'success', title: 'Upload complete', message: `Successfully uploaded ${urls.length} images.` });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Upload failed', message: err.message });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = (indexToRemove: number) => {
    const newImages = [...images];
    newImages.splice(indexToRemove, 1);
    
    // If we removed the primary image and there are others left, make the first one primary
    if (images[indexToRemove].isPrimary && newImages.length > 0) {
      newImages[0].isPrimary = true;
    }
    
    onChange(newImages);
  };

  const setPrimary = (indexToPrimary: number) => {
    const newImages = images.map((img, idx) => ({
      ...img,
      isPrimary: idx === indexToPrimary
    }));
    onChange(newImages);
  };

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`cms-upload-zone ${isDragging ? 'cms-upload-zone--dragover' : ''} ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={handleFileInput}
          disabled={uploading || images.length >= maxFiles}
        />
        <div className="flex flex-col items-center justify-center gap-3 pointer-events-none">
          {uploading ? (
            <Loader2 size={32} className="text-[#C0132A] animate-spin" />
          ) : (
            <Upload size={32} className="text-[#888]" />
          )}
          <div>
            <p className="text-sm font-medium text-[#F5F5F5]">
              {uploading ? 'Uploading to CDN...' : 'Click or drag images here'}
            </p>
            <p className="text-xs text-[#666] mt-1">
              Supports JPG, PNG, WEBP (Max {maxFiles} files)
            </p>
          </div>
        </div>
      </div>

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          <AnimatePresence>
            {images.map((image, idx) => (
              <motion.div
                key={image.url}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`relative group rounded-xl overflow-hidden aspect-square border-2 ${
                  image.isPrimary ? 'border-[#C0132A]' : 'border-[#2A2A2A] hover:border-[#3A3A3A]'
                } transition-colors`}
              >
                <img src={image.url} alt={image.alt} className="w-full h-full object-cover" />
                
                {/* Overlay actions */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                  <div className="flex justify-between items-start">
                    {!image.isPrimary && (
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setPrimary(idx); }}
                        className="text-[10px] font-semibold bg-black/80 text-white px-2 py-1 rounded border border-[#3A3A3A] hover:border-[#C0132A]"
                      >
                        Make Primary
                      </button>
                    )}
                    {image.isPrimary && (
                      <span className="text-[10px] font-bold bg-[#C0132A] text-white px-2 py-1 rounded flex items-center gap-1">
                        <CheckCircle size={10} /> Primary
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                      className="ml-auto w-6 h-6 rounded-full bg-black/80 flex items-center justify-center text-white border border-[#3A3A3A] hover:border-[#F44336] hover:text-[#F44336]"
                    >
                      <X size={12} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
