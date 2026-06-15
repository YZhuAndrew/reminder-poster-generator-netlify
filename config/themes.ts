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
