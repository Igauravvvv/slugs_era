import { ArrowLeft } from 'lucide-react';

interface DropFormProps {
  dropId?: string;
  onBack: () => void;
  onSaved: () => void;
}

export default function DropForm({ dropId, onBack, onSaved }: DropFormProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="cms-topbar-btn">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 className="text-xl font-bold text-[#F5F5F5] font-heading">
            {dropId ? 'Edit Drop' : 'New Drop'}
          </h2>
          <p className="text-sm text-[#888] mt-1">
            {dropId ? 'Update drop details' : 'Create a new seasonal drop'}
          </p>
        </div>
      </div>

      <div className="cms-card p-12 text-center">
        <h3 className="text-lg font-semibold text-[#F5F5F5] mb-2">Drop Form</h3>
        <p className="text-sm text-[#888] max-w-md mx-auto">
          Drop creation form with cover image upload, product assignment, date picker, and rich text will be built in Phase 3.
        </p>
      </div>
    </div>
  );
}
