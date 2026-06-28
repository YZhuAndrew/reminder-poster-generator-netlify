// 字体方案：党政公文标准字体（宋体/小标宋/楷体/仿宋/行楷）。
// 优先用系统字体（macOS 的 ST 系列 / Windows 的 SimSun/KaiTi/FangSong），
// 系统缺失时回落 web 字体，保证红头文件般的正式感。
// id 保持向后兼容（旧历史记录的 song/hei 等仍能命中）。

export interface FontOption {
  id: string;
  name: string;
  value: string; // CSS font-family 字符串
}

export const FONT_OPTIONS: FontOption[] = [
  // 1. 宋体（正文/标题通用，公文最常用）
  {
    id: 'song',
    name: '宋体',
    value: '"Songti SC", "SimSun", "Noto Serif SC", "Source Han Serif SC", serif',
  },
  // 2. 方正小标宋（标题专用，公文红头标准字，比宋体更挺拔）
  //    方正小标宋为付费字体，这里优先用华文中宋 STZhongsong（免费最接近替代）
  {
    id: 'biaosong',
    name: '方正小标宋',
    value: '"STZhongsong", "FZXiaoBiaoSong-B05S", "NSimSun", "Songti SC", "Noto Serif SC", serif',
  },
  // 3. 楷体（庄重典雅，落款/引文常用）
  {
    id: 'kaiti',
    name: '楷体',
    value: '"STKaiti", "KaiTi", "Kaiti SC", "Noto Serif SC", serif',
  },
  // 4. 仿宋（公文正文标准，GB/T 9704 规定正文用仿宋）
  {
    id: 'fangsong',
    name: '仿宋',
    value: '"STFangsong", "FangSong", "FangSong_GB2312", "Noto Serif SC", serif',
  },
  // 5. 行楷（书法感，手写行书韵味，web 兜底用 Ma Shan Zheng）
  {
    id: 'xingkai',
    name: '行楷',
    value: '"STXingkai", "Xingkai SC", "Ma Shan Zheng", "STKaiti", cursive',
  },
];

// 标题默认用小标宋体（公文红头标准）。
// 方正小标宋（FZXiaoBiaoSong-B05S）为商用付费字体，无法 web 加载，
// 用华文中宋 STZhongsong（macOS 系统字，视觉最接近方正小标宋的免费替代）作首选，
// Windows 用 SimSun/NSimSun，再回落 Noto Serif SC web 字体。
export const DEFAULT_TITLE_FONT_FAMILY = '"STZhongsong", "FZXiaoBiaoSong-B05S", "NSimSun", "SimSun", "Noto Serif SC", serif';
