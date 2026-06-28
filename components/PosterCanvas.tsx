import React, { useRef, useState, useLayoutEffect } from 'react';
import { PosterContent, PosterStyle, PosterTheme } from '../types';
import { renderLayout, PaperTokens } from '../config/layouts';
import { renderDecorations } from '../config/decorations';
import { getAccentScheme, getBackground } from '../config/themes';

interface PosterCanvasProps {
  id?: string;
  content: PosterContent;
  styleConfig: PosterStyle;
  onClick?: () => void;
}

// 印章（典雅升级）：文字可配（2-6 字），跟随强调色，自适应单/双行排版，
// 叠加拓印质感（飞白边缘 + 不透明度变化 + multiply 混合），模拟真实按压的朱砂印。
// 修复：空文字时返回 null，避免渲染空红框。
const Seal: React.FC<{ text?: string; fill: string }> = ({ text, fill }) => {
  const trimmed = (text || '').trim();
  if (trimmed.length === 0) return null; // 修复空文字渲染空框的 bug
  const chars = trimmed.split('');
  const isLong = chars.length > 3;
  const half = Math.ceil(chars.length / 2);
  const line1 = chars.slice(0, half).join('');
  const line2 = chars.slice(half).join('');
  return (
    <div
      className="absolute z-30 pointer-events-none"
      // 印章底部对齐到内边框线（inset 20px），不旋转，叠 multiply 真正"盖"在纸上
      style={{ right: '34px', bottom: '34px', mixBlendMode: 'multiply' as const }}
    >
      {/* 拓印质感：两层叠加，外层略偏移+低透明模拟按压不均 */}
      <div style={{ width: '68px', height: '68px', opacity: 0.88, position: 'relative' }}>
        {/* 飞白遮罩：径向渐变让边缘出现不规则的"缺墨" */}
        <div
          style={{
            position: 'absolute', inset: 0, borderRadius: '8px', pointerEvents: 'none',
            background: 'radial-gradient(ellipse at 30% 25%, transparent 60%, rgba(0,0,0,0.18) 100%)',
            mixBlendMode: 'multiply', zIndex: 2,
          }}
        />
        <svg viewBox="0 0 100 100" className="w-full h-full" style={{ position: 'relative', zIndex: 1 }}>
          <rect x="6" y="6" width="88" height="88" rx="7" fill={fill} />
          {/* 内描白边，略带粗细变化模拟篆刻 */}
          <rect x="11" y="11" width="78" height="78" rx="3" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="2.2" />
          {isLong ? (
            <>
              <text x="50" y="44" textAnchor="middle" fill="#fff" fontFamily="'Noto Serif SC', serif" fontWeight="900" fontSize="23" letterSpacing="2">{line1}</text>
              <text x="50" y="74" textAnchor="middle" fill="#fff" fontFamily="'Noto Serif SC', serif" fontWeight="900" fontSize="23" letterSpacing="2">{line2}</text>
            </>
          ) : (
            <text x="50" y="50" textAnchor="middle" dominantBaseline="central" fill="#fff" fontFamily="'Noto Serif SC', serif" fontWeight="900" fontSize={chars.length <= 2 ? 33 : 26} letterSpacing={chars.length <= 2 ? 4 : 2}>{trimmed}</text>
          )}
        </svg>
      </div>
    </div>
  );
};

// 典雅升级：海报纸张材质层。
// 两层叠加（全部 pointer-events-none，遵循项目 iOS Safari 硬约束：仅 CSS 渐变，不用 SVG filter）：
//   1. 宣纸纤维点阵 —— 极淡的 CSS radial-gradient 点阵，破纯色平涂的"塑料感"
//   2. 水墨角晕     —— 四角径向暗角（paper2 色），模拟纸张受光/做旧的边缘
// opacityStrength（0-100）控制整体强度，用户可调。
const PosterTexture: React.FC<{ paper: PaperTokens; enabled: boolean; opacityStrength: number }> = ({ paper, enabled, opacityStrength }) => {
  if (!enabled) return null;
  const k = Math.max(0, Math.min(100, opacityStrength)) / 100; // 归一化 0-1
  return (
    <>
      {/* 宣纸纤维点阵：用 ink 色极淡点阵模拟纸纤维，安全无 filter */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(${paper.ink} 0.4px, transparent 0.5px)`,
          backgroundSize: '3px 3px',
          opacity: 0.03 + 0.05 * k,
          mixBlendMode: 'multiply',
          zIndex: 1,
        }}
      />
      {/* 水墨角晕：四角用 paper2 暗角，模拟受光/做旧 */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 125% 125% at 50% 45%, transparent 52%, ${paper.paper2} 100%)`,
          opacity: 0.3 + 0.5 * k,
          mixBlendMode: 'multiply',
          zIndex: 2,
        }}
      />
    </>
  );
};

