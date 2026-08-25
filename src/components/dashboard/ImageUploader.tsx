import { useCallback, useRef, useState } from 'react';
import { CheckCircle, ChevronLeft, ChevronRight, GripVertical, Loader2, Play, Upload, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useDashboardToast } from '@/store/dashboardToast';
import { uploadMultipleMedia } from '@/lib/uploadImage';
import { isVideoMedia } from '@/lib/cdn';
import type { ProductImage } from '@/types/dashboard';

interface ImageUploaderProps {
  images: ProductImage[];
  onChange: (images: ProductImage[]) => void;
  bucket: 'product-images' | 'section-images' | 'drop-covers';
  maxFiles?: number;
}

export default function ImageUploader({ images, onChange, bucket, maxFiles = 8 }: ImageUploaderProps) {
  const [isDraggingFiles, setIsDraggingFiles] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useDashboardToast();
  const allowsVideo = bucket === 'product-images';

  const normalizeOrder = (ordered: ProductImage[]) => ordered.map((item, index) => ({
    ...item,
    isPrimary: index === 0,
    mediaType: item.mediaType || (isVideoMedia(item.url) ? 'video' as const : 'image' as const),
  }));

  const validFiles = (files: File[]) => files.filter((file) => {
    const supported = file.type.startsWith('image/') || (allowsVideo && file.type.startsWith('video/'));
    const maxBytes = file.type.startsWith('video/') ? 50 * 1024 * 1024 : 12 * 1024 * 1024;
    return supported && file.size <= maxBytes;
  });

  const processFiles = async (incomingFiles: File[]) => {
    const files = validFiles(incomingFiles);
    if (files.length === 0) {
      addToast({
        type: 'error',
        title: 'Unsupported file',
        message: allowsVideo ? 'Use JPG, PNG, WEBP, MP4, WEBM, or MOV. Videos can be up to 50 MB.' : 'Use JPG, PNG, or WEBP.',
      });
      return;
    }
    if (images.length + files.length > maxFiles) {
      addToast({ type: 'error', title: 'Too many files', message: `You can upload a maximum of ${maxFiles} media files.` });
      return;
    }

    setUploading(true);
    try {
      const urls = await uploadMultipleMedia(files, bucket);
      const uploaded = urls.map((url, index) => ({
        url,
        alt: files[index].name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' '),
        isPrimary: images.length === 0 && index === 0,
        mediaType: files[index].type.startsWith('video/') ? 'video' as const : 'image' as const,
      }));
      onChange(normalizeOrder([...images, ...uploaded]));
      addToast({ type: 'success', title: 'Upload complete', message: `${urls.length} media file${urls.length === 1 ? '' : 's'} uploaded to the CDN.` });
    } catch (error: unknown) {
      addToast({ type: 'error', title: 'Upload failed', message: error instanceof Error ? error.message : 'The media could not be uploaded.' });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFileDrag = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDraggingFiles(event.type === 'dragenter' || event.type === 'dragover');
  }, []);

  const moveMedia = (from: number, to: number) => {
    if (to < 0 || to >= images.length || from === to) return;
    const next = [...images];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(normalizeOrder(next));
  };

  const removeMedia = (index: number) => {
    const next = [...images];
    next.splice(index, 1);
    onChange(normalizeOrder(next));
  };

  return (
    <div className="space-y-4">
      <div
        onDragEnter={handleFileDrag}
        onDragLeave={handleFileDrag}
        onDragOver={handleFileDrag}
        onDrop={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setIsDraggingFiles(false);
          void processFiles(Array.from(event.dataTransfer.files));
        }}
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={`cms-upload-zone ${isDraggingFiles ? 'cms-upload-zone--dragover' : ''} ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={allowsVideo ? 'image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime' : 'image/jpeg,image/png,image/webp'}
          className="hidden"
          onChange={(event) => event.target.files && void processFiles(Array.from(event.target.files))}
          disabled={uploading || images.length >= maxFiles}
        />
        <div className="flex flex-col items-center justify-center gap-3 pointer-events-none">
          {uploading ? <Loader2 size={32} className="text-[#C0132A] animate-spin" /> : <Upload size={32} className="text-[#888]" />}
          <div>
            <p className="text-sm font-medium text-[#F5F5F5]">
              {uploading ? 'Uploading to CDN...' : `Click or drag ${allowsVideo ? 'images or videos' : 'images'} here`}
            </p>
            <p className="text-xs text-[#666] mt-1">
              {allowsVideo ? 'JPG, PNG, WEBP, MP4, WEBM or MOV · videos up to 50 MB' : 'JPG, PNG or WEBP'} · Max {maxFiles} files
            </p>
          </div>
        </div>
      </div>

      {images.length > 0 && (
        <>
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs text-[#888]">Drag tiles or use the arrow buttons to set the storefront order. Item 1 is the cover.</p>
            <span className="text-xs text-[#666] whitespace-nowrap">{images.length}/{maxFiles}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            <AnimatePresence>
              {images.map((media, index) => {
                const isVideo = media.mediaType === 'video' || isVideoMedia(media.url);
                return (
                  <motion.div
                    key={media.url}
                    draggable
                    onDragStart={(event) => {
                      setDraggedIndex(index);
                      event.dataTransfer.effectAllowed = 'move';
                      event.dataTransfer.setData('text/plain', String(index));
                    }}
                    onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = 'move'; }}
                    onDrop={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      const from = draggedIndex ?? Number(event.dataTransfer.getData('text/plain'));
                      if (Number.isInteger(from)) moveMedia(from, index);
                      setDraggedIndex(null);
                    }}
                    onDragEnd={() => setDraggedIndex(null)}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: draggedIndex === index ? 0.5 : 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className={`relative group rounded-xl overflow-hidden aspect-square border-2 ${index === 0 ? 'border-[#C0132A]' : 'border-[#2A2A2A] hover:border-[#3A3A3A]'} transition-colors cursor-grab active:cursor-grabbing`}
                  >
                    {isVideo ? (
                      <video src={media.url} aria-label={media.alt || `Product video ${index + 1}`} muted playsInline preload="metadata" className="w-full h-full object-cover" />
                    ) : (
                      <img src={media.url} alt={media.alt} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                    )}

                    <span className="absolute top-2 left-2 flex items-center gap-1 rounded bg-black/80 px-2 py-1 text-[10px] font-semibold text-white">
                      <GripVertical size={11} aria-hidden="true" /> {index + 1}
                    </span>
                    {isVideo && <span className="absolute bottom-2 left-2 flex items-center gap-1 rounded bg-black/80 px-2 py-1 text-[10px] font-semibold text-white"><Play size={10} fill="currentColor" /> Video</span>}

                    <div className="absolute inset-0 bg-black/45 opacity-100 md:bg-black/60 md:opacity-0 md:group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity flex flex-col justify-between p-2">
                      <div className="flex justify-between items-start gap-1">
                        {index === 0 ? (
                          <span className="text-[10px] font-bold bg-[#C0132A] text-white px-2 py-1 rounded flex items-center gap-1"><CheckCircle size={10} /> Cover / First</span>
                        ) : (
                          <button type="button" onClick={(event) => { event.stopPropagation(); moveMedia(index, 0); }} className="text-[10px] font-semibold bg-black/80 text-white px-2 py-1 rounded border border-[#3A3A3A] hover:border-[#C0132A]">Make First</button>
                        )}
                        <button type="button" aria-label={`Remove ${media.alt || 'media'}`} onClick={(event) => { event.stopPropagation(); removeMedia(index); }} className="ml-auto w-7 h-7 rounded-full bg-black/80 flex items-center justify-center text-white border border-[#3A3A3A] hover:border-[#F44336] hover:text-[#F44336]"><X size={12} /></button>
                      </div>
                      <div className="ml-auto flex gap-1">
                        <button type="button" disabled={index === 0} aria-label={`Move ${media.alt || 'media'} earlier`} onClick={(event) => { event.stopPropagation(); moveMedia(index, index - 1); }} className="w-8 h-8 rounded-full bg-black/80 flex items-center justify-center text-white border border-[#3A3A3A] hover:border-[#C0132A] disabled:opacity-30"><ChevronLeft size={15} /></button>
                        <button type="button" disabled={index === images.length - 1} aria-label={`Move ${media.alt || 'media'} later`} onClick={(event) => { event.stopPropagation(); moveMedia(index, index + 1); }} className="w-8 h-8 rounded-full bg-black/80 flex items-center justify-center text-white border border-[#3A3A3A] hover:border-[#C0132A] disabled:opacity-30"><ChevronRight size={15} /></button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </>
      )}
    </div>
  );
}
