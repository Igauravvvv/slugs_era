import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Palette, Save, RotateCcw, ChevronDown, ChevronRight,
  Eye, Sparkles, Megaphone, Mail, Heart, Shirt, ShoppingBag,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { SiteSection } from '@/context/SiteContentContext';
import ImageUploader from '@/components/dashboard/ImageUploader';
import type { ProductImage } from '@/types/dashboard';

type SectionConfig = {
  key: string;
  label: string;
  icon: React.ElementType;
  description: string;
  fields: FieldConfig[];
  metaFields?: MetaFieldConfig[];
};

type FieldConfig = {
  key: keyof SiteSection;
  label: string;
  type: 'text' | 'textarea' | 'url' | 'image';
  placeholder: string;
};

type MetaFieldConfig = {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'list' | 'json-list' | 'image';
  placeholder: string;
  itemLabel?: string;
};

const SECTION_CONFIGS: SectionConfig[] = [
  {
    key: 'hero',
    label: 'Hero Section',
    icon: Sparkles,
    description: 'The main landing section — separate desktop and mobile covers, text, and CTAs',
    fields: [
      { key: 'title', label: 'Heading', type: 'text', placeholder: 'Wear the Philosophy of Slow Culture' },
      { key: 'subtitle', label: 'Subtitle', type: 'textarea', placeholder: 'Premium pieces for those who value intention over impulse.' },
      { key: 'image_url', label: 'Desktop Hero Cover (wide)', type: 'image', placeholder: 'Recommended: 2000 × 1125 or wider' },
      { key: 'cta_text', label: 'Primary CTA Text', type: 'text', placeholder: 'Shop Now' },
      { key: 'cta_link', label: 'Primary CTA Link', type: 'text', placeholder: '#products' },
    ],
    metaFields: [
      { key: 'mobile_image_url', label: 'Mobile Hero Cover (portrait)', type: 'image', placeholder: 'Recommended: 1290 × 2796 for iPhone screens' },
      { key: 'eyebrow_sequences', label: 'Eyebrow Animation Sequences', type: 'json-list', placeholder: 'One phrase per line', itemLabel: 'Sequence' },
      { key: 'tags', label: 'Tags', type: 'list', placeholder: 'One tag per line', itemLabel: 'Tag' },
      { key: 'cta_secondary_text', label: 'Secondary CTA Text', type: 'text', placeholder: 'Our Story' },
      { key: 'cta_secondary_link', label: 'Secondary CTA Link', type: 'text', placeholder: '#about' },
    ],
  },
  {
    key: 'marquee',
    label: 'Marquee Banner',
    icon: Megaphone,
    description: 'Scrolling text banner below the hero',
    fields: [],
    metaFields: [
      { key: 'items', label: 'Marquee Items', type: 'list', placeholder: 'One item per line', itemLabel: 'Item' },
    ],
  },
  {
    key: 'cta',
    label: 'CTA Section',
    icon: ShoppingBag,
    description: 'Call-to-action section with shop buttons',
    fields: [
      { key: 'title', label: 'Heading', type: 'text', placeholder: 'Shop Premium Pieces' },
      { key: 'subtitle', label: 'Eyebrow Text', type: 'text', placeholder: 'Upgrade Your Wardrobe' },
      { key: 'body_text', label: 'Description', type: 'textarea', placeholder: 'Life is too short for uncomfortable clothes...' },
      { key: 'cta_text', label: 'Primary CTA Text', type: 'text', placeholder: 'Shop T-Shirts — ₹1,899' },
      { key: 'cta_link', label: 'Primary CTA Link', type: 'text', placeholder: '/collections' },
    ],
    metaFields: [
      { key: 'cta_secondary_text', label: 'Secondary CTA Text', type: 'text', placeholder: 'Shop Shirts — ₹2,299' },
      { key: 'cta_secondary_link', label: 'Secondary CTA Link', type: 'text', placeholder: '/collections?shirts' },
      { key: 'marquee_text', label: 'Background Marquee Text', type: 'text', placeholder: "Don't Rush." },
    ],
  },
  {
    key: 'about',
    label: 'About Section',
    icon: Heart,
    description: 'Our story section with quote and description',
    fields: [
      { key: 'title', label: 'Heading', type: 'text', placeholder: 'Born from a quiet rebellion' },
      { key: 'subtitle', label: 'Eyebrow Text', type: 'text', placeholder: 'OUR STORY' },
      { key: 'body_text', label: 'Description', type: 'textarea', placeholder: 'It started with the two of us...' },
      { key: 'image_url', label: 'Main Image URL', type: 'url', placeholder: 'https://...' },
    ],
    metaFields: [
      { key: 'year', label: 'Year', type: 'text', placeholder: '2026' },
      { key: 'quote', label: 'Quote', type: 'textarea', placeholder: '"We got tired of choosing..."' },
      { key: 'signature_sequences', label: 'Signature Animation', type: 'json-list', placeholder: 'One per line', itemLabel: 'Signature' },
      { key: 'instagram_handle', label: 'Instagram Handle', type: 'text', placeholder: '@slugsera' },
    ],
  },
  {
    key: 'shirts',
    label: 'Shirts Section',
    icon: Shirt,
    description: 'Coastal Drift shirts showcase section',
    fields: [
      { key: 'title', label: 'Heading', type: 'text', placeholder: 'Coastal Drift' },
      { key: 'subtitle', label: 'Eyebrow Text', type: 'text', placeholder: 'New Drop — Shirts' },
      { key: 'body_text', label: 'Description', type: 'textarea', placeholder: 'Drift Like Waves. Stand Like Palms...' },
    ],
    metaFields: [
      { key: 'price_label', label: 'Price Label', type: 'text', placeholder: '₹2,299 per shirt' },
      { key: 'marquee_text', label: 'Background Marquee Text', type: 'text', placeholder: 'COAST' },
    ],
  },
  {
    key: 'newsletter',
    label: 'Newsletter Section',
    icon: Mail,
    description: 'Email subscription section',
    fields: [
      { key: 'title', label: 'Heading', type: 'text', placeholder: 'THE Slow Club , Be a part of the community' },
      { key: 'subtitle', label: 'Eyebrow Text', type: 'text', placeholder: 'Stay in the Loop' },
      { key: 'body_text', label: 'Description', type: 'textarea', placeholder: 'New drops, behind-the-scenes...' },
      { key: 'cta_text', label: 'Button Text', type: 'text', placeholder: 'Subscribe' },
    ],
    metaFields: [
      { key: 'eyebrow_after', label: 'Eyebrow After Text', type: 'text', placeholder: 'Early access to' },
    ],
  },
  {
    key: 'values',
    label: 'Values Section',
    icon: Eye,
    description: 'What We Stand For section header',
    fields: [
      { key: 'title', label: 'Heading', type: 'text', placeholder: 'Our Journey' },
    ],
    metaFields: [
      { key: 'eyebrow', label: 'Eyebrow Text', type: 'text', placeholder: 'What We Stand For' },
    ],
  },
  {
    key: 'products',
    label: 'Products Section',
    icon: ShoppingBag,
    description: 'T-Shirt collection showcase header',
    fields: [
      { key: 'title', label: 'Heading', type: 'text', placeholder: 'The Essential Five' },
      { key: 'cta_text', label: 'CTA Button Text', type: 'text', placeholder: 'View All' },
      { key: 'cta_link', label: 'CTA Link', type: 'text', placeholder: '/collections' },
    ],
    metaFields: [
      { key: 'eyebrow', label: 'Eyebrow Text', type: 'text', placeholder: 'T-Shirt Collection' },
    ],
  },
];

