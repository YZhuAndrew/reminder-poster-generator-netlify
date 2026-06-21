
export interface PosterContent {
  headline: string;
  // subheadline removed - merged into bodyText via Rich Text
  bodyText: string; 
  footer: string;
  imagePrompt: string;
  suggestedColor: string;
}

export interface PosterState {
  content: PosterContent | null;
  imageUrl: string | null;
  isGeneratingText: boolean;
  isGeneratingImage: boolean;
  error: string | null;
}

export interface PosterTheme {
  id: string;
  name: string;
  primaryColor: string;    // Main outer background/border
  secondaryColor: string;  // Title text color
  backgroundColor: string; // Paper/Content background
  accentColor: string;     // Footer text, decorations
  // --- New: holiday metadata (optional, for auto-apply grouping) ---
  holidayId?: string;            // e.g. 'springFestival'
  titleGradient?: [string, string]; // optional 2-stop gradient for titles
}

export type LayoutId = 'classic' | 'banner' | 'sidebar' | 'minimal';

export interface PosterStyle {
  titleSize: number;
  bodySize: number;
  overlayOpacity: number;
  textColor: string;
  alignment: 'top' | 'center' | 'bottom';
  fontFamily: string; // Changed from 'sans' | 'serif' to string to support specific fonts
  widthScale: number;
  heightScale: number;
  theme: PosterTheme;
  textureStyle: string;
  showSeal: boolean; // Controls visibility of the seal/logo
  // --- New style fields (all have safe defaults in config/migration) ---
  layout: LayoutId;             // 版式模板
  titleFontFamily: string;      // 标题字体（解决原先硬编码 Noto Serif SC）
  sealText: string;             // 印章文字（解决原先硬编码"横税纪检"）
  decorations: string[];        // 开启的装饰元素 id 列表
  holidayId?: string;           // 当前套用的节日（可选）
  // —— 重新设计新增字段（全部可选，旧记录回填默认值）——
  accentScheme?: string;        // 强调色方案 id（朱红/赭石/靛蓝/松绿/墨黑/紫绛）
  backgroundId?: string;        // 底色 id（暖纸/米白/纯白/浅青/浅墨/象牙）
  kicker?: string;              // 页眉左标签（纯中文）
  issue?: string;               // 页眉右期号
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  title: string; // Original input title
  body: string;  // Original input body
  content: PosterContent;
  imageUrl: string | null;
  styleConfig: PosterStyle;
}

export enum Step {
  INPUT = 'INPUT',
  PREVIEW = 'PREVIEW',
}

// --- New: Holiday system types ---

export interface HolidayDateInfo {
  type: 'solar' | 'lunar';
  /** 公历月/日（type=solar 时生效，1-12 / 1-31） */
  month: number;
  day: number;
  /** 农历节日 key（type=lunar 时生效，对应农历查表 key） */
  lunarKey?: string;
}

export interface HolidayTemplate {
  title: string;
  body: string;
}

export interface HolidayConfig {
  id: string;
  name: string;              // '春节'
  emoji: string;             // UI 标识 emoji
  dateInfo: HolidayDateInfo;
  theme: PosterTheme;
  textures: string[];        // 推荐纹理 id
  decorations: string[];     // 默认装饰组合
  sealText: string;          // 默认印章文字
  layout: LayoutId;          // 推荐版式
  templates: HolidayTemplate[]; // 文案模板
  /** 该节日即将到来时的提示文案 */
  bannerHint?: string;
}
