import React from 'react';
import { PosterContent, PosterStyle, LayoutId } from '../types';

export const LAYOUT_OPTIONS: { id: LayoutId; name: string; desc: string }[] = [
  { id: 'classic', name: '经典公文', desc: '左对齐巨字标题 · 编号正文' },
  { id: 'banner', name: '横幅庆典', desc: '强调色横幅 · 暖纸正文' },
  { id: 'sidebar', name: '竖排侧栏', desc: '竖排标题 · 暖纸正文' },
  { id: 'minimal', name: '极简留白', desc: '大留白 · 细线条' },
];

// 新设计令牌：由 PosterCanvas 从 accentScheme + backgroundId 解析后传入
export interface PaperTokens {
  paper: string;     // 纸张主色（海报底色）
  paper2: string;    // 略深分隔色
  ink: string;       // 正文墨色
  inkSoft: string;   // 次级文字色
  accent: string;    // 强调色（短线、编号、印章、小标题竖条）
}

interface LayoutRenderProps {
  content: PosterContent;
  styleConfig: PosterStyle;
  themeColors: {
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
    accentColor: string;
  };
  // 新设计令牌（向后兼容：缺失时由 themeColors 推导）
  paper?: PaperTokens;
  sealNode: React.ReactNode;
}

// 安全取令牌：缺省时从 themeColors 推导，保证旧调用路径不崩
function useTokens(props: LayoutRenderProps): PaperTokens {
  const { paper, themeColors } = props;
  if (paper) return paper;
  return {
    paper: themeColors.backgroundColor || '#f0e8d4',
    paper2: themeColors.backgroundColor || '#e7dcc0',
    ink: '#1c1814',
    inkSoft: '#5b5247',
    accent: themeColors.accentColor || '#b3261e',
  };
}

// ---- 共享子组件（重新设计） ----

// 左对齐巨字标题 —— 整张海报的视觉锚点。去渐变、去居中、去阴影。
const TitleBlock: React.FC<{
  text: string;
  size: number;
  color: string;
  fontFamily: string;
  align?: 'left' | 'center';
}> = ({ text, size, color, fontFamily, align = 'left' }) => (
  <h1
    className="font-black"
    style={{
      fontSize: `${size}px`,
      color,
      fontFamily,
      lineHeight: 1.08,
      letterSpacing: '0.04em',
      textAlign: align,
      wordBreak: 'break-word',
      margin: 0,
    }}
  >
    {text}
  </h1>
);

// 报头元信息行：kicker（左）+ issue（右），编辑设计的「报头」
const MetaRow: React.FC<{ kicker?: string; issue?: string; color: string }> = ({ kicker, issue, color }) => {
  if (!kicker && !issue) return null;
  return (
    <div
      className="flex items-baseline justify-between w-full"
      style={{ fontSize: '13px', letterSpacing: '0.28em', color, fontWeight: 600, marginBottom: '22px' }}
    >
      <span>{kicker && <span style={{ color, marginRight: '6px' }}>●</span>}{kicker}</span>
      {issue && <span>{issue}</span>}
    </div>
  );
};

// 强调色短线（左对齐）
const AccentRule: React.FC<{ color: string; width?: number; centered?: boolean }> = ({ color, width = 56, centered }) => (
  <hr
    style={{
      width: `${width}px`,
      height: '4px',
      background: color,
      border: 0,
      margin: centered ? '26px auto 0' : '26px 0 0',
      borderRadius: '2px',
    }}
  />
);

// 正文区：不套卡片，直接在纸面上排布，靠留白与层级而非装饰。
// 不再渲染底部落款行（poster__foot 已按需求移除）。
const PaperBody: React.FC<{
  bodyText: string;
  bodySize: number;
  fontFamily: string;
  ink: string;
  children?: React.ReactNode;
}> = ({ bodyText, bodySize, fontFamily, ink, children }) => (
  <div className="flex-1 w-full relative flex flex-col min-h-0 pt-10">
    <div
      className="flex-1 overflow-hidden text-justify rich-text-content"
      style={{ fontSize: `${bodySize}px`, fontFamily, color: ink, lineHeight: 2.0 }}
      dangerouslySetInnerHTML={{ __html: bodyText }}
    />
    {children}
  </div>
);

// ---- 版式渲染器（全部升级为暖纸编辑风，保留 4 种结构差异） ----

