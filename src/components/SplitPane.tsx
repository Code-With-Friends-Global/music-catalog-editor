import React, { useRef, useState, useEffect, useCallback } from 'react';

interface SplitPaneProps {
  topContent: React.ReactNode;
  bottomContent: React.ReactNode;
  initialRatio: number;
  onRatioChange: (ratio: number) => void;
}

const MIN_RATIO = 0.15;
const MAX_RATIO = 0.85;

export default function SplitPane({
  topContent,
  bottomContent,
  initialRatio,
  onRatioChange,
}: SplitPaneProps) {
  const [ratio, setRatio] = useState(() =>
    Math.min(MAX_RATIO, Math.max(MIN_RATIO, initialRatio)),
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging.current || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const offsetY = e.clientY - rect.top;
      const newRatio = offsetY / rect.height;
      const clamped = Math.min(MAX_RATIO, Math.max(MIN_RATIO, newRatio));

      setRatio(clamped);
      onRatioChange(clamped);
    },
    [onRatioChange],
  );

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const handleDividerMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
  };

  return (
    <div ref={containerRef} className="flex flex-col h-full">
      <div className="overflow-auto" style={{ height: `${ratio * 100}%` }}>
        {topContent}
      </div>
      <div
        className="h-2 bg-gray-300 hover:bg-blue-400 cursor-row-resize flex-shrink-0"
        onMouseDown={handleDividerMouseDown}
      />
      <div className="overflow-auto" style={{ height: `${(1 - ratio) * 100}%` }}>
        {bottomContent}
      </div>
    </div>
  );
}
