export interface FontOption {
  id: string;
  name: string;
  value: string;
}

// 字体选项（从 App.tsx 迁移）
// 注意：FZXiaoBiaoSong 未通过 web 加载，仅在系统已安装时生效，否则回落到 Songti SC / serif。
export const FONT_OPTIONS: FontOption[] = [
  { id: 'xbs', name: '小标宋', value: '"FZXiaoBiaoSong-B05S", "方正小标宋简体", "FZXiaoBiaoSong", "Songti SC", serif' },
  { id: 'song', name: '标准宋体', value: '"Noto Serif SC", "SimSun", "Songti SC", serif' },
  { id: 'hei', name: '现代黑体', value: '"Noto Sans SC", "SimHei", "Heiti SC", sans-serif' },
  { id: 'kai', name: '传统楷体', value: '"KaiTi", "STKaiti", "Ma Shan Zheng", serif' },
  { id: 'fang', name: '公文仿宋', value: '"FangSong", "STFangsong", serif' },
  { id: 'calligraphy', name: '书法行书', value: '"Zhi Mang Xing", "Ma Shan Zheng", cursive' },
];

// 默认标题字体（解决 PosterCanvas 中标题原先硬编码 Noto Serif SC 的问题）
export const DEFAULT_TITLE_FONT_FAMILY = '"Noto Serif SC", "SimSun", "Songti SC", serif';