// classic: 编辑标准版（顶部页眉行 → 左对齐巨字标题 → 短线 → 正文 → 印章）
const ClassicLayout: React.FC<LayoutRenderProps> = (props) => {
  const { content, styleConfig, sealNode } = props;
  const t = useTokens(props);
  return (
    <div className="absolute inset-0 z-10 flex flex-col" style={{ padding: '64px 56px 60px' }}>
      <MetaRow kicker={styleConfig.kicker} issue={styleConfig.issue} color={t.inkSoft} />
      <TitleBlock
        text={content.headline}
        size={styleConfig.titleSize}
        color={t.ink}
        fontFamily={styleConfig.titleFontFamily}
      />
      <AccentRule color={t.accent} />
      <PaperBody
        bodyText={content.bodyText}
        bodySize={styleConfig.bodySize}
        fontFamily={styleConfig.fontFamily}
        ink={t.ink}
      >
        {sealNode}
      </PaperBody>
    </div>
  );
};

// banner: 强调色横幅标题区 + 暖纸正文
const BannerLayout: React.FC<LayoutRenderProps> = (props) => {
  const { content, styleConfig, sealNode } = props;
  const t = useTokens(props);
  return (
    <div className="absolute inset-0 z-10 flex flex-col">
      {/* 强调色横幅标题区 */}
      <div
        className="flex-shrink-0 flex flex-col justify-end"
        style={{ background: t.accent, padding: '52px 56px 30px' }}
      >
        <MetaRow kicker={styleConfig.kicker} issue={styleConfig.issue} color="rgba(255,255,255,0.85)" />
        <TitleBlock
          text={content.headline}
          size={Math.round(styleConfig.titleSize * 0.92)}
          color="#ffffff"
          fontFamily={styleConfig.titleFontFamily}
        />
      </div>
      {/* 暖纸正文 */}
      <div className="flex-1 flex flex-col min-h-0" style={{ background: t.paper, padding: '36px 56px 56px' }}>
        <PaperBody
          bodyText={content.bodyText}
          bodySize={styleConfig.bodySize}
          fontFamily={styleConfig.fontFamily}
          ink={t.ink}
          // banner 正文区顶部留白已由 padding 提供
        >
          {/* 覆盖 PaperBody 的 pt-10：banner 已有上间距 */}
          {sealNode}
        </PaperBody>
      </div>
    </div>
  );
};

// sidebar: 左侧强调色窄栏（竖排标题）+ 右侧暖纸正文
const SidebarLayout: React.FC<LayoutRenderProps> = (props) => {
  const { content, styleConfig, sealNode } = props;
  const t = useTokens(props);
  const chars = content.headline.split('');
  const barWidth = Math.max(60, styleConfig.titleSize * 0.95);
  return (
    <div className="absolute inset-0 z-10 flex">
      {/* 左侧强调色竖排标题栏 */}
      <div
        className="flex-shrink-0 flex flex-col items-center justify-center"
        style={{ background: t.accent, width: `${barWidth}px`, padding: '40px 0' }}
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
                color: '#ffffff',
                marginBottom: i < chars.length - 1 ? `${styleConfig.titleSize * 0.18}px` : 0,
              }}
            >
              {ch}
            </span>
          ))}
        </div>
      </div>
      {/* 右侧暖纸正文 */}
      <div className="flex-1 flex flex-col min-h-0" style={{ background: t.paper, padding: '56px 44px 56px' }}>
        <MetaRow kicker={styleConfig.kicker} issue={styleConfig.issue} color={t.inkSoft} />
        <PaperBody
          bodyText={content.bodyText}
          bodySize={styleConfig.bodySize}
          fontFamily={styleConfig.fontFamily}
          ink={t.ink}
        >
          {sealNode}
        </PaperBody>
      </div>
    </div>
  );
};

// minimal: 极简留白（最大留白、居中标题、最细线、最克制）
const MinimalLayout: React.FC<LayoutRenderProps> = (props) => {
  const { content, styleConfig, sealNode } = props;
  const t = useTokens(props);
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center" style={{ padding: '88px 64px 72px' }}>
      <MetaRow kicker={styleConfig.kicker} issue={styleConfig.issue} color={t.inkSoft} />
      <TitleBlock
        text={content.headline}
        size={Math.round(styleConfig.titleSize * 0.92)}
        color={t.ink}
        fontFamily={styleConfig.titleFontFamily}
        align="center"
      />
      <div style={{ width: '1px', height: '40px', background: t.accent, opacity: 0.6, margin: '30px 0 8px' }} />
      <PaperBody
        bodyText={content.bodyText}
        bodySize={styleConfig.bodySize}
        fontFamily={styleConfig.fontFamily}
        ink={t.ink}
      >
        {sealNode}
      </PaperBody>
    </div>
  );
};

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