// 典雅升级：海报装饰边框（8 种样式可选）。
// 默认 double。纯 CSS + SVG，遵循项目 iOS Safari 约束（不用 filter）。
export const FRAME_STYLES = [
  { id: 'double',   name: '双线装裱' },
  { id: 'simple',   name: '简约单线' },
  { id: 'triple',   name: '三线套框' },
  { id: 'cloud',    name: '云纹角花' },
  { id: 'floral',   name: '缠枝角花' },
  { id: 'corner',   name: '四角印章' },
  { id: 'meander',  name: '回纹套框' },
  { id: 'none',     name: '无边框' },
] as const;
type FrameStyle = typeof FRAME_STYLES[number]['id'];

// 四角 SVG 定位助手
const corner4 = (svg: React.ReactNode, sz: number) => {
  const pos = [
    { top: -sz/2, left: -sz/2 },
    { top: -sz/2, right: -sz/2, transform: 'scaleX(-1)' },
    { bottom: -sz/2, left: -sz/2, transform: 'scaleY(-1)' },
    { bottom: -sz/2, right: -sz/2, transform: 'scale(-1)' },
  ];
  return pos.map((p, i) => (
    <span key={i} style={{ position: 'absolute' as const, width: sz, height: sz, ...p }}>{svg}</span>
  ));
};

const PosterFrame: React.FC<{ accent: string; frameStyle: FrameStyle }> = ({ accent, frameStyle }) => {
  if (frameStyle === 'none') return null;

  if (frameStyle === 'simple') {
    return (
      <div className="absolute pointer-events-none" style={{ inset: '16px', border: `2px solid ${accent}`, opacity: 0.7, zIndex: 16 }} />
    );
  }

  if (frameStyle === 'triple') {
    // 三线套框：外细 + 中粗 + 内细，三层递进
    return (
      <>
        <div className="absolute pointer-events-none" style={{ inset: '12px', border: `1px solid ${accent}`, opacity: 0.5, zIndex: 16 }} />
        <div className="absolute pointer-events-none" style={{ inset: '17px', border: `3px solid ${accent}`, opacity: 0.85, zIndex: 17 }} />
        <div className="absolute pointer-events-none" style={{ inset: '24px', border: `1px solid ${accent}`, opacity: 0.6, zIndex: 17 }} />
      </>
    );
  }

  if (frameStyle === 'cloud') {
    // 云纹角花：双线框 + 四角祥云纹
    const cloud = (
      <svg width="34" height="34" viewBox="0 0 34 34" fill="none" stroke={accent} strokeWidth="1.4">
        <path d="M4 16 Q4 8 12 8 Q14 4 20 5 Q26 5 27 11 Q32 11 32 17 Q32 22 26 22 L8 22 Q4 22 4 16 Z" opacity="0.6" />
        <circle cx="6" cy="6" r="2" fill={accent} opacity="0.5" />
      </svg>
    );
    return (
      <>
        <div className="absolute pointer-events-none" style={{ inset: '14px', border: `1px solid ${accent}`, opacity: 0.5, zIndex: 16 }} />
        <div className="absolute pointer-events-none" style={{ inset: '20px', border: `2.5px solid ${accent}`, opacity: 0.85, zIndex: 17 }} />
        <div className="absolute pointer-events-none" style={{ inset: '20px', zIndex: 18 }}>{corner4(cloud, 34)}</div>
      </>
    );
  }

  if (frameStyle === 'floral') {
    // 缠枝角花：双线框 + 四角卷草纹（优雅藤蔓）
    const floral = (
      <svg width="34" height="34" viewBox="0 0 34 34" fill="none" stroke={accent} strokeWidth="1.4">
        <path d="M4 4 Q4 18 16 22 M4 4 Q18 4 22 16 M10 10 Q14 6 18 10 Q22 14 18 18" opacity="0.6" />
        <circle cx="6" cy="6" r="2" fill={accent} opacity="0.5" />
        <circle cx="18" cy="10" r="1.8" fill="none" stroke={accent} strokeWidth="1" opacity="0.5" />
      </svg>
    );
    return (
      <>
        <div className="absolute pointer-events-none" style={{ inset: '14px', border: `1px solid ${accent}`, opacity: 0.5, zIndex: 16 }} />
        <div className="absolute pointer-events-none" style={{ inset: '20px', border: `2.5px solid ${accent}`, opacity: 0.85, zIndex: 17 }} />
        <div className="absolute pointer-events-none" style={{ inset: '20px', zIndex: 18 }}>{corner4(floral, 34)}</div>
      </>
    );
  }

  if (frameStyle === 'corner') {
    // 四角印章：双线框 + 四角实心方块（最大气稳重）
    return (
      <>
        <div className="absolute pointer-events-none" style={{ inset: '14px', border: `1px solid ${accent}`, opacity: 0.55, zIndex: 16 }} />
        <div className="absolute pointer-events-none" style={{ inset: '20px', border: `3px solid ${accent}`, opacity: 0.85, zIndex: 17 }} />
        <div className="absolute pointer-events-none" style={{ inset: '20px', zIndex: 17 }}>
          {corner4(<span style={{ width: 9, height: 9, background: accent, display: 'block' }} />, 9)}
        </div>
      </>
    );
  }

  if (frameStyle === 'meander') {
    // 回纹套框：双线 + 四角回纹方块
    const meander = (
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none" stroke={accent} strokeWidth="1.5">
        <path d="M2 2 L24 2 L24 24 M2 2 L2 24 M8 8 L18 8 L18 18 M8 8 L8 18" />
      </svg>
    );
    return (
      <>
        <div className="absolute pointer-events-none" style={{ inset: '14px', border: `1px solid ${accent}`, opacity: 0.5, zIndex: 16 }} />
        <div className="absolute pointer-events-none" style={{ inset: '18px', border: `2px solid ${accent}`, opacity: 0.8, zIndex: 17 }} />
        <div className="absolute pointer-events-none" style={{ inset: '18px', zIndex: 18 }}>{corner4(meander, 26)}</div>
      </>
    );
  }

  // double（默认）：双线 + 四角实心方块
  return (
    <>
      <div className="absolute pointer-events-none" style={{ inset: '14px', border: `1px solid ${accent}`, opacity: 0.55, zIndex: 16 }} />
      <div className="absolute pointer-events-none" style={{ inset: '20px', border: `3px solid ${accent}`, opacity: 0.85, zIndex: 17 }} />
      <div className="absolute pointer-events-none" style={{ inset: '20px', zIndex: 17 }}>
        {corner4(<span style={{ width: 9, height: 9, background: accent, display: 'block' }} />, 9)}
      </div>
    </>
  );
};

