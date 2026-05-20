import { Layers, Plus } from 'lucide-react';

interface DropsManagerProps {
  onAddNew: () => void;
  onEdit: (id: string) => void;
}

export default function DropsManager({ onAddNew, onEdit }: DropsManagerProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#F5F5F5] font-heading">Seasonal Drops</h2>
          <p className="text-sm text-[#888] mt-1">Manage your seasonal collections</p>
        </div>
        <button onClick={onAddNew} className="cms-btn cms-btn--primary">
          <Plus size={16} />
          New Drop
        </button>
      </div>

      <div className="cms-card p-12 text-center">
        <Layers size={48} className="mx-auto text-[#333] mb-4" />
        <h3 className="text-lg font-semibold text-[#F5F5F5] mb-2">Drops Manager</h3>
        <p className="text-sm text-[#888] max-w-md mx-auto mb-6">
          Full drops manager with cover images, product assignments, date pickers, and status toggles will be built in Phase 3.
        </p>
        <button onClick={onAddNew} className="cms-btn cms-btn--primary">
          <Plus size={16} />
          Create First Drop
        </button>
      </div>
    </div>
  );
}
