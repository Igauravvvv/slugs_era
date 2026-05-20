import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageIcon, Copy, Trash2, Filter, Loader2, HardDrive, RefreshCw } from 'lucide-react';
import { listBucketFiles, deleteImage } from '@/lib/uploadImage';
import { useDashboardToast } from '@/store/dashboardToast';
import { MediaGridSkeleton } from '@/components/dashboard/SkeletonLoader';
import ImageUploader from '@/components/dashboard/ImageUploader';
import type { MediaFile } from '@/types/dashboard';

type BucketType = 'product-images' | 'section-images' | 'drop-covers';

export default function MediaLibrary() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [bucket, setBucket] = useState<BucketType>('product-images');
  const [uploadOpen, setUploadOpen] = useState(false);
  const { addToast } = useDashboardToast();

  const loadFiles = async () => {
    try {
      setRefreshing(true);
      const data = await listBucketFiles(bucket);
      setFiles(data);
    } catch (err: any) {
      addToast({ type: 'error', title: 'Failed to load media', message: err.message });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, [bucket]);

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    addToast({ type: 'success', title: 'URL Copied', message: 'Image CDN URL copied to clipboard.' });
  };

  const handleDelete = async (file: MediaFile) => {
    if (!confirm(`Are you sure you want to delete this image? If it's used on the site, it will break.`)) return;
    
    try {
      await deleteImage(file.publicUrl, bucket);
      setFiles(files.filter(f => f.id !== file.id));
      addToast({ type: 'success', title: 'Image deleted' });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Delete failed', message: err.message });
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#F5F5F5] font-heading">Media Library</h2>
          <p className="text-sm text-[#888] mt-1">{files.length} items in CDN storage</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={loadFiles} 
            className="cms-btn cms-btn--secondary"
            disabled={refreshing}
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button 
            onClick={() => setUploadOpen(!uploadOpen)} 
            className="cms-btn cms-btn--primary"
          >
            {uploadOpen ? 'Close Uploader' : 'Upload Files'}
          </button>
        </div>
      </div>

      <div className="cms-card p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-3">
          <HardDrive size={16} className="text-[#888]" />
          <select 
            value={bucket} 
            onChange={(e) => setBucket(e.target.value as BucketType)}
            className="cms-select w-full sm:w-48 h-9"
          >
            <option value="product-images">Product Images</option>
            <option value="section-images">Section Images (Hero/UI)</option>
            <option value="drop-covers">Drop Covers</option>
          </select>
        </div>
      </div>

      <AnimatePresence>
        {uploadOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="cms-card p-6 mb-6">
              <h3 className="text-sm font-semibold text-[#F5F5F5] mb-4">Upload to {bucket}</h3>
              <ImageUploader 
                images={[]} 
                onChange={() => {
                  loadFiles();
                  setUploadOpen(false);
                }} 
                bucket={bucket}
                maxFiles={20}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <MediaGridSkeleton count={12} />
      ) : files.length === 0 ? (
        <div className="cms-card p-12 text-center">
          <ImageIcon size={48} className="mx-auto text-[#333] mb-4" />
          <h3 className="text-lg font-semibold text-[#F5F5F5] mb-2">No media found</h3>
          <p className="text-sm text-[#888] max-w-md mx-auto mb-6">
            There are no files in the "{bucket}" bucket yet.
          </p>
          <button onClick={() => setUploadOpen(true)} className="cms-btn cms-btn--primary">
            Upload Files
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <AnimatePresence>
            {files.map((file, idx) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: idx * 0.02 }}
                className="cms-card overflow-hidden group flex flex-col"
              >
                <div className="aspect-square relative bg-[#111111] border-b border-[#2A2A2A]">
                  <img 
                    src={file.publicUrl} 
                    alt={file.name} 
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" 
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button 
                      onClick={() => handleCopyUrl(file.publicUrl)}
                      className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center hover:bg-[#C8A96E] transition-colors"
                      title="Copy CDN URL"
                    >
                      <Copy size={14} />
                    </button>
                    <button 
                      onClick={() => handleDelete(file)}
                      className="w-8 h-8 rounded-full bg-[#F44336] text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                      title="Delete Image"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-xs font-medium text-[#F5F5F5] truncate" title={file.name}>
                    {file.name}
                  </p>
                  <div className="flex items-center justify-between mt-1 text-[10px] text-[#888]">
                    <span>{formatSize(file.metadata?.size || 0)}</span>
                    <span>{new Date(file.created_at).toLocaleDateString()}</span>
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
