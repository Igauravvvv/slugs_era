import { createPortal } from 'react-dom';
import { ArrowRight, Loader2 } from 'lucide-react';

type Props = { total: number; label: string; onClick?: () => void; form?: string; disabled?: boolean; busy?: boolean; note?: string };
export default function CheckoutAction({ total, label, onClick, form, disabled, busy, note }: Props) {
  const content = <div className="fixed inset-x-0 bottom-0 z-[110] border-t border-[#E8E4E0] bg-white px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))] shadow-[0_-4px_20px_rgba(0,0,0,0.06)] lg:static lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none">
    <div className="mx-auto flex max-w-6xl items-center gap-3 lg:block">
      <div className="shrink-0 lg:hidden"><p className="text-[10px] text-[#66665E]">{note || 'Total · incl. taxes'}</p><p className="text-lg font-semibold">₹{total.toLocaleString('en-IN')}</p></div>
      <button type={form ? 'submit' : 'button'} form={form} onClick={onClick} disabled={disabled || busy} aria-busy={busy} className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-lg bg-[#C0132A] px-4 py-3 text-sm font-semibold text-white hover:bg-[#A81024] disabled:cursor-not-allowed disabled:opacity-60 lg:w-full">
        {busy ? <><Loader2 size={17} className="animate-spin" /> Confirming…</> : <>{label}<ArrowRight size={16} /></>}
      </button>
    </div>
  </div>;
  return <>
    <div className="hidden lg:block"><button type={form ? 'submit' : 'button'} form={form} onClick={onClick} disabled={disabled || busy} aria-busy={busy} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#C0132A] px-4 text-sm font-semibold text-white disabled:opacity-60">{busy ? <><Loader2 size={17} className="animate-spin" /> Confirming…</> : <>{label}<ArrowRight size={16} /></>}</button></div>
    {createPortal(<div className="lg:hidden">{content}</div>, document.body)}
  </>;
}
