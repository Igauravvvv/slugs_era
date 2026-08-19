import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Store, Mail, CreditCard, Truck, Shield, Globe, Bell,
  Save, Check, Eye, EyeOff, Copy, ExternalLink
} from 'lucide-react';

interface SettingSection {
  id: string; title: string; icon: React.ElementType; description: string;
}

const sections: SettingSection[] = [
  { id: 'store', title: 'Store Details', icon: Store, description: 'Name, logo, and contact info' },
  { id: 'payment', title: 'Payment', icon: CreditCard, description: 'Razorpay configuration' },
  { id: 'shipping', title: 'Shipping', icon: Truck, description: 'Shipping rates and zones' },
  { id: 'email', title: 'Email', icon: Mail, description: 'SMTP and notification settings' },
  { id: 'security', title: 'Security', icon: Shield, description: 'API keys and access control' },
  { id: 'seo', title: 'SEO & Social', icon: Globe, description: 'Default meta tags and social cards' },
  { id: 'notifications', title: 'Notifications', icon: Bell, description: 'Alert preferences' },
];

export default function Settings() {
  const [activeSection, setActiveSection] = useState('store');
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const toggleKeyVisibility = (key: string) => {
    setShowKeys(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Settings</h2>
          <p className="text-gray-500 text-sm mt-1">Manage your store configuration</p>
        </div>
        <button onClick={handleSave}
          className="px-5 py-2.5 rounded-xl text-sm font-medium text-white flex items-center gap-2 hover:shadow-lg hover:shadow-[#C0132A]/20 transition-all"
          style={{ background: saved ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #C0132A, #ff4757)' }}>
          {saved ? <><Check size={16} /> Saved!</> : <><Save size={16} /> Save Changes</>}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Section Nav */}
        <div className="space-y-1">
          {sections.map((section) => (
            <button key={section.id} onClick={() => setActiveSection(section.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                activeSection === section.id
                  ? 'text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
              style={activeSection === section.id ? {
                background: 'linear-gradient(135deg, rgba(192,19,42,0.15), rgba(255,71,87,0.08))',
              } : {}}>
              <section.icon size={16} className={activeSection === section.id ? 'text-[#ff4757]' : ''} />
              <div>
                <p className="text-sm font-medium">{section.title}</p>
                <p className="text-[10px] text-gray-500">{section.description}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Section Content */}
        <div className="lg:col-span-3">
          <motion.div key={activeSection}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-2xl p-6" style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
              border: '1px solid rgba(255,255,255,0.06)',
            }}>
            {activeSection === 'store' && (
              <div className="space-y-5">
                <h3 className="text-white font-semibold text-lg">Store Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField label="Store Name" defaultValue="Slug's Era" />
                  <InputField label="Store Email" defaultValue="hello@slugsera.com" type="email" />
                  <InputField label="Phone Number" defaultValue="+91 98765 43210" />
                  <InputField label="Website" defaultValue="https://www.slugsera.com" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Store Description</label>
                  <textarea rows={3} defaultValue="Premium streetwear brand. Embrace the slow life."
                    className="mt-1.5 w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#C0132A]/50 transition-all resize-none" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <InputField label="Currency" defaultValue="INR (₹)" />
                  <InputField label="Timezone" defaultValue="Asia/Kolkata (IST)" />
                  <InputField label="Country" defaultValue="India" />
                </div>
              </div>
            )}

            {activeSection === 'payment' && (
              <div className="space-y-5">
                <h3 className="text-white font-semibold text-lg">Razorpay Configuration</h3>
                <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                  <div className="flex items-center gap-2">
                    <Check size={16} className="text-emerald-400" />
                    <span className="text-emerald-400 text-sm font-medium">Razorpay Connected</span>
                  </div>
                </div>
                <KeyField label="Razorpay Key ID" value="rzp_live_xxxxxxxxxxxxx" show={showKeys.razorpayKey} onToggle={() => toggleKeyVisibility('razorpayKey')} />
                <KeyField label="Razorpay Key Secret" value="xxxxxxxxxxxxxxxxxxxxxxxx" show={showKeys.razorpaySecret} onToggle={() => toggleKeyVisibility('razorpaySecret')} />
                <InputField label="Webhook URL" defaultValue="https://api.slugsera.com/api/payment/webhook" disabled />
              </div>
            )}

            {activeSection === 'shipping' && (
              <div className="space-y-5">
                <h3 className="text-white font-semibold text-lg">Shipping Configuration</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField label="Free Shipping Threshold (₹)" defaultValue="999" type="number" />
                  <InputField label="Default Shipping Cost (₹)" defaultValue="79" type="number" />
                  <InputField label="Express Shipping Cost (₹)" defaultValue="149" type="number" />
                  <InputField label="Processing Time" defaultValue="1-2 business days" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Shipping Partners</label>
                  <div className="flex gap-2 mt-2">
                    {['Delhivery', 'BlueDart', 'DTDC'].map((partner) => (
                      <span key={partner} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-300 text-xs">{partner}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'email' && (
              <div className="space-y-5">
                <h3 className="text-white font-semibold text-lg">Email Configuration</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField label="SMTP Host" defaultValue="smtp.gmail.com" />
                  <InputField label="SMTP Port" defaultValue="587" />
                  <InputField label="SMTP User" defaultValue="notifications@slugsera.com" />
                  <KeyField label="SMTP Password" value="••••••••••••" show={showKeys.smtp} onToggle={() => toggleKeyVisibility('smtp')} />
                </div>
                <h4 className="text-white font-medium text-sm mt-4">Notification Events</h4>
                <div className="space-y-2">
                  {['Order Confirmation', 'Shipping Update', 'Delivery Confirmation', 'Abandoned Cart Recovery', 'Welcome Email'].map((event) => (
                    <div key={event} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02]">
                      <span className="text-gray-300 text-sm">{event}</span>
                      <div className="w-10 h-5 rounded-full bg-emerald-500/20 flex items-center justify-end px-0.5 cursor-pointer">
                        <div className="w-4 h-4 rounded-full bg-emerald-500" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSection === 'security' && (
              <div className="space-y-5">
                <h3 className="text-white font-semibold text-lg">Security & API Keys</h3>
                <KeyField label="Supabase URL" value="https://xxxxxxxxxxxx.supabase.co" show={showKeys.supabaseUrl} onToggle={() => toggleKeyVisibility('supabaseUrl')} />
                <KeyField label="Supabase Anon Key" value="eyJhbGciOiJIUzI1NiIsInR5cCI6..." show={showKeys.supabaseAnon} onToggle={() => toggleKeyVisibility('supabaseAnon')} />
                <KeyField label="Supabase Service Role Key" value="eyJhbGciOiJIUzI1NiIsInR5cCI6..." show={showKeys.supabaseService} onToggle={() => toggleKeyVisibility('supabaseService')} />
                <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                  <p className="text-amber-400 text-xs font-medium flex items-center gap-2">
                    <Shield size={14} /> Never expose service role keys in frontend code
                  </p>
                </div>
              </div>
            )}

            {activeSection === 'seo' && (
              <div className="space-y-5">
                <h3 className="text-white font-semibold text-lg">Default SEO Settings</h3>
                <InputField label="Default Meta Title" defaultValue="Slug's Era — Premium Streetwear | The Slow Club" />
                <div>
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Default Meta Description</label>
                  <textarea rows={3} defaultValue="Slug's Era is a premium streetwear brand embracing the slow life. Shop oversized tees, shirts, and hoodies designed for those who appreciate quality over speed."
                    className="mt-1.5 w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#C0132A]/50 transition-all resize-none" />
                </div>
                <InputField label="Google Analytics 4 Measurement ID" defaultValue="G-XXXXXXXXXX" />
                <InputField label="Facebook Pixel ID" defaultValue="" placeholder="Optional" />
                <InputField label="OG Image URL" defaultValue="https://www.slugsera.com/og-image.jpg" />
              </div>
            )}

            {activeSection === 'notifications' && (
              <div className="space-y-5">
                <h3 className="text-white font-semibold text-lg">Notification Preferences</h3>
                <p className="text-gray-500 text-sm">Choose which events trigger admin notifications</p>
                <div className="space-y-2">
                  {[
                    { event: 'New Order', enabled: true },
                    { event: 'Low Stock Alert', enabled: true },
                    { event: 'Return Request', enabled: true },
                    { event: 'New Customer Signup', enabled: false },
                    { event: 'Payment Failed', enabled: true },
                    { event: 'Daily Sales Report', enabled: true },
                    { event: 'Weekly Analytics Email', enabled: false },
                  ].map(({ event, enabled }) => (
                    <div key={event} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02]">
                      <span className="text-gray-300 text-sm">{event}</span>
                      <div className={`w-10 h-5 rounded-full flex items-center px-0.5 cursor-pointer transition-colors ${
                        enabled ? 'bg-emerald-500/20 justify-end' : 'bg-white/10 justify-start'
                      }`}>
                        <div className={`w-4 h-4 rounded-full transition-colors ${enabled ? 'bg-emerald-500' : 'bg-gray-600'}`} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function InputField({ label, defaultValue = '', placeholder = '', type = 'text', disabled = false }: {
  label: string; defaultValue?: string; placeholder?: string; type?: string; disabled?: boolean;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">{label}</label>
      <input type={type} defaultValue={defaultValue} placeholder={placeholder} disabled={disabled}
        className={`mt-1.5 w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-[#C0132A]/50 transition-all ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`} />
    </div>
  );
}

function KeyField({ label, value, show, onToggle }: {
  label: string; value: string; show?: boolean; onToggle: () => void;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">{label}</label>
      <div className="mt-1.5 flex items-center gap-2">
        <input type={show ? 'text' : 'password'} defaultValue={value} readOnly
          className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-mono focus:outline-none" />
        <button onClick={onToggle} className="p-3 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-colors">
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
        <button className="p-3 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-colors">
          <Copy size={16} />
        </button>
      </div>
    </div>
  );
}
