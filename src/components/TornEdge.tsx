import { useMemo } from 'react';

interface TornEdgeProps {
  fill?: string;
  position?: 'top' | 'bottom';
  className?: string;
  shadow?: boolean;
}

export default function TornEdge({ fill = '#ffffff', position = 'top', className = '', shadow = false }: TornEdgeProps) {
  // Generate random edges using sine functions for organic feel
  const pathData = useMemo(() => {
    let d = "M0,0 L0,50 ";
    for (let i = 0; i <= 100; i++) {
        const x = (i / 100) * 1200;
        const rand1 = Math.sin(i * 123.456) * 10;
        const rand2 = Math.cos(i * 789.123) * 5;
        const y = 30 + rand1 + rand2;
        d += `L${x},${y} `;
    }
    d += "L1200,0 Z";
    return d;
  }, []);

  const d2Offset = useMemo(() => {
    let d = "M0,0 L0,50 ";
    for (let i = 0; i <= 100; i++) {
        const x = (i / 100) * 1200;
        const rand1 = Math.sin(i * 321.654) * 8;
        const rand2 = Math.cos(i * 987.321) * 7;
        const y = 35 + rand1 + rand2;
        d += `L${x},${y} `;
    }
    d += "L1200,0 Z";
    return d;
  }, []);

  return (
    <div 
      className={`absolute left-0 w-full z-20 pointer-events-none overflow-hidden ${
        position === 'top' 
          ? 'top-0 -translate-y-[99%] rotate-180' 
          : 'bottom-0 translate-y-[99%]'
      } ${className}`}
      style={{ height: '3vw', minHeight: '35px', maxHeight: '55px' }}
    >
      <svg
        viewBox="0 0 1200 50"
        preserveAspectRatio="none"
        className={`w-full h-full block ${shadow && position === 'bottom' ? 'drop-shadow-[0_10px_10px_rgba(0,0,0,0.2)]' : shadow && position === 'top' ? 'drop-shadow-[0_-10px_10px_rgba(0,0,0,0.2)]' : ''}`}
      >
        <path d={d2Offset} fill={fill} opacity="0.85" />
        <path d={pathData} fill={fill} />
      </svg>
    </div>
  );
}
