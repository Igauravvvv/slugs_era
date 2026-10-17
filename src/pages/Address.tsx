import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Check, Pencil } from 'lucide-react';
import { useStore } from '@/store';
import type { Address } from '@/types';
import { calculateShipping } from '@/utils/shipping';
import CheckoutSteps from '@/components/CheckoutSteps';
import CheckoutAction from '@/components/CheckoutAction';

const emptyAddress = { fullName: '', phone: '', addressLine1: '', addressLine2: '', city: '', state: '', pincode: '', isDefault: false };
export default function AddressPage() {
  const navigate = useNavigate();
  const { cart, getCartTotal, addresses, selectedAddress, addAddress, selectAddress } = useStore();
  const [showForm, setShowForm] = useState(addresses.length === 0);
  const [formData, setFormData] = useState(emptyAddress);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formError, setFormError] = useState('');
  const subtotal = getCartTotal();
  const total = subtotal + calculateShipping(subtotal);
  useEffect(() => { if (!cart.length) navigate('/cart'); }, [cart.length, navigate]);
  const proceed = () => { navigate('/checkout/payment'); window.scrollTo(0, 0); };
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const clean = Object.fromEntries(Object.entries(formData).map(([key, value]) => [key, typeof value === 'string' ? value.trim() : value])) as typeof emptyAddress;
    clean.phone = clean.phone.replace(/[\s()-]/g, '').replace(/^(\+91|91)(?=\d{10}$)/, '');
    if (!/^[6-9]\d{9}$/.test(clean.phone)) { setFormError('Enter a valid 10-digit Indian mobile number.'); return; }
    if (!/^[1-9]\d{5}$/.test(clean.pincode)) { setFormError('Enter a valid 6-digit PIN code.'); return; }
    if (clean.fullName.length < 2 || clean.addressLine1.length < 5 || clean.city.length < 2 || clean.state.length < 2) { setFormError('Complete your name, street address, city and state.'); return; }
    const address: Address = { ...clean, id: editingId || crypto.randomUUID() };
    addAddress(address); selectAddress(address); proceed();
  };
  const fields = [
    { name: 'fullName', label: 'Full name', autoComplete: 'name', placeholder: 'Name of the recipient', wide: false },
    { name: 'phone', label: 'Mobile number', autoComplete: 'tel', placeholder: '10-digit mobile number', wide: false },
    { name: 'addressLine1', label: 'House / flat, building & street', autoComplete: 'address-line1', placeholder: 'House number, building and street', wide: true },
    { name: 'addressLine2', label: 'Area / landmark (optional)', autoComplete: 'address-line2', placeholder: 'Help us find your address', wide: true },
    { name: 'pincode', label: 'PIN code', autoComplete: 'postal-code', placeholder: '6-digit PIN', wide: false },
    { name: 'city', label: 'City', autoComplete: 'address-level2', placeholder: 'City', wide: false },
    { name: 'state', label: 'State / union territory', autoComplete: 'address-level1', placeholder: 'State', wide: true },
  ] as const;
  return <div className="min-h-screen bg-white pt-4 pb-28 sm:pt-8">
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      <CheckoutSteps current={1} />
      <button onClick={() => navigate('/cart')} className="mb-4 flex items-center gap-2 text-sm text-[#66665E]"><ArrowLeft size={15} /> Back to bag</button>
      <h1 className="font-display text-3xl mb-2">Where should we deliver?</h1>
      <p className="text-sm text-[#66665E] mb-5">Add your address once. We’ll save it for next time.</p>
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div>
          {!showForm && <>
            <div role="radiogroup" aria-label="Delivery address" className="space-y-3">
              {addresses.map(address => <label key={address.id} className={`flex cursor-pointer gap-3 rounded-xl border p-4 ${selectedAddress?.id === address.id ? 'border-[#C0132A] bg-[#FFF7F8]' : 'border-[#E8E4E0]'}`}>
                <input type="radio" name="deliveryAddress" checked={selectedAddress?.id === address.id} onChange={() => selectAddress(address)} className="mt-1 accent-[#C0132A]" />
                <span className="flex-1 text-sm"><span className="block font-semibold">{address.fullName}</span><span className="block mt-1 text-[#66665E]">{[address.addressLine1, address.addressLine2, address.city, address.state, address.pincode].filter(Boolean).join(', ')}</span><span className="block mt-1">{address.phone}</span></span>
                <button type="button" aria-label={`Edit address for ${address.fullName}`} onClick={event => { event.preventDefault(); setEditingId(address.id); setFormData({ ...address, addressLine2: address.addressLine2 || '', isDefault: Boolean(address.isDefault) }); setShowForm(true); }}><Pencil size={16} /></button>
              </label>)}
            </div>
            <button onClick={() => { setEditingId(null); setFormData(emptyAddress); setShowForm(true); }} className="mt-3 flex min-h-11 items-center gap-2 text-sm text-[#C0132A]"><Plus size={17} /> Add another address</button>
          </>}
          {showForm && <form id="delivery-address" onSubmit={handleSubmit} className="rounded-xl border border-[#E8E4E0] p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between"><h2 className="font-semibold">Delivery details</h2>{addresses.length > 0 && <button type="button" onClick={() => setShowForm(false)} className="text-sm underline">Use saved address</button>}</div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-4">
              {fields.map(field => <div key={field.name} className={field.wide ? 'col-span-2' : field.name === 'city' || field.name === 'pincode' ? 'col-span-1' : 'col-span-2 sm:col-span-1'}>
                <label htmlFor={field.name} className="mb-1.5 block text-sm font-medium">{field.label}</label>
                <input id={field.name} name={field.name} autoComplete={field.autoComplete} type={field.name === 'phone' ? 'tel' : 'text'} inputMode={field.name === 'pincode' ? 'numeric' : undefined} maxLength={field.name === 'pincode' ? 6 : field.name === 'phone' ? 16 : 150} required={field.name !== 'addressLine2'} value={formData[field.name]} onChange={event => { setFormData(previous => ({ ...previous, [field.name]: event.target.value })); setFormError(''); }} placeholder={field.placeholder} className="min-h-12 w-full rounded-lg border border-[#DCD5CF] bg-white px-3 text-base outline-none focus:border-[#C0132A] focus:ring-1 focus:ring-[#C0132A]" />
              </div>)}
            </div>
            <label className="mt-4 flex items-center gap-2 text-sm text-[#66665E]"><input type="checkbox" checked={formData.isDefault} onChange={event => setFormData(prev => ({ ...prev, isDefault: event.target.checked }))} className="accent-[#C0132A]" /> Make this my default address</label>
            {formError && <p role="alert" className="mt-3 text-sm text-red-700">{formError}</p>}
          </form>}
        </div>
        <aside className="h-fit rounded-xl bg-[#F9F7F5] p-4 lg:sticky lg:top-24">
          <details className="mb-4"><summary className="cursor-pointer text-sm font-semibold">Your bag · {cart.reduce((n, item) => n + item.quantity, 0)} items <span className="float-right">₹{total.toLocaleString('en-IN')}</span></summary><div className="mt-3 space-y-2">{cart.map(item => <p key={`${item.product.id}-${item.size}-${item.color}`} className="text-sm text-[#66665E]">{item.product.name} · {item.size} · {item.color} × {item.quantity}</p>)}<p className="mt-2 text-xs text-[#66665E]">Total includes applied offers and shipping.</p></div></details>
          <p className="mb-4 flex items-center gap-2 text-xs text-[#66665E]"><Check size={15} /> Choose COD or pay online on the next step.</p>
          <CheckoutAction total={total} label={showForm ? 'Save & continue' : 'Continue to payment'} form={showForm ? 'delivery-address' : undefined} onClick={showForm ? undefined : proceed} disabled={!showForm && !selectedAddress} />
        </aside>
      </div>
    </div>
  </div>;
}
