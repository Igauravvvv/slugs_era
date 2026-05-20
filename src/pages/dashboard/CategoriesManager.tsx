import { FolderOpen, Plus } from 'lucide-react';

export default function CategoriesManager() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#F5F5F5] font-heading">Categories</h2>
          <p className="text-sm text-[#888] mt-1">Organize your product categories</p>
        </div>
        <button className="cms-btn cms-btn--primary">
          <Plus size={16} />
          Add Category
        </button>
      </div>

      <div className="cms-card p-12 text-center">
        <FolderOpen size={48} className="mx-auto text-[#333] mb-4" />
        <h3 className="text-lg font-semibold text-[#F5F5F5] mb-2">Categories Manager</h3>
        <p className="text-sm text-[#888] max-w-md mx-auto">
          Full categories manager with image uploads, descriptions, drag-to-reorder, and inline editing will be built in Phase 3.
        </p>
      </div>
    </div>
  );
}
