import { Check, Lock } from 'lucide-react';

export default function CheckoutSteps({ current }: { current: 1 | 2 }) {
  return (
    <div className="mb-4 border-b border-[#E8E4E0] pb-3">
      <div className="flex items-center justify-between gap-4 mb-3">
        <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[#C0132A]">The final details</span>
        <span className="flex items-center gap-1.5 text-xs text-[#66665E]"><Lock size={13} /> Secure checkout</span>
      </div>
      <ol aria-label="Checkout progress" className="flex items-center gap-3 sm:gap-6">
        {['Bag', 'Delivery', 'Payment'].map((label, index) => (
          <li key={label} aria-current={index === current ? 'step' : undefined} className="flex flex-1 items-center gap-2 text-xs sm:text-sm">
            <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${index <= current ? 'bg-[#C0132A] text-white' : 'bg-[#E8E4E0] text-[#66665E]'}`}>
              {index < current ? <Check size={14} /> : index + 1}
            </span>
            <span className={index === current ? 'font-semibold text-[#1A1A1A]' : 'text-[#66665E]'}>{label}</span>
            {index < 2 && <span aria-hidden="true" className="ml-1 h-px flex-1 bg-[#E8E4E0]" />}
          </li>
        ))}
      </ol>
    </div>
  );
}
