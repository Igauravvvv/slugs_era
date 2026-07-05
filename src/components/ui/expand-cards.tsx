"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { LucideIcon } from "lucide-react";

export interface ExpandCardItem {
  image: string;
  title: string;
  quote?: string;
  description: string;
  icon: LucideIcon;
  objectPosition?: string;
}

export const ExpandOnHover = ({ items }: { items: ExpandCardItem[] }) => {
  const [expandedIndex, setExpandedIndex] = useState(0);
  const [mobileActiveIndex, setMobileActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const autoScrollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const userInteractingRef = useRef(false);

  // Get the width of a single card + gap for scroll calculations
  const getCardScrollWidth = useCallback(() => {
    if (!scrollRef.current) return 0;
    const firstCard = scrollRef.current.children[0]?.children[0] as HTMLElement;
    if (!firstCard) return 0;
    return firstCard.offsetWidth + 12; // 12px = gap-3 (0.75rem)
  }, []);

  // Scroll to a specific card index
  const scrollToCard = useCallback((index: number) => {
    if (!scrollRef.current) return;
    const cardWidth = getCardScrollWidth();
    scrollRef.current.scrollTo({
      left: index * cardWidth,
      behavior: 'smooth',
    });
  }, [getCardScrollWidth]);

  // Auto-scroll on mobile
  useEffect(() => {
    const startAutoScroll = () => {
      if (autoScrollRef.current) clearInterval(autoScrollRef.current);
      autoScrollRef.current = setInterval(() => {
        if (userInteractingRef.current) return;
        setMobileActiveIndex((prev) => {
          const next = (prev + 1) % items.length;
          scrollToCard(next);
          return next;
        });
      }, 3000);
    };

    // Only auto-scroll on mobile
    const mql = window.matchMedia('(max-width: 1023px)');
    if (mql.matches) {
      startAutoScroll();
    }

    const handleChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        startAutoScroll();
      } else if (autoScrollRef.current) {
        clearInterval(autoScrollRef.current);
      }
    };

    mql.addEventListener('change', handleChange);

    return () => {
      if (autoScrollRef.current) clearInterval(autoScrollRef.current);
      mql.removeEventListener('change', handleChange);
    };
  }, [items.length, scrollToCard]);

  // Detect which card is visible via scroll position
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const handleScroll = () => {
      const cardWidth = getCardScrollWidth();
      if (cardWidth === 0) return;
      const index = Math.round(container.scrollLeft / cardWidth);
      setMobileActiveIndex(Math.min(index, items.length - 1));
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [getCardScrollWidth, items.length]);

  // Pause auto-scroll when user touches
  const handleTouchStart = () => {
    userInteractingRef.current = true;
  };

  const handleTouchEnd = () => {
    // Resume auto-scroll after 4s of no interaction
    setTimeout(() => {
      userInteractingRef.current = false;
    }, 4000);
  };

  // Dot click handler
  const goToCard = (index: number) => {
    setMobileActiveIndex(index);
    scrollToCard(index);
    userInteractingRef.current = true;
    setTimeout(() => {
      userInteractingRef.current = false;
    }, 4000);
  };

  return (
    <div className="w-full bg-transparent">
      {/* Mobile: auto-scrolling carousel */}
      <div className="lg:hidden w-full py-4">
        <div
          ref={scrollRef}
          className="w-full overflow-x-auto hide-scrollbar snap-x snap-mandatory px-4"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="flex gap-3 w-max">
            {items.map((item, idx) => (
              <div
                key={idx}
                className="relative w-[75vw] min-w-[260px] max-w-[320px] aspect-[3/4] rounded-2xl overflow-hidden flex-shrink-0 snap-center"
              >
                <img
                  className={`absolute inset-0 w-full h-full object-cover ${item.objectPosition || 'object-center'}`}
                  src={item.image}
                  alt={item.title}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10" />
                
                <div className="absolute inset-x-0 bottom-0 p-4 flex flex-col justify-end">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="bg-white/10 backdrop-blur-md p-2 rounded-full flex-shrink-0 border border-white/20">
                      <item.icon className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="font-display text-white font-semibold text-lg leading-tight">
                      {item.title}
                    </h3>
                  </div>
                  {item.quote && (
                    <p className="text-[#C0132A] font-medium italic text-xs mb-1.5 leading-relaxed">
                      "{item.quote}"
                    </p>
                  )}
                  <p className="text-white/75 text-xs font-light leading-relaxed line-clamp-3">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dot indicators */}
        <div className="flex items-center justify-center gap-2 mt-4">
          {items.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToCard(idx)}
              className={`rounded-full transition-all duration-300 ${
                mobileActiveIndex === idx
                  ? 'w-6 h-2 bg-[#C0132A]'
                  : 'w-2 h-2 bg-[#C0132A]/25'
              }`}
              aria-label={`Go to value ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Desktop: expand-on-hover layout (UNCHANGED) */}
      <div className="hidden lg:block">
        <div className="relative flex w-full items-center justify-center py-4 transition-all duration-300 ease-in-out">
          <div className="w-full px-4">
            <div className="flex w-full flex-row items-center justify-center gap-4 h-[24rem]">
              {items.map((item, idx) => {
                const isExpanded = expandedIndex === idx;
                return (
                  <div
                    key={idx}
                    className="group relative cursor-pointer overflow-hidden rounded-3xl transition-all duration-700 ease-out h-full"
                    style={{
                      flex: isExpanded ? "5" : "1",
                    }}
                    onMouseEnter={() => setExpandedIndex(idx)}
                  >
                    <img
                      className={`absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 ${item.objectPosition || 'object-center'}`}
                      src={item.image}
                      alt={item.title}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10 transition-opacity duration-700" />
                    
                    <div className="absolute inset-x-0 bottom-0 p-6 flex flex-col justify-end transition-all duration-700">
                      <div className="flex items-center gap-3">
                        <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl flex-shrink-0 border border-white/20">
                          <item.icon className="w-7 h-7 text-white" />
                        </div>
                        
                        <div className="flex flex-col overflow-hidden">
                          <h3 className={`font-display text-white font-semibold transition-all duration-700 origin-left
                            ${isExpanded ? 'text-3xl opacity-100' : 'opacity-0 translate-x-4'}`}>
                            {item.title}
                          </h3>
                        </div>
                      </div>
                      
                      <div className={`grid transition-all duration-700 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100 mt-5' : 'grid-rows-[0fr] opacity-0 mt-0'}`}>
                        <div className="overflow-hidden">
                          {item.quote && (
                            <p className="text-[#C0132A] font-medium italic text-[15px] mb-2 leading-relaxed">
                              "{item.quote}"
                            </p>
                          )}
                          <p className="text-white/80 text-[15px] font-light leading-relaxed max-w-md">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
