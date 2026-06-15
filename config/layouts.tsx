import React from 'react';
import { PosterContent, PosterStyle, LayoutId } from '../types';

export const LAYOUT_OPTIONS: { id: LayoutId; name: string; desc: string }[] = [
  { id: 'classic', name: '经典公文', desc: '顶部标题 + 居中正文卡片' },
  { id: 'banner', name: '横幅庆典', desc: '顶部彩色横幅 + 正文卡片' },
  { id: 'sidebar', name: '竖排侧栏', desc: '左侧竖排标题 + 右侧正文' },
  { id: 'minimal', name: '极简留白', desc: '大留白 + 细线条' },
];

interface LayoutRenderProps {
  content: PosterContent;
  styleConfig: PosterStyle;
  themeColors: {
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
    accentColor: string;
  };
  sealNode: React.ReactNode;
}

// ---- 共享子组件 ----

const TitleBlock: React.FC<{
  text: string;
  size: number;
  color: string;
  fontFamily: string;
  gradient?: [string, string];
}> = ({ text, size, color, fontFamily, gradient }) => (
  <div className="w-full text-center flex items-center justify-center px-4">
    <h1
      className="font-black text-center"
      style={{
        fontSize: `${size}px`,
        color: gradient ? 'transparent' : color,
        backgroundImage: gradient ? `linear-gradient(180deg, ${gradient[0]}, ${gradient[1]})` : undefined,
        WebkitBackgroundClip: gradient ? 'text' : undefined,
        backgroundClip: gradient ? 'text' : undefined,
        textShadow: gradient ? undefined : '2px 2px 4px rgba(0,0,0,0.5), 0 0 10px rgba(0,0,0,0.2)',
        fontFamily,
        lineHeight: 1.2,
        wordBreak: 'break-word',
      }}
    >
      {text}
    </h1>
  </div>
);

const PaperCard: React.FC<{
  backgroundColor: string;
  accentColor: string;
  bodyText: string;
  bodySize: number;
  footer: string | undefined;
  footerSize: number;
  fontFamily: string;
  children?: React.ReactNode;
}> = ({ backgroundColor, accentColor, bodyText, bodySize, footer, footerSize, fontFamily, children }) => (
  <div
    className="flex-1 w-full rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.3)] p-8 relative flex flex-col overflow-hidden transition-colors duration-300"
    style={{ backgroundColor }}
  >
    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
      <div
        className="text-slate-900 leading-relaxed text-justify rich-text-content"
        style={{ fontSize: `${bodySize}px`, fontFamily }}
        dangerouslySetInnerHTML={{ __html: bodyText }}
      />
    </div>
    {footer && (
      <div
        className="mt-4 pt-4 border-t text-center font-bold flex-shrink-0"
        style={{ fontSize: `${footerSize}px`, color: accentColor, borderColor: `${accentColor}33` }}
      >
        {footer}
      </div>
    )}
    {children}
  </div>
);

// ---- 版式渲染器 ----

// classic: 当前默认布局（顶部标题 + 正文卡片）
const ClassicLayout: React.FC<LayoutRenderProps> = ({ content, styleConfig, themeColors, sealNode }) => (
  <div className="absolute inset-0 z-10 flex flex-col items-center p-4 pt-8 pb-8">
    <div className="w-full mb-6 z-20 flex-shrink-0">
      <TitleBlock
        text={content.headline}
        size={styleConfig.titleSize}
        color={themeColors.secondaryColor}
        fontFamily={styleConfig.titleFontFamily}
        gradient={styleConfig.theme.titleGradient}
      />
    </div>
    <PaperCard
      backgroundColor={themeColors.backgroundColor}
      accentColor={themeColors.accentColor}
      bodyText={content.bodyText}
      bodySize={styleConfig.bodySize}
      footer={content.footer}
      footerSize={Math.max(10, Math.round(styleConfig.bodySize * 0.6))}
      fontFamily={styleConfig.fontFamily}
    >
      {sealNode}
    </PaperCard>
  </div>
);

