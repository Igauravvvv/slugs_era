"use client";

import { useState } from "react";
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

  return (
    <div className="w-full bg-transparent">
      <div className="relative flex w-full items-center justify-center py-4 transition-all duration-300 ease-in-out">
        <div className="w-full px-2 lg:px-4">
          <div className="flex w-full flex-col lg:flex-row items-center justify-center gap-3 lg:gap-4 h-[35rem] lg:h-[24rem]">
            {items.map((item, idx) => {
              const isExpanded = expandedIndex === idx;
              return (
                <div
                  key={idx}
                  className="group relative cursor-pointer overflow-hidden rounded-3xl transition-all duration-700 ease-out w-full lg:w-auto h-full"
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
                  
                  <div className="absolute inset-x-0 bottom-0 p-4 lg:p-6 flex flex-col justify-end transition-all duration-700">
                    <div className="flex items-center gap-3">
                      <div className="bg-white/10 backdrop-blur-md p-2 lg:p-3 rounded-full lg:rounded-2xl flex-shrink-0 border border-white/20">
                        <item.icon className="w-5 h-5 lg:w-7 lg:h-7 text-white" />
                      </div>
                      
                      <div className="flex flex-col overflow-hidden">
                        <h3 className={`font-display text-white font-semibold transition-all duration-700 origin-left whitespace-nowrap lg:whitespace-normal
                          ${isExpanded ? 'text-xl lg:text-3xl lg:opacity-100' : 'text-lg opacity-100 lg:opacity-0 lg:translate-x-4'}`}>
                          {item.title}
                        </h3>
                      </div>
                    </div>
                    
                    <div className={`grid transition-all duration-700 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100 mt-3 lg:mt-5' : 'grid-rows-[0fr] opacity-0 mt-0'}`}>
                      <div className="overflow-hidden">
                        {item.quote && (
                          <p className="text-[#C0132A] font-medium italic text-sm lg:text-[15px] mb-2 leading-relaxed">
                            "{item.quote}"
                          </p>
                        )}
                        <p className="text-white/80 text-sm lg:text-[15px] font-light leading-relaxed max-w-md">
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
  );
};