export const PosterCanvas: React.FC<PosterCanvasProps> = ({
  id = 'poster-capture-area',
  content,
  styleConfig,
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
    bullet: bg.bullet,
    ribbon: bg.ribbon,
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
        className={`relative shadow-2xl overflow-hidden flex-shrink-0 transition-[width,height,background-color] duration-200 ease-out ${onClick ? 'cursor-zoom-in hover:shadow-[#b3261e]/20' : ''}`}
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          width: `${logicalW}px`,
          height: `${logicalH}px`,
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          // 柔和径向渐变底色：中心略亮、边缘略深，纸张受光感（不再是死板纯色）
          background: `radial-gradient(ellipse at 50% 35%, ${bg.paper} 0%, ${bg.paper2} 130%)`,
        }}
      >
        {/* 典雅升级：宣纸纤维 + 水墨角晕材质层（强度可调） */}
        <PosterTexture paper={paper} enabled={styleConfig.paperTexture !== false} opacityStrength={styleConfig.bgOpacity ?? 60} />

        {/* 装饰元素（保留可用；新设计默认不启用） */}
        <div className="absolute inset-0 z-[18] pointer-events-none">
          {renderDecorations(styleConfig.decorations || [], styleConfig.theme, paper.accent)}
        </div>

        {/* 典雅升级：装饰边框（多种样式可选） */}
        <PosterFrame accent={paper.accent} frameStyle={(styleConfig.frameStyle as FrameStyle) || 'double'} />

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

        /* 饱满升级：条目化卡片。
           仅当正文容器带 .rich-text-bullets 时生效；
           只把"以编号(b/strong)开头"的 p 渲染成带左竖条+浅底的卡片，
           普通问候/结语 p 保持纯文本。用 :has() 实现，旧浏览器降级为普通段落（安全）。 */
        .rich-text-bullets p:has(b:first-child),
        .rich-text-bullets p:has(strong:first-child) {
            background: var(--bullet-paper2, ${paper.paper2});
            border-left: 4px solid var(--bullet-accent, ${paper.accent});
            padding: 0.5em 0.8em;
            margin: 0 0 0.6em;
            border-radius: 3px;
            text-indent: 0;
        }
        .rich-text-bullets p:has(b:first-child) b,
        .rich-text-bullets p:has(strong:first-child) strong {
            display: inline-block;
            margin-right: 0.4em;
        }
      `}</style>
    </div>
  );
};
