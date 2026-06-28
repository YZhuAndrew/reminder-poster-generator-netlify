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
  bullet?: string;       // 正文条目卡片底色
  ribbon?: [string, string]; // 标题飘带渐变
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
// 典雅升级：字距略放开（0.06em），balance 换行避免孤字。
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
      lineHeight: 1.1,
      letterSpacing: '0.06em',
      textAlign: align,
      wordBreak: 'break-word',
      // @ts-ignore CSS text-wrap balance 仅现代浏览器支持，旧浏览器忽略
      textWrap: 'balance',
      margin: 0,
    }}
  >
    {text}
  </h1>
);

// 报头元信息行：kicker（左）+ issue（右），编辑设计的「报头」
// 典雅升级：kicker 前的圆点改为「朱红小方块」，期号用 tabular-nums 等宽对齐。
const MetaRow: React.FC<{ kicker?: string; issue?: string; color: string; accent: string }> = ({ kicker, issue, color, accent }) => {
  if (!kicker && !issue) return null;
  return (
    <div
      className="flex items-baseline justify-between w-full"
      style={{ fontSize: '13px', letterSpacing: '0.28em', color, fontWeight: 600, marginBottom: '22px' }}
    >
      <span className="flex items-center" style={{ gap: '8px' }}>
        {kicker && <span style={{ display: 'inline-block', width: '7px', height: '7px', background: accent, marginRight: '2px' }} />}
        {kicker}
      </span>
      {issue && <span style={{ fontVariantNumeric: 'tabular-nums' }}>{issue}</span>}
    </div>
  );
};

// 现代中式标题分隔：双线夹中央菱形（如意纹简化）。
// 取代俗气的红色飘带。用对称细线 + 中心几何形，杂志/画册级排版感。
const TitleDivider: React.FC<{ accent: string; width?: number }> = ({ accent, width = 1.5 }) => (
  <div className="flex items-center justify-center" style={{ gap: '10px', marginTop: '22px', marginBottom: '14px' }}>
    <span style={{ height: `${width}px`, width: '72px', background: accent, opacity: 0.85 }} />
    <span
      style={{
        width: '10px', height: '10px', background: accent, transform: 'rotate(45deg)',
        boxShadow: `0 0 0 3px ${accent}22`,
      }}
    />
    <span style={{ height: `${width}px`, width: '72px', background: accent, opacity: 0.85 }} />
  </div>
);

// 顶部页眉：极简印章式圆点 + 极细金线 + 留白（取代五角星徽标）。
// 杂志报头气质：一行细线两端各一个小方块，居中留 kicker 文字位。
const TopMasthead: React.FC<{ kicker?: string; issue?: string; accent: string; inkSoft: string }> = ({ kicker, issue, accent, inkSoft }) => (
  <div className="flex items-center justify-between" style={{ marginBottom: '24px' }}>
    <span className="flex items-center" style={{ gap: '8px' }}>
      <span style={{ width: '6px', height: '6px', background: accent, transform: 'rotate(45deg)' }} />
      <span style={{ fontSize: '12px', letterSpacing: '0.3em', color: inkSoft, fontWeight: 600 }}>{kicker}</span>
    </span>
    {issue && (
      <span style={{ fontSize: '11px', letterSpacing: '0.2em', color: inkSoft, fontVariantNumeric: 'tabular-nums' }}>{issue}</span>
    )}
  </div>
);

// 底部装饰：城市天际线剪影（精简优雅版，低透明度做收尾）
const BottomSkyline: React.FC<{ accent: string }> = ({ accent }) => (
  <div style={{ marginTop: '8px', opacity: 0.35 }}>
    <svg width="100%" height="22" viewBox="0 0 200 22" preserveAspectRatio="none" fill={accent}>
      <path d="M0 22 L0 16 L10 16 L10 11 L20 11 L20 15 L32 15 L32 8 L40 8 L40 14 L52 14 L52 18 L62 18 L62 12 L74 12 L74 16 L84 16 L84 6 L92 6 L92 14 L104 14 L104 18 L114 18 L114 10 L126 10 L126 15 L138 15 L138 7 L146 7 L146 14 L158 14 L158 18 L168 18 L168 11 L180 11 L180 16 L190 16 L190 9 L200 9 L200 22 Z" />
    </svg>
  </div>
);


// 正文区：不套卡片，直接在纸面上排布，靠留白与层级而非装饰。
// 典雅升级：行高 2.0 → 1.95，更紧凑的印刷感。
// 饱满升级：当传入 accent/paper2 时，正文容器挂上 .rich-text-rich 标记，
// PosterCanvas 的 CSS 会把带编号的条目渲染成浅底卡片（见 rich-text CSS）。
// 不再渲染底部落款行（poster__foot 已按需求移除）。
const PaperBody: React.FC<{
  bodyText: string;
  bodySize: number;
  fontFamily: string;
  ink: string;
  accent?: string;
  paper2?: string;
  children?: React.ReactNode;
}> = ({ bodyText, bodySize, fontFamily, ink, accent, paper2, children }) => (
  <div
    className={`flex-1 w-full relative flex flex-col min-h-0 pt-6 rich-text-content ${accent ? 'rich-text-bullets' : ''}`}
    style={{
      fontSize: `${bodySize}px`, fontFamily, color: ink, lineHeight: 1.95,
      // CSS 变量透传给条目卡片样式
      ['--bullet-accent' as any]: accent,
      ['--bullet-paper2' as any]: paper2,
    }}
  >
    <div
      className="flex-1 overflow-hidden text-justify"
      dangerouslySetInnerHTML={{ __html: bodyText }}
    />
    {children}
  </div>
);

// ---- 版式渲染器（全部升级为暖纸编辑风，保留 4 种结构差异） ----

// classic: 党建饱满版（报头 → 醒目标题 → 现代中式分隔 → 条目化正文 → 天际线 → 印章）
const ClassicLayout: React.FC<LayoutRenderProps> = (props) => {
  const { content, styleConfig, sealNode } = props;
  const t = useTokens(props);
  return (
    <div className="absolute inset-0 z-10 flex flex-col" style={{ padding: '52px 48px 44px' }}>
      {/* 报头：极简页眉（取代五角星徽标） */}
      <TopMasthead kicker={styleConfig.kicker} issue={styleConfig.issue} accent={t.accent} inkSoft={t.inkSoft} />

      {/* 醒目标题：强调色巨字，居中 */}
      <TitleBlock
        text={content.headline}
        size={styleConfig.titleSize}
        color={t.accent}
        fontFamily={styleConfig.titleFontFamily}
        align="center"
      />

      {/* 现代中式分隔（取代红色飘带） */}
      <TitleDivider accent={t.accent} />

      <PaperBody
        bodyText={content.bodyText}
        bodySize={styleConfig.bodySize}
        fontFamily={styleConfig.fontFamily}
        ink={t.ink}
        accent={t.accent}
        paper2={t.bullet || t.paper2}
      >
        {sealNode}
      </PaperBody>

      {/* 底部装饰：城市天际线 */}
      <BottomSkyline accent={t.accent} />
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
        <MetaRow kicker={styleConfig.kicker} issue={styleConfig.issue} color="rgba(255,255,255,0.85)" accent="rgba(255,255,255,0.9)" />
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
        <MetaRow kicker={styleConfig.kicker} issue={styleConfig.issue} color={t.inkSoft} accent={t.accent} />
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
      <MetaRow kicker={styleConfig.kicker} issue={styleConfig.issue} color={t.inkSoft} accent={t.accent} />
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
