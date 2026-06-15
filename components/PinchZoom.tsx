import React, { useRef, useState, useCallback } from 'react';

/**
 * 双指缩放 + 拖拽容器（移动端预览用）。
 * - 双指捏合缩放 scale
 * - 单指拖拽平移
 * - 双击重置
 * 不依赖任何第三方库，纯 touch 事件。
 */
export const PinchZoom: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);

  // 触摸状态（用 ref 避免 re-render 抖动）
  const touchState = useRef({
    mode: 'none' as 'none' | 'pan' | 'pinch',
    startDistance: 0,
    startScale: 1,
    startTx: 0,
    startTy: 0,
    // pan 起点（单指）
    panStartX: 0,
    panStartY: 0,
    lastTap: 0,
  });

  const distance = (touches: React.TouchList) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.hypot(dx, dy);
  };

  const reset = useCallback(() => {
    setScale(1);
    setTx(0);
    setTy(0);
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const st = touchState.current;
      st.mode = 'pinch';
      st.startDistance = distance(e.touches);
      st.startScale = scale;
      st.startTx = tx;
      st.startTy = ty;
    } else if (e.touches.length === 1) {
      const st = touchState.current;
      st.mode = 'pan';
      st.panStartX = e.touches[0].clientX - tx;
      st.panStartY = e.touches[0].clientY - ty;

      // 双击检测（重置）
      const now = Date.now();
      if (now - st.lastTap < 300) {
        reset();
      }
      st.lastTap = now;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const st = touchState.current;
    if (st.mode === 'pinch' && e.touches.length === 2) {
      e.preventDefault();
      const currentDistance = distance(e.touches);
      if (st.startDistance > 0) {
        const newScale = Math.max(0.5, Math.min(4, (st.startScale * currentDistance) / st.startDistance));
        setScale(newScale);
      }
    } else if (st.mode === 'pan' && e.touches.length === 1) {
      e.preventDefault();
      setTx(e.touches[0].clientX - st.panStartX);
      setTy(e.touches[0].clientY - st.panStartY);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length === 0) {
      touchState.current.mode = 'none';
    } else if (e.touches.length === 1) {
      // 从双指变单指，切换到 pan
      const st = touchState.current;
      st.mode = 'pan';
      st.panStartX = e.touches[0].clientX - tx;
      st.panStartY = e.touches[0].clientY - ty;
    }
  };

  return (
    <div
      ref={containerRef}
      className={className}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        touchAction: 'none',
        transformOrigin: 'center center',
        transform: `translate(${tx}px, ${ty}px) scale(${scale})`,
        transition: touchState.current.mode === 'none' ? 'transform 0.2s ease-out' : 'none',
      }}
    >
      {children}
    </div>
  );
};
