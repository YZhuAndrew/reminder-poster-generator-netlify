// 字体方案：精简为 4 款，全部使用 Google Fonts 可真实加载的中文字体。
// 解决旧版「小标宋/楷体/仿宋」在 web 端加载不到、统一回落系统字体的问题。
// 保留 FontOption 接口与 id 结构，兼容历史记录。

export interface FontOption {
  id: string;
  name: string;
  value: string; // CSS font-family 字符串
}

export const FONT_OPTIONS: FontOption[] = [
  { id: 'song',    name: '宋体巨字', value: '"Noto Serif SC", "Songti SC", "SimSun", serif' },
  { id: 'xiaowei', name: '小薇刊头', value: '"ZCOOL XiaoWei", "Noto Serif SC", "Songti SC", serif' },
  { id: 'hei',     name: '思源黑体', value: '"Noto Sans SC", "PingFang SC", "Heiti SC", sans-serif' },
  { id: 'qingke',  name: '青铜黄油', value: '"ZCOOL QingKe HuangYou", "Noto Sans SC", sans-serif' },
];

export const DEFAULT_TITLE_FONT_FAMILY = '"Noto Serif SC", "SimSun", "Songti SC", serif';