// banner: 顶部彩色横幅（放大标题）+ 正文卡片
const BannerLayout: React.FC<LayoutRenderProps> = ({ content, styleConfig, themeColors, sealNode }) => (
  <div className="absolute inset-0 z-10 flex flex-col">
    {/* 横幅区 */}
    <div
      className="flex-shrink-0 flex items-center justify-center px-6 pt-12 pb-8"
      style={{ background: `linear-gradient(180deg, ${themeColors.primaryColor}, ${themeColors.primaryColor}cc)` }}
    >
      <TitleBlock
        text={content.headline}
        size={Math.round(styleConfig.titleSize * 1.1)}
        color={themeColors.secondaryColor}
        fontFamily={styleConfig.titleFontFamily}
        gradient={styleConfig.theme.titleGradient}
      />
    </div>
    {/* 装饰分隔线 */}
    <div
      className="flex-shrink-0 h-1.5 mx-6 -mt-1 rounded-full"
      style={{ background: `linear-gradient(90deg, transparent, ${themeColors.secondaryColor}, transparent)` }}
    />
    {/* 正文 */}
    <div className="flex-1 flex flex-col items-center p-4 pt-4 pb-8 min-h-0">
      <PaperCard
        backgroundColor={themeColors.backgroundColor}
        accentColor={themeColors.accentColor}
        bodyText={content.bodyText}
        bodySize={styleConfig.bodySize}
        footer={content.footer}
        footerSize={Math.max(10, Math.round(styleConfig.bodySize * 0.6))}
        fontFamily={styleConfig.fontFamily}
      >
        {sealNode}
      </PaperCard>
    </div>
  </div>
);

// sidebar: 左侧竖排标题色条 + 右侧正文
const SidebarLayout: React.FC<LayoutRenderProps> = ({ content, styleConfig, themeColors, sealNode }) => {
  // 竖排标题：每个字一行
  const chars = content.headline.split('');
  return (
    <div className="absolute inset-0 z-10 flex">
      {/* 左侧竖排色条 */}
      <div
        className="flex-shrink-0 flex flex-col items-center justify-center py-8 px-3"
        style={{
          background: `linear-gradient(180deg, ${themeColors.primaryColor}, ${themeColors.primaryColor}dd)`,
          width: `${Math.max(56, styleConfig.titleSize * 0.9)}px`,
        }}
      >
        <div
          className="flex flex-col items-center leading-none"
          style={{ fontFamily: styleConfig.titleFontFamily, fontWeight: 900 }}
        >
          {chars.map((ch, i) => (
            <span
              key={i}
              style={{
                fontSize: `${styleConfig.titleSize}px`,
                color: themeColors.secondaryColor,
                textShadow: '1px 1px 3px rgba(0,0,0,0.4)',
                marginBottom: i < chars.length - 1 ? `${styleConfig.titleSize * 0.15}px` : 0,
              }}
            >
              {ch}
            </span>
          ))}
        </div>
      </div>
      {/* 右侧正文 */}
      <div className="flex-1 flex flex-col items-stretch p-4 min-w-0">
        <PaperCard
          backgroundColor={themeColors.backgroundColor}
          accentColor={themeColors.accentColor}
          bodyText={content.bodyText}
          bodySize={styleConfig.bodySize}
          footer={content.footer}
          footerSize={Math.max(10, Math.round(styleConfig.bodySize * 0.6))}
          fontFamily={styleConfig.fontFamily}
        >
          {sealNode}
        </PaperCard>
      </div>
    </div>
  );
};

// minimal: 极简留白
const MinimalLayout: React.FC<LayoutRenderProps> = ({ content, styleConfig, themeColors, sealNode }) => (
  <div className="absolute inset-0 z-10 flex flex-col items-center p-8 pt-16 pb-16">
    {/* 细线标题区 */}
    <div className="w-full mb-8 z-20 flex-shrink-0 flex flex-col items-center">
      <TitleBlock
        text={content.headline}
        size={Math.round(styleConfig.titleSize * 0.95)}
        color={themeColors.accentColor}
        fontFamily={styleConfig.titleFontFamily}
      />
      <div
        className="h-px w-16 mt-4"
        style={{ background: themeColors.accentColor, opacity: 0.5 }}
      />
    </div>
    <PaperCard
      backgroundColor={themeColors.backgroundColor}
      accentColor={themeColors.accentColor}
      bodyText={content.bodyText}
      bodySize={styleConfig.bodySize}
      footer={content.footer}
      footerSize={Math.max(10, Math.round(styleConfig.bodySize * 0.6))}
      fontFamily={styleConfig.fontFamily}
    >
      {sealNode}
    </PaperCard>
  </div>
);

const LAYOUT_RENDERERS: Record<LayoutId, React.FC<LayoutRenderProps>> = {
  classic: ClassicLayout,
  banner: BannerLayout,
  sidebar: SidebarLayout,
  minimal: MinimalLayout,
};

export function renderLayout(layoutId: LayoutId, props: LayoutRenderProps): React.ReactNode {
  const Renderer = LAYOUT_RENDERERS[layoutId] || ClassicLayout;
  return <Renderer {...props} />;
}
