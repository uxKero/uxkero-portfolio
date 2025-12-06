import React, { useState, useEffect, useRef, useCallback } from "react";
import { GripVertical } from "lucide-react";

interface CodeComparisonProps {
  beforeContent: React.ReactNode;
  afterContent: React.ReactNode;
  className?: string;
}

export const CodeComparison: React.FC<CodeComparisonProps> = ({
  beforeContent,
  afterContent,
  className = "",
}) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
      const percentage = (x / rect.width) * 100;

      setSliderPosition(percentage);
    },
    [isDragging]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isDragging || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const touch = e.touches[0];
      const x = Math.max(0, Math.min(touch.clientX - rect.left, rect.width));
      const percentage = (x / rect.width) * 100;

      setSliderPosition(percentage);
    },
    [isDragging]
  );

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("touchmove", handleTouchMove);
      document.addEventListener("touchend", handleMouseUp);
    } else {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-[300px] md:h-[400px] overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/50 select-none ${className}`}
    >
      {/* BEFORE CONTENT (Left Side / Base Layer) */}
      <div className="absolute inset-0 w-full h-full flex items-center justify-center p-4">
        <div className="w-full h-full overflow-hidden">
             {beforeContent}
        </div>
      </div>

      {/* AFTER CONTENT (Right Side / Top Layer) */}
      <div
        className="absolute inset-0 w-full h-full flex items-center justify-center p-4 bg-zinc-950/50 backdrop-blur-sm"
        style={{
          clipPath: `inset(0 0 0 ${sliderPosition}%)`,
        }}
      >
        <div className="w-full h-full overflow-hidden">
             {afterContent}
        </div>
      </div>

      {/* SLIDER HANDLE */}
      <div
        className="absolute inset-y-0 w-1 bg-zinc-700 cursor-ew-resize z-50 hover:bg-zinc-500 transition-colors"
        style={{ left: `${sliderPosition}%` }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-zinc-800 border border-zinc-600 rounded-full flex items-center justify-center shadow-lg">
          <GripVertical className="w-4 h-4 text-zinc-400" />
        </div>
      </div>
      
      {/* LABELS */}
       <div className="absolute bottom-4 left-4 text-[9px] md:text-[10px] font-mono text-zinc-500 uppercase tracking-widest pointer-events-none opacity-50">
        Source Code
      </div>
      <div className="absolute bottom-4 right-4 text-[9px] md:text-[10px] font-mono text-emerald-500 uppercase tracking-widest pointer-events-none opacity-50">
        Live Execution
      </div>

    </div>
  );
};