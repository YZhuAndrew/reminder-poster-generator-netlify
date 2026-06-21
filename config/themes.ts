import { PosterTheme } from '../types';

// 基础（通用）主题 —— 从 App.tsx 迁移，保持向后兼容的 id
export const THEMES: PosterTheme[] = [
  {
    id: 'red',
    name: '党建红',
    primaryColor: '#DE2910',
    secondaryColor: '#FFFF00',
    backgroundColor: '#FFFBF0',
    accentColor: '#DE2910',
  },
  {
    id: 'blue',
    name: '税务蓝',
    primaryColor: '#0f2b5c',
    secondaryColor: '#FFFFFF',
    backgroundColor: '#F0F7FF',
    accentColor: '#0f2b5c',
  },
  {
    id: 'ink',
    name: '水墨黑',
    primaryColor: '#1a1a1a',
    secondaryColor: '#D4AF37',
    backgroundColor: '#F5F5F5',
    accentColor: '#333333',
  },
  {
    id: 'green',
    name: '生态绿',
    primaryColor: '#125227',
    secondaryColor: '#FFFFFF',
    backgroundColor: '#F2FFF5',
    accentColor: '#125227',
  },
];

// 按 id 查找主题，找不到时回落到第一个（迁移安全用）
export function findThemeById(id: string | undefined, fallback = THEMES[0]): PosterTheme {
  if (!id) return fallback;
  return THEMES.find((t) => t.id === id) || fallback;
}

// =========================================================================
// 重新设计：强调色方案（6 种）—— 替代旧的 4 主题网格
// =========================================================================
export interface AccentScheme {
  id: string;
  name: string;
  hint: string;
  accent: string;   // 强调色（短线、编号、印章、小标题竖条）
  sealFill: string; // 印章填充色
}

export const ACCENT_SCHEMES: AccentScheme[] = [
  { id: 'party',   name: '朱红', hint: '节庆热烈', accent: '#b3261e', sealFill: '#b3261e' },
  { id: 'guofeng', name: '赭石', hint: '雅致沉稳', accent: '#8a5a2b', sealFill: '#9c2a1c' },
  { id: 'clean',   name: '靛蓝', hint: '现代冷静', accent: '#1f5f8b', sealFill: '#1f5f8b' },
  { id: 'pine',    name: '松绿', hint: '清新稳重', accent: '#2d6a4f', sealFill: '#2d6a4f' },
  { id: 'ink',     name: '墨黑', hint: '极简克制', accent: '#3a3530', sealFill: '#3a3530' },
  { id: 'plum',    name: '紫绛', hint: '庄重典雅', accent: '#7a2e4a', sealFill: '#7a2e4a' },
];

export function getAccentScheme(id: string | undefined): AccentScheme {
  if (!id) return ACCENT_SCHEMES[0];
  return ACCENT_SCHEMES.find((s) => s.id === id) || ACCENT_SCHEMES[0];
}

// =========================================================================
// 重新设计：底色（6 种）—— 与强调色独立搭配
// 每项给出纸张主色 paper / 略深分隔色 paper2 / 正文墨色 ink / 次级文字色 inkSoft
// =========================================================================
export interface BackgroundOption {
  id: string;
  name: string;
  paper: string;
  paper2: string;
  ink: string;
  inkSoft: string;
}

export const BACKGROUNDS: BackgroundOption[] = [
  { id: 'paper',  name: '暖纸', paper: '#f0e8d4', paper2: '#e7dcc0', ink: '#1c1814', inkSoft: '#5b5247' },
  { id: 'cream',  name: '米白', paper: '#f7f2e7', paper2: '#efe7d2', ink: '#26211b', inkSoft: '#665c4d' },
  { id: 'white',  name: '纯白', paper: '#ffffff', paper2: '#f2f0ea', ink: '#1b2330', inkSoft: '#5a6577' },
  { id: 'mist',   name: '浅青', paper: '#e8eef0', paper2: '#dbe6e9', ink: '#1f2d33', inkSoft: '#51666e' },
  { id: 'stone',  name: '浅墨', paper: '#ece9e3', paper2: '#dedbd3', ink: '#23211d', inkSoft: '#5d5a52' },
  { id: 'ivory',  name: '象牙', paper: '#f3ead6', paper2: '#e9dcbc', ink: '#211c13', inkSoft: '#5e543c' },
];

export function getBackground(id: string | undefined): BackgroundOption {
  if (!id) return BACKGROUNDS[0];
  return BACKGROUNDS.find((b) => b.id === id) || BACKGROUNDS[0];
}
