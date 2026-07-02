import { useEffect, useRef } from 'react';

export default function LogoAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // We have frames 004 to 144
    const startFrame = 4;
    const endFrame = 144;
    const totalFrames = endFrame - startFrame + 1;
    
    // Preload images
    const images: HTMLImageElement[] = [];
    let loadedImages = 0;
    
    for (let i = startFrame; i <= endFrame; i++) {
      const img = new Image();
      // Pad number to 3 digits (e.g. 004)
      const paddedNum = i.toString().padStart(3, '0');
      img.src = `/images/Logo_Animation_Slow_Crawl_frames/Logo_Animation_Slow_Crawl_${paddedNum}.png`;
      
      img.onload = () => {
        loadedImages++;
      };
      images.push(img);
    }
    
    let frameIndex = 0;
    let animationFrameId: number;
    let lastDrawTime = 0;
    const fps = 24; // Standard animation speed
    const frameInterval = 1000 / fps;
    
    const render = (time: number) => {
      // Only draw if we have loaded enough images and enough time has passed
      if (loadedImages > 0 && (time - lastDrawTime) > frameInterval) {
        const img = images[frameIndex];
        
        if (img && img.complete) {
          // Set canvas dimensions to match image if not set
          if (canvas.width !== img.width) {
            canvas.width = img.width;
            canvas.height = img.height;
          }
          
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          frameIndex = (frameIndex + 1) % images.length;
          lastDrawTime = time;
        }
      }
      
      animationFrameId = requestAnimationFrame(render);
    };
    
    animationFrameId = requestAnimationFrame(render);
    
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
      <canvas 
        ref={canvasRef} 
        className="w-[340px] h-auto object-contain" 
        style={{ minWidth: "340px", maxWidth: "340px" }}
      />
    </div>
  );
}