function listToLines(arr: unknown[]): string {
  if (!Array.isArray(arr)) return '';
  return arr.map(String).join('\n');
}

function linesToList(text: string): string[] {
  return text.split('\n').map(l => l.trim()).filter(Boolean);
}

function SectionEditor({
  config,
  section,
  onSave,
}: {
  config: SectionConfig;
  section: SiteSection | null;
  onSave: (key: string, updates: Partial<SiteSection>) => Promise<void>;
}) {
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (!section) {
      const defaults: Record<string, unknown> = {};
      config.fields.forEach(f => { defaults[f.key] = ''; });
      config.metaFields?.forEach(f => {
        if (f.type === 'list' || f.type === 'json-list') defaults[f.key] = '';
        else defaults[f.key] = '';
      });
      setForm(defaults);
      setDirty(false);
      return;
    }
    const vals: Record<string, unknown> = {};
    config.fields.forEach(f => { vals[f.key] = (section as Record<string, unknown>)[f.key] || ''; });
    config.metaFields?.forEach(f => {
      const metaVal = (section.meta as Record<string, unknown>)?.[f.key];
      if (f.type === 'list' || f.type === 'json-list') {
        vals[f.key] = listToLines(metaVal as unknown[]);
      } else {
        vals[f.key] = metaVal ?? '';
      }
    });
    setForm(vals);
    setDirty(false);
  }, [section, config]);

  const handleChange = (key: string, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  const renderImageField = (key: string, label: string, placeholder: string) => {
    const url = typeof form[key] === 'string' ? form[key] as string : '';
    const images: ProductImage[] = url ? [{ url, alt: label, isPrimary: true, mediaType: 'image' }] : [];
    return (
      <div>
        <ImageUploader
          images={images}
          onChange={(next) => handleChange(key, next[0]?.url || '')}
          bucket="section-images"
          maxFiles={1}
        />
        <p className="text-[10px] text-[#666] mt-2">{placeholder}. Uploading a replacement updates only this device layout.</p>
      </div>
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates: Partial<SiteSection> = {};
      const meta: Record<string, unknown> = section?.meta ? { ...section.meta } : {};

      config.fields.forEach(f => {
        const val = form[f.key];
        if (typeof val === 'string') {
          (updates as Record<string, unknown>)[f.key] = val || null;
        }
      });

      config.metaFields?.forEach(f => {
        const val = form[f.key];
        if (f.type === 'list' || f.type === 'json-list') {
          const items = linesToList(val as string);
          meta[f.key] = items;
        } else {
          meta[f.key] = val || null;
        }
      });

      if (Object.keys(meta).length > 0) {
        updates.meta = meta;
      }

      await onSave(config.key, updates);
      setDirty(false);
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (!section) return;
    const vals: Record<string, unknown> = {};
    config.fields.forEach(f => { vals[f.key] = (section as Record<string, unknown>)[f.key] || ''; });
    config.metaFields?.forEach(f => {
      const metaVal = (section.meta as Record<string, unknown>)?.[f.key];
      if (f.type === 'list' || f.type === 'json-list') {
        vals[f.key] = listToLines(metaVal as unknown[]);
      } else {
        vals[f.key] = metaVal ?? '';
      }
    });
    setForm(vals);
    setDirty(false);
  };

  const Icon = config.icon;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#C0132A] to-[#9C0E21] flex items-center justify-center">
            <Icon size={16} className="text-white" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-[#F5F5F5]">{config.label}</h3>
            <p className="text-[11px] text-[#666]">{config.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {dirty && (
            <button
              onClick={handleReset}
              className="cms-btn cms-btn--ghost text-xs flex items-center gap-1.5"
            >
              <RotateCcw size={12} /> Reset
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={saving || !dirty}
            className="cms-btn cms-btn--primary text-xs flex items-center gap-1.5 disabled:opacity-50"
          >
            <Save size={12} /> {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      <div className="cms-card p-4 space-y-4">
        {config.fields.map(field => (
          <div key={field.key}>
            <label className="block text-[11px] font-semibold text-[#888] uppercase tracking-wider mb-1.5">
              {field.label}
            </label>
            {field.type === 'image' ? (
              renderImageField(field.key, field.label, field.placeholder)
            ) : field.type === 'textarea' ? (
              <textarea
                value={(form[field.key] as string) || ''}
                onChange={e => handleChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                rows={4}
                className="cms-input w-full text-sm min-h-[80px] resize-y"
              />
            ) : (
              <input
                type="text"
                value={(form[field.key] as string) || ''}
                onChange={e => handleChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                className="cms-input w-full text-sm"
              />
            )}
          </div>
        ))}

        {config.metaFields && config.metaFields.length > 0 && (
          <>
            <div className="h-px bg-[#2A2A2A]" />
            <p className="text-[10px] font-semibold text-[#555] uppercase tracking-wider">Advanced / Meta</p>
          </>
        )}

        {config.metaFields?.map(field => (
          <div key={field.key}>
            <label className="block text-[11px] font-semibold text-[#888] uppercase tracking-wider mb-1.5">
              {field.label}
            </label>
            {field.type === 'image' ? (
              renderImageField(field.key, field.label, field.placeholder)
            ) : (field.type === 'list' || field.type === 'json-list') ? (
              <textarea
                value={(form[field.key] as string) || ''}
                onChange={e => handleChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                rows={4}
                className="cms-input w-full text-sm min-h-[80px] resize-y font-mono"
              />
            ) : (
              <input
                type="text"
                value={(form[field.key] as string) || ''}
                onChange={e => handleChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                className="cms-input w-full text-sm"
              />
            )}
            {(field.type === 'list' || field.type === 'json-list') && (
              <p className="text-[10px] text-[#555] mt-1">One {field.itemLabel?.toLowerCase() || 'item'} per line</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SiteEditor() {
  const [sections, setSections] = useState<Record<string, SiteSection>>({});
  const [loading, setLoading] = useState(true);
  const [expandedKey, setExpandedKey] = useState<string>('hero');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const fetchSections = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('site_sections')
        .select('*')
        .order('section_key');

      if (error) {
        console.warn('Failed to load site sections:', error.message);
        return;
      }

      if (data) {
        const map: Record<string, SiteSection> = {};
        data.forEach((s: SiteSection) => { map[s.section_key] = s; });
        setSections(map);
      }
    } catch (err) {
      console.error('Fetch sections error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  const handleSave = async (key: string, updates: Partial<SiteSection>): Promise<void> => {
    setSaveStatus('saving');
    try {
      const { data, error } = await supabase
        .from('site_sections')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('section_key', key)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setSections(prev => ({ ...prev, [key]: data as SiteSection }));
      }
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (err) {
      console.error('Save section error:', err);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-[#F5F5F5] font-heading">Site Editor</h2>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="cms-card p-6">
            <div className="cms-skeleton rounded-md mb-4" style={{ width: 200, height: 20 }} />
            <div className="cms-skeleton rounded-md mb-3" style={{ width: '100%', height: 36 }} />
            <div className="cms-skeleton rounded-md" style={{ width: '100%', height: 36 }} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#F5F5F5] font-heading">Site Editor</h2>
          <p className="text-sm text-[#888] mt-1">
            Edit your storefront sections — changes appear live on the site
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saveStatus === 'saving' && (
            <span className="text-xs text-[#C0132A] flex items-center gap-1.5">
              <div className="w-3 h-3 border border-[#C0132A] border-t-transparent rounded-full animate-spin" />
              Saving...
            </span>
          )}
          {saveStatus === 'saved' && (
            <motion.span
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-[#4CAF50] flex items-center gap-1"
            >
              ✓ Saved
            </motion.span>
          )}
          {saveStatus === 'error' && (
            <span className="text-xs text-red-400">Save failed — check console</span>
          )}
          <button
            onClick={fetchSections}
            className="cms-btn cms-btn--ghost text-xs flex items-center gap-1.5"
          >
            <RotateCcw size={12} /> Refresh
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {SECTION_CONFIGS.map(config => {
          const isExpanded = expandedKey === config.key;
          const section = sections[config.key] || null;
          const Icon = config.icon;

          return (
            <div key={config.key} className="cms-card overflow-hidden">
              <button
                onClick={() => setExpandedKey(isExpanded ? '' : config.key)}
                className="w-full flex items-center gap-3 p-4 hover:bg-[#1A1A1A]/50 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-[#1A1A1A] flex items-center justify-center flex-shrink-0 border border-[#2A2A2A]">
                  <Icon size={14} className="text-[#C0132A]" />
                </div>
                <span className="flex-1 text-left text-sm font-medium text-[#F5F5F5]">
                  {config.label}
                </span>
                {section && (
                  <span className="cms-badge cms-badge--success text-[9px]">Connected</span>
                )}
                {!section && (
                  <span className="cms-badge cms-badge--draft text-[9px]">No DB Row</span>
                )}
                {isExpanded ? (
                  <ChevronDown size={16} className="text-[#666]" />
                ) : (
                  <ChevronRight size={16} className="text-[#666]" />
                )}
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4">
                      <SectionEditor
                        config={config}
                        section={section}
                        onSave={handleSave}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <div className="cms-card p-4 flex items-center gap-3 text-xs text-[#666]">
        <Palette size={14} className="text-[#C0132A]" />
        <span>Changes are saved to the <code className="text-[#C0132A]">site_sections</code> table. The storefront reads from this table in real-time. If the table is empty or unreachable, hardcoded defaults are used.</span>
      </div>
    </div>
  );
}
