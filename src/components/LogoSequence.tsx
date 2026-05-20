import { useState, useEffect } from 'react';

interface LogoSequenceProps {
  className?: string;
}

export default function LogoSequence({ className }: LogoSequenceProps) {
  const [frame, setFrame] = useState(4); // Starts at 004 according to folder contents
  const totalFrames = 144;

  useEffect(() => {
    // Preload next few frames for smoother playback
    const preloadAhead = 10;
    
    let interval: ReturnType<typeof setInterval>;
    interval = setInterval(() => {
      setFrame((prev) => {
        if (prev < totalFrames) {
          const next = prev + 1;
          
          // Preload upcoming frames passively
          for (let i = 1; i <= preloadAhead; i++) {
            if (next + i <= totalFrames) {
              const img = new Image();
              img.src = `/images/Logo_Animation_Slow_Crawl_frames/Logo_Animation_Slow_Crawl_${String(next + i).padStart(3, '0')}.png`;
            }
          }
          
          return next;
        } else {
          // Play once and stop at last frame, just like the video did
          clearInterval(interval);
          return prev;
        }
      });
    }, 1000 / 30); // ~30 fps

    return () => clearInterval(interval);
  }, []);

  const paddedFrame = String(frame).padStart(3, '0');
  const src = `/images/Logo_Animation_Slow_Crawl_frames/Logo_Animation_Slow_Crawl_${paddedFrame}.png`;

  return (
    <img 
      src={src} 
      alt="Slug's Era Animated Logo" 
      className={className} 
    />
  );
}
