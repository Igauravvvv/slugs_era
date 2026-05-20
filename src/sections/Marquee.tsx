import { useSiteSection } from '@/context/SiteContentContext';

export default function Marquee() {
  const { section } = useSiteSection('marquee');
  const items = (section?.meta?.items as string[]) || [
    'The Philosophy of Slow',
    'Movement. Not Merch',
    'Coastal Drift — New Drop',
    'Premium Organic Cotton',
    'Intentional Fashion',
    'Wear Less, Wear Better',
  ];

  return (
    <div className="bg-[#C0132A] overflow-hidden py-3.5">
      <div className="animate-marquee flex whitespace-nowrap">
        {[...items, ...items].map((item, index) => (
          <span
            key={index}
            className="font-display text-[11px] lg:text-[13px] italic tracking-[0.1em] text-white/92 px-5 lg:px-8 inline-flex items-center gap-2.5"
          >
            {item}
            <span className="text-[7px] opacity-50 not-italic">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
