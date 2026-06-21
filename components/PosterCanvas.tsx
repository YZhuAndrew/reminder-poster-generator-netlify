import React, { useRef, useState, useLayoutEffect } from 'react';
import { PosterContent, PosterStyle, PosterTheme } from '../types';
import { renderLayout, PaperTokens } from '../config/layouts';
import { renderDecorations } from '../config/decorations';
import { getAccentScheme, getBackground } from '../config/themes';

interface PosterCanvasProps {
  id?: string;
  content: PosterContent;
  imageUrl: string | null;
  styleConfig: PosterStyle;
  isGeneratingImage: boolean;
  onClick?: () => void;
}

// 印章（重新设计）：文字可配（2-6 字），跟随强调色，自适应单/双行排版。
// 修复旧版「sealText 是死数据、印章写死横税纪检」的问题。
const Seal: React.FC<{ text?: string; fill: string }> = ({ text, fill }) => {
  const chars = (text || '').trim().split('');
  const isLong = chars.length > 3;
  const half = Math.ceil(chars.length / 2);
  const line1 = chars.slice(0, half).join('');
  const line2 = chars.slice(half).join('');
  return (
    <div className="absolute z-30 pointer-events-none" style={{ right: '56px', bottom: '56px', transform: 'rotate(-6deg)' }}>
      <div style={{ width: '64px', height: '64px', opacity: 0.92 }}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <rect x="6" y="6" width="88" height="88" rx="6" fill={fill} />
          <rect x="11" y="11" width="78" height="78" rx="3" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" />
          {isLong ? (
            <>
              <text x="50" y="45" textAnchor="middle" fill="#fff" fontFamily="'Noto Serif SC', serif" fontWeight="900" fontSize="24" letterSpacing="2">{line1}</text>
              <text x="50" y="75" textAnchor="middle" fill="#fff" fontFamily="'Noto Serif SC', serif" fontWeight="900" fontSize="24" letterSpacing="2">{line2}</text>
            </>
          ) : (
            <text x="50" y="50" textAnchor="middle" dominantBaseline="central" fill="#fff" fontFamily="'Noto Serif SC', serif" fontWeight="900" fontSize={chars.length <= 2 ? 34 : 27} letterSpacing={chars.length <= 2 ? 4 : 2}>{text}</text>
          )}
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

  // 重新设计：从 accentScheme + backgroundId 解析配色令牌
  const accentScheme = getAccentScheme(styleConfig.accentScheme);
  const bg = getBackground(styleConfig.backgroundId);
  const paper: PaperTokens = {
    paper: bg.paper,
    paper2: bg.paper2,
    ink: bg.ink,
    inkSoft: bg.inkSoft,
    accent: accentScheme.accent,
  };

  // 旧 themeColors 仍传递（向后兼容 / 节日主题路径）
  const primaryColor = theme.primaryColor || paper.accent;
  const secondaryColor = theme.secondaryColor || bg.ink;
  const backgroundColor = theme.backgroundColor || bg.paper;
  const accentColor = theme.accentColor || paper.accent;
  const themeColors = { primaryColor, secondaryColor, backgroundColor, accentColor };

  // 逻辑尺寸（像素）
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
      setScale(Math.min(availableW / logicalW, availableH / logicalH));
    };
    calculateScale();
    const observer = new ResizeObserver(calculateScale);
    if (containerRef.current) observer.observe(containerRef.current);
    window.addEventListener('resize', calculateScale);
    return () => {
      window.removeEventListener('resize', calculateScale);
      observer.disconnect();
    };
  }, [logicalW, logicalH]);

  const sealNode = styleConfig.showSeal ? (
    <Seal text={styleConfig.sealText} fill={accentScheme.sealFill} />
  ) : null;

  return (
    <div ref={containerRef} className="w-full h-full flex items-center justify-center overflow-hidden">
      <div
        id={id}
        onClick={onClick}
        className={`relative shadow-2xl overflow-hidden flex-shrink-0 transition-[width,height,background-color] duration-200 ease-out ${onClick ? 'cursor-zoom-in hover:shadow-emerald-500/20' : ''}`}
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          width: `${logicalW}px`,
          height: `${logicalH}px`,
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          backgroundColor: bg.paper, // 纯色暖纸底（不再用渐变）
        }}
      >
        {/* AI 背景图层（保留，当前 imageUrl 实际为 null 走纯色底） */}
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Background Texture"
            className="absolute inset-0 w-full h-full object-cover z-0 opacity-100"
            crossOrigin="anonymous"
          />
        ) : (
          isGeneratingImage && (
            <div className="absolute inset-0 flex items-center justify-center z-50 bg-black/30 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin w-12 h-12 border-4 border-white/20 border-t-white rounded-full shadow-lg" />
                <div className="text-white font-bold text-sm tracking-wider">AI 绘图中...</div>
              </div>
            </div>
          )
        )}

        {/* 装饰元素（保留可用；新设计默认不启用） */}
        <div className="absolute inset-0 z-[18] pointer-events-none">
          {renderDecorations(styleConfig.decorations || [], styleConfig.theme)}
        </div>

        {/* 版式布局 —— 注入新设计令牌 */}
        {renderLayout(styleConfig.layout || 'classic', {
          content,
          styleConfig,
          themeColors,
          paper,
          sealNode,
        })}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: ${paper.accent}; border-radius: 4px; opacity: 0.2; }

        /* 正文富文本：字号继承父级；h2/h3 渲染为强调色竖条小标题（修复旧版隐藏 bug） */
        .rich-text-content * {
            font-size: inherit !important;
            line-height: inherit;
            font-family: inherit;
        }
        .rich-text-content h2, .rich-text-content h3 {
            font-size: 1.16em !important;
            line-height: 1.4;
            margin: 0.55em 0 0.45em;
            font-weight: 900;
            padding-left: 0.5em;
            border-left: 3px solid ${paper.accent};
            text-indent: 0;
        }
        .rich-text-content h2:first-child, .rich-text-content h3:first-child { margin-top: 0; }
        .rich-text-content p {
            margin: 0 0 0.5em;
            text-indent: 2em;
        }
        .rich-text-content p:first-child { margin-top: 0; }
        /* 编号序号 一、二、 强调色加粗 */
        .rich-text-content b, .rich-text-content strong {
            font-weight: 900;
            color: ${paper.accent};
            margin-right: 0.15em;
        }
        .rich-text-content ul, .rich-text-content ol { margin-bottom: 0.8em; }
      `}</style>
    </div>
  );
};
