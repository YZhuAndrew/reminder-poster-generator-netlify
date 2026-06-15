import React, { useRef, useState, useLayoutEffect } from 'react';
import { PosterContent, PosterStyle, PosterTheme } from '../types';
import { renderBackgroundPattern } from '../config/textures';
import { renderLayout } from '../config/layouts';
import { renderDecorations } from '../config/decorations';

interface PosterCanvasProps {
  id?: string;
  content: PosterContent;
  imageUrl: string | null;
  styleConfig: PosterStyle;
  isGeneratingImage: boolean;
  onClick?: () => void;
}

// 渲染印章（文字可配，解决原先硬编码"横税纪检"）
const Seal: React.FC<{ text: string }> = ({ text }) => {
  // 支持 2-4 字，自动按 2x2 / 2x2 排版
  const chars = text.split('').slice(0, 4);
  const line1 = chars.slice(0, 2).join('');
  const line2 = chars.slice(2, 4).join('');
  const fontSize = chars.length <= 2 ? 70 : 56;
  return (
    <div className="absolute bottom-6 right-6 z-30 transform rotate-[-5deg] pointer-events-none">
      <div className="w-24 h-24 relative transition-all duration-300">
        <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-sm" style={{ opacity: 0.85 }}>
          <g>
            <rect x="10" y="10" width="180" height="180" rx="25" ry="25" fill="#D81E06" />
            <rect
              x="20"
              y="20"
              width="160"
              height="160"
              rx="18"
              fill="none"
              stroke="rgba(255,255,255,0.4)"
              strokeWidth="4"
              strokeDasharray="12 8"
            />
            {line2 ? (
              <>
                <text x="100" y="90" textAnchor="middle" fill="white" fontFamily="'Noto Serif SC', serif" fontWeight="900" fontSize={fontSize} letterSpacing="10">
                  {line1}
                </text>
                <text x="100" y="160" textAnchor="middle" fill="white" fontFamily="'Noto Serif SC', serif" fontWeight="900" fontSize={fontSize} letterSpacing="10">
                  {line2}
                </text>
              </>
            ) : (
              <text x="100" y="125" textAnchor="middle" fill="white" fontFamily="'Noto Serif SC', serif" fontWeight="900" fontSize={fontSize} letterSpacing="10">
                {line1}
              </text>
            )}
          </g>
        </svg>
      </div>
    </div>
  );
};

export const PosterCanvas: React.FC<PosterCanvasProps> = ({
  id = 'poster-capture-area',
  content,
  imageUrl,
  styleConfig,
  isGeneratingImage,
  onClick,
}) => {
  const theme = styleConfig.theme || ({} as Partial<PosterTheme>);

  // Safe accessors
  const primaryColor = theme.primaryColor || '#DE2910';
  const secondaryColor = theme.secondaryColor || '#FFFF00';
  const backgroundColor = theme.backgroundColor || '#FFFBF0';
  const accentColor = theme.accentColor || '#DE2910';

  const footerSize = Math.max(10, Math.round((styleConfig.bodySize || 16) * 0.6));

  // Logical dimensions from config (pixels)
  const logicalW = styleConfig.widthScale > 100 ? styleConfig.widthScale : 600;
  const logicalH = styleConfig.heightScale > 100 ? styleConfig.heightScale : 600;

  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const calculateScale = () => {
      if (!containerRef.current) return;
      const parent = containerRef.current;
      const availableW = parent.clientWidth - 40;
      const availableH = parent.clientHeight - 40;
      if (availableW <= 0 || availableH <= 0) return;
      const scaleX = availableW / logicalW;
      const scaleY = availableH / logicalH;
      setScale(Math.min(scaleX, scaleY));
    };

    calculateScale();

    const observer = new ResizeObserver(() => {
      calculateScale();
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    window.addEventListener('resize', calculateScale);
    return () => {
      window.removeEventListener('resize', calculateScale);
      observer.disconnect();
    };
  }, [logicalW, logicalH]);

  const themeColors = { primaryColor, secondaryColor, backgroundColor, accentColor };
  const sealNode = styleConfig.showSeal ? <Seal text={styleConfig.sealText || '警示'} /> : null;

  return (
    <div ref={containerRef} className="w-full h-full flex items-center justify-center overflow-hidden">
      <div
        id={id}
        onClick={onClick}
        className={`relative shadow-2xl overflow-hidden text-black flex-shrink-0 transition-[width,height,background-color] duration-200 ease-out ${onClick ? 'cursor-zoom-in hover:shadow-emerald-500/20' : ''}`}
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          width: `${logicalW}px`,
          height: `${logicalH}px`,
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          backgroundColor: primaryColor,
        }}
      >
        {/* Background Image Layer */}
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Background Texture"
            className="absolute inset-0 w-full h-full object-cover z-0 opacity-100"
            crossOrigin="anonymous"
          />
        ) : (
          <div
            className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden"
            style={{ background: `linear-gradient(135deg, ${primaryColor}, #000000)` }}
          >
            {renderBackgroundPattern(styleConfig.textureStyle, { primaryColor, secondaryColor })}
            {isGeneratingImage && (
              <div className="absolute inset-0 flex items-center justify-center z-50 bg-black/30 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-3">
                  <div className="animate-spin w-12 h-12 border-4 border-white/20 border-t-white rounded-full shadow-lg" />
                  <div className="text-white font-bold text-sm tracking-wider">AI 绘图中...</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 装饰元素（在背景之上、布局之下/同级 z-20） */}
        <div className="absolute inset-0 z-[18] pointer-events-none">
          {renderDecorations(styleConfig.decorations || [], styleConfig.theme)}
        </div>

        {/* 版式布局 */}
        {renderLayout(styleConfig.layout || 'classic', {
          content,
          styleConfig,
          themeColors,
          sealNode,
        })}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${accentColor};
          border-radius: 4px;
          opacity: 0.2;
        }

        /* 
           CRITICAL FIX for Body Size Slider:
           Force all generic text elements to inherit the font-size set on the parent .rich-text-content div.
           This overrides browser defaults and any inline styles that might have been pasted in.
        */
        .rich-text-content * {
            font-size: inherit !important;
            line-height: inherit;
            font-family: inherit;
        }

        .rich-text-content h2 {
            font-size: 2em !important;
            line-height: 1.3;
            margin-top: 0.8em;
            margin-bottom: 0.4em;
            font-weight: 900;
            color: ${accentColor};
        }
        .rich-text-content h3 {
            font-size: 1.5em !important;
            line-height: 1.3;
            margin-top: 0.6em;
            margin-bottom: 0.3em;
            font-weight: 800;
        }
        
        .rich-text-content p {
            margin-bottom: 0.8em;
        }
        .rich-text-content b, .rich-text-content strong {
            font-weight: 900;
        }
        .rich-text-content ul, .rich-text-content ol {
            margin-bottom: 0.8em;
        }
      `}</style>
    </div>
  );
};
