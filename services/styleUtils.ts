import { PosterStyle, PosterTheme } from '../types';

/**
 * 统一的 styleConfig 规范化：兼容旧记录 + 回填所有字段默认值。
 *
 * 解决「迁移逻辑和 handleLoadHistory 两处字段列表不同步、加字段必漏」的隐患。
 * 两处共用此函数，保证行为一致。
 *
 * @param raw       localStorage / history item 里的 styleConfig（可能缺字段）
 * @param defaults  当前应用的 DEFAULT_STYLE（提供新字段默认值）
 * @param themes    通用主题列表（用于 theme 解析）
 * @param findThemeById  按 id 查找主题的函数
 */
export function normalizeStyle(
  raw: any,
  defaults: PosterStyle,
  themes: PosterTheme[],
  findThemeById: (id: string | undefined, fallback?: PosterTheme) => PosterTheme,
): PosterStyle {
  if (!raw || typeof raw !== 'object') return { ...defaults };

  // theme 解析：可能是对象（含节日主题）/ 字符串 id / 缺失
  let safeTheme = themes[0];
  if (raw.theme && typeof raw.theme === 'object') {
    const found = themes.find((t) => t.id === raw.theme.id);
    safeTheme = found || raw.theme; // 节日主题不在通用列表里，保留原值
  } else if (typeof raw.theme === 'string') {
    safeTheme = findThemeById(raw.theme);
  }

  return {
    ...defaults,
    ...raw,
    theme: safeTheme,
    textureStyle: raw.textureStyle || 'clouds',
    fontFamily: raw.fontFamily || defaults.fontFamily,
    showSeal: raw.showSeal !== undefined ? raw.showSeal : true,
    // 新设计字段回填
    layout: raw.layout || defaults.layout,
    titleFontFamily: raw.titleFontFamily || defaults.titleFontFamily,
    sealText: raw.sealText || defaults.sealText,
    decorations: Array.isArray(raw.decorations) ? raw.decorations : [],
    holidayId: raw.holidayId,
    accentScheme: raw.accentScheme || defaults.accentScheme,
    backgroundId: raw.backgroundId || defaults.backgroundId,
    kicker: raw.kicker || defaults.kicker,
    issue: raw.issue || defaults.issue,
    paperTexture: raw.paperTexture !== undefined ? raw.paperTexture : defaults.paperTexture,
    frameStyle: raw.frameStyle || defaults.frameStyle,
    bgOpacity: raw.bgOpacity !== undefined ? raw.bgOpacity : defaults.bgOpacity,
  };
}
