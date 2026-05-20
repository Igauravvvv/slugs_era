import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface SiteSection {
  id: string;
  section_key: string;
  title: string | null;
  subtitle: string | null;
  body_text: string | null;
  image_url: string | null;
  cta_text: string | null;
  cta_link: string | null;
  meta: Record<string, unknown>;
  updated_at: string;
}

type SiteContentMap = Record<string, SiteSection>;

interface SiteContentContextType {
  sections: SiteContentMap;
  loading: boolean;
  getSection: (key: string) => SiteSection | null;
  getMeta: (key: string, field: string, fallback?: unknown) => unknown;
  refresh: () => void;
}

const SiteContentContext = createContext<SiteContentContextType>({
  sections: {},
  loading: true,
  getSection: () => null,
  getMeta: () => undefined,
  refresh: () => {},
});

export function SiteContentProvider({ children }: { children: React.ReactNode }) {
  const [sections, setSections] = useState<SiteContentMap>({});
  const [loading, setLoading] = useState(true);

  const fetchSections = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('site_sections')
        .select('*')
        .order('section_key');

      if (error) {
        console.warn('site_sections fetch failed — using hardcoded defaults:', error.message);
        return;
      }

      if (data && data.length > 0) {
        const map: SiteContentMap = {};
        data.forEach((s: SiteSection) => {
          map[s.section_key] = s;
        });
        setSections(map);
      }
    } catch (err) {
      console.warn('site_sections fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  const getSection = useCallback((key: string): SiteSection | null => {
    return sections[key] || null;
  }, [sections]);

  const getMeta = useCallback((key: string, field: string, fallback?: unknown): unknown => {
    const section = sections[key];
    if (!section?.meta) return fallback;
    return (section.meta as Record<string, unknown>)[field] ?? fallback;
  }, [sections]);

  return (
    <SiteContentContext.Provider value={{ sections, loading, getSection, getMeta, refresh: fetchSections }}>
      {children}
    </SiteContentContext.Provider>
  );
}

export function useSiteContent() {
  return useContext(SiteContentContext);
}

export function useSiteSection(key: string) {
  const { getSection, getMeta, loading } = useSiteContent();
  return {
    section: getSection(key),
    getMeta: (field: string, fallback?: unknown) => getMeta(key, field, fallback),
    loading,
  };
}
