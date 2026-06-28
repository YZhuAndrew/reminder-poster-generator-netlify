import React from 'react';
import { PosterTheme } from '../types';

/**
 * 装饰元素 —— 中式经典纹样（取代早期 emoji + 简陋 SVG）。
 * 全部用精确绘制的 SVG path，参考故宫/国风设计的传统纹样：
 *   祥云、回纹、缠枝、宝相花、海水江崖、如意、铜钱、连珠。
 * 纹样低透明度铺底或点缀，强调"含蓄有设计感"而非"花哨"。
 * 所有装饰 pointer-events-none，遵循项目 iOS Safari 约束（纯 SVG，不用 filter）。
 */

export interface DecorationOption {
  id: string;
  name: string;
  icon: string;
}

export const DECORATION_OPTIONS: DecorationOption[] = [
  // 廉洁主题纹样（莲花/竹/兰/水）
  { id: 'lotus', name: '莲花水印', icon: '❁' },
  { id: 'bamboo', name: '青竹', icon: '🎋' },
  { id: 'orchid', name: '幽兰', icon: '𓆸' },
  { id: 'water', name: '清水', icon: '〰' },
  // 传统吉祥纹样
  { id: 'clouds', name: '祥云纹', icon: '☁' },
  { id: 'floral', name: '缠枝莲', icon: '❀' },
  { id: 'ruyi', name: '如意角', icon: '◈' },
  { id: 'cornerFlower', name: '四角宝相', icon: '✦' },
  { id: 'beads', name: '连珠边', icon: '⋯' },
  { id: 'borderFrame', name: '花纹边框', icon: '◇' },
];

interface DecorationProps {
  theme: PosterTheme;
  accent?: string; // 新版版式传入的强调色，优先于 theme.secondaryColor
}

// 取装饰色：优先 accent（新设计），否则 theme.secondaryColor（旧版式兼容）
const ink = (p: DecorationProps) => p.accent || p.theme?.secondaryColor || '#b3261e';

// 祥云纹：传统卷云造型，四角点缀（节日氛围、吉祥寓意）
const Clouds: React.FC<DecorationProps> = (p) => {
  const c = ink(p);
  const cloud = `url("data:image/svg+xml,%3Csvg width='90' height='50' viewBox='0 0 90 50' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 35 Q5 35 5 28 Q5 20 14 20 Q16 12 26 12 Q34 12 36 20 Q44 18 46 26 Q54 24 56 32 Q58 38 50 38 L14 38 Q10 38 10 35 Z' fill='none' stroke='${encodeURIComponent(c)}' stroke-width='1.5' opacity='0.45'/%3E%3Cpath d='M58 40 Q56 34 62 32 Q64 28 70 30 Q78 28 78 36 L60 40 Z' fill='none' stroke='${encodeURIComponent(c)}' stroke-width='1.2' opacity='0.35'/%3E%3C/svg%3E")`;
  return (
    <>
      <div className="absolute top-6 left-6 w-[90px] h-[50px] pointer-events-none z-20" style={{ backgroundImage: cloud, backgroundSize: 'contain', backgroundRepeat: 'no-repeat' }} />
      <div className="absolute top-6 right-6 w-[90px] h-[50px] pointer-events-none z-20" style={{ backgroundImage: cloud, backgroundSize: 'contain', backgroundRepeat: 'no-repeat', transform: 'scaleX(-1)' }} />
    </>
  );
};

// 莲花水印：廉洁主题核心元素（"出淤泥而不染"），背景隐约可见的大莲花。
// 极低透明度铺底，不干扰文字，营造廉洁氛围。
const Lotus: React.FC<DecorationProps> = (p) => {
  const c = ink(p);
  // 盛开莲花：多层花瓣放射状，中心莲蓬
  const lotus = `url("data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='${encodeURIComponent(c)}' stroke-width='1.5' opacity='0.5'%3E%3Cpath d='M100 100 Q100 50 70 35 Q80 70 100 100'/%3E%3Cpath d='M100 100 Q100 50 130 35 Q120 70 100 100'/%3E%3Cpath d='M100 100 Q70 80 40 85 Q65 100 100 100'/%3E%3Cpath d='M100 100 Q130 80 160 85 Q135 100 100 100'/%3E%3Cpath d='M100 100 Q85 65 100 30 Q115 65 100 100'/%3E%3Cpath d='M100 100 Q60 95 35 110 Q70 115 100 100'/%3E%3Cpath d='M100 100 Q140 95 165 110 Q130 115 100 100'/%3E%3C/g%3E%3Cg fill='none' stroke='${encodeURIComponent(c)}' stroke-width='1' opacity='0.4'%3E%3Ccircle cx='100' cy='100' r='12'/%3E%3Ccircle cx='92' cy='95' r='2'/%3E%3Ccircle cx='108' cy='95' r='2'/%3E%3Ccircle cx='100' cy='88' r='2'/%3E%3Ccircle cx='100' cy='108' r='2'/%3E%3C/g%3E%3C/svg%3E")`;
  return (
    <div
      className="absolute pointer-events-none z-[4]"
      style={{
        right: '-30px', bottom: '-20px', width: '320px', height: '320px',
        backgroundImage: lotus, backgroundSize: 'contain', backgroundRepeat: 'no-repeat',
        opacity: 0.12,
      }}
    />
  );
};

// 青竹：廉洁元素（"虚心有节""高风亮节"），侧边竖向竹枝
const Bamboo: React.FC<DecorationProps> = (p) => {
  const c = ink(p);
  const bamboo = `url("data:image/svg+xml,%3Csvg width='40' height='140' viewBox='0 0 40 140' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='${encodeURIComponent(c)}' stroke-width='2' opacity='0.4'%3E%3Cpath d='M20 10 L20 130'/%3E%3Cpath d='M16 35 Q24 33 24 40 M16 35 Q8 33 8 40'/%3E%3Cpath d='M20 65 Q28 63 28 70 M20 65 Q12 63 12 70'/%3E%3Cpath d='M20 95 Q28 93 28 100 M20 95 Q12 93 12 100'/%3E%3C/g%3E%3Cg fill='none' stroke='${encodeURIComponent(c)}' stroke-width='1.2' opacity='0.35'%3E%3Cpath d='M20 30 Q8 25 4 12 M4 18 L12 16'/%3E%3Cpath d='M20 60 Q32 55 36 42 M36 48 L28 46'/%3E%3Cpath d='M20 90 Q8 85 4 72 M4 78 L12 76'/%3E%3C/g%3E%3C/svg%3E")`;
  return (
    <>
      <div className="absolute left-3 top-1/2 -translate-y-1/2 w-[40px] h-[140px] pointer-events-none z-20" style={{ backgroundImage: bamboo, backgroundSize: 'contain', backgroundRepeat: 'no-repeat' }} />
      <div className="absolute right-3 top-1/2 -translate-y-1/2 w-[40px] h-[140px] pointer-events-none z-20" style={{ backgroundImage: bamboo, backgroundSize: 'contain', backgroundRepeat: 'no-repeat', transform: 'scaleX(-1)' }} />
    </>
  );
};

// 幽兰：廉洁元素（"空谷幽兰""君子之风"），角落兰草
const Orchid: React.FC<DecorationProps> = (p) => {
  const c = ink(p);
  const orchid = `url("data:image/svg+xml,%3Csvg width='80' height='100' viewBox='0 0 80 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='${encodeURIComponent(c)}' stroke-width='1.3' opacity='0.4'%3E%3Cpath d='M40 90 Q30 60 20 20 Q18 12 24 10'/%3E%3Cpath d='M40 90 Q45 55 60 25 Q66 18 60 14'/%3E%3Cpath d='M40 90 Q40 55 40 15'/%3E%3Cpath d='M40 90 Q52 65 70 50'/%3E%3C/g%3E%3Cg fill='none' stroke='${encodeURIComponent(c)}' stroke-width='1' opacity='0.5'%3E%3Cpath d='M22 18 Q14 16 12 22 Q16 26 22 22 Z'/%3E%3Cpath d='M58 22 Q66 18 68 26 Q62 30 58 26 Z'/%3E%3Cpath d='M40 18 Q34 14 32 22 Q38 26 40 22 Z'/%3E%3C/g%3E%3C/svg%3E")`;
  return (
    <>
      <div className="absolute bottom-4 left-4 w-[80px] h-[100px] pointer-events-none z-20" style={{ backgroundImage: orchid, backgroundSize: 'contain', backgroundRepeat: 'no-repeat' }} />
      <div className="absolute bottom-4 right-4 w-[80px] h-[100px] pointer-events-none z-20" style={{ backgroundImage: orchid, backgroundSize: 'contain', backgroundRepeat: 'no-repeat', transform: 'scaleX(-1)' }} />
    </>
  );
};

// 清水：廉洁元素（"一清如水""清正廉明"），底部水波纹
const Water: React.FC<DecorationProps> = (p) => {
  const c = ink(p);
  const wave = `M0 8 Q15 0 30 8 T60 8 T90 8 T120 8 T150 8 T180 8 T210 8 T240 8 T270 8 T300 8`;
  const svg = `url("data:image/svg+xml,%3Csvg width='300' height='16' viewBox='0 0 300 16' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='${wave}' fill='none' stroke='${encodeURIComponent(c)}' stroke-width='1.3' opacity='0.5'/%3E%3Cpath d='M0 14 Q15 6 30 14 T60 14 T90 14 T120 14 T150 14 T180 14 T210 14 T240 14 T270 14 T300 14' fill='none' stroke='${encodeURIComponent(c)}' stroke-width='1' opacity='0.3'/%3E%3C/svg%3E")`;
  return (
    <>
      <div className="absolute left-1/2 -translate-x-1/2 bottom-10 w-[88%] h-4 pointer-events-none z-20" style={{ backgroundImage: svg, backgroundSize: 'auto 16px', backgroundRepeat: 'repeat-x' }} />
    </>
  );
};

// 缠枝莲：植物藤蔓卷曲纹，侧边点缀（雅致、文人气息）
const Floral: React.FC<DecorationProps> = (p) => {
  const c = ink(p);
  const floral = `url("data:image/svg+xml,%3Csvg width='60' height='120' viewBox='0 0 60 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 10 Q20 25 30 40 Q45 50 30 65 Q15 75 30 90 Q40 100 30 115' fill='none' stroke='${encodeURIComponent(c)}' stroke-width='1.3' opacity='0.4'/%3E%3Ccircle cx='22' cy='32' r='4' fill='none' stroke='${encodeURIComponent(c)}' stroke-width='1' opacity='0.35'/%3E%3Ccircle cx='40' cy='58' r='3' fill='none' stroke='${encodeURIComponent(c)}' stroke-width='1' opacity='0.35'/%3E%3Ccircle cx='20' cy='82' r='4' fill='none' stroke='${encodeURIComponent(c)}' stroke-width='1' opacity='0.35'/%3E%3Cpath d='M30 40 Q38 38 42 32 M30 65 Q22 63 18 57 M30 90 Q38 88 42 82' fill='none' stroke='${encodeURIComponent(c)}' stroke-width='0.9' opacity='0.3'/%3E%3C/svg%3E")`;
  return (
    <>
      <div className="absolute left-4 top-1/2 -translate-y-1/2 w-[60px] h-[120px] pointer-events-none z-20" style={{ backgroundImage: floral, backgroundSize: 'contain', backgroundRepeat: 'no-repeat' }} />
      <div className="absolute right-4 top-1/2 -translate-y-1/2 w-[60px] h-[120px] pointer-events-none z-20" style={{ backgroundImage: floral, backgroundSize: 'contain', backgroundRepeat: 'no-repeat', transform: 'scaleX(-1)' }} />
    </>
  );
};

// 如意角：四角如意云头纹（吉祥如意，传统器物常见）
const Ruyi: React.FC<DecorationProps> = (p) => {
  const c = ink(p);
  // 如意头：心形云头
  const ruyi = `url("data:image/svg+xml,%3Csvg width='70' height='70' viewBox='0 0 70 70' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M8 8 Q8 30 30 30 Q52 30 52 8 M8 8 Q22 14 30 30 M52 8 Q38 14 30 30 M20 22 Q26 18 30 22 Q34 18 40 22' fill='none' stroke='${encodeURIComponent(c)}' stroke-width='1.5' opacity='0.5'/%3E%3Ccircle cx='8' cy='8' r='2.5' fill='${encodeURIComponent(c)}' opacity='0.4'/%3E%3C/svg%3E")`;
  const pos = ['top-4 left-4', 'top-4 right-4 scaleX-[-1]', 'bottom-4 left-4 scale-y-[-1]', 'bottom-4 right-4 scale-[-1]'];
  return (
    <>
      {pos.map((cls, i) => (
        <div key={i} className={`absolute ${cls} w-[70px] h-[70px] pointer-events-none z-20`} style={{ backgroundImage: ruyi, backgroundSize: 'contain', backgroundRepeat: 'no-repeat' }} />
      ))}
    </>
  );
};

// 花纹边框：内框 + 四角花（雅致收边，配合 PosterFrame 使用）
const BorderFrame: React.FC<DecorationProps> = (p) => {
  const c = ink(p);
  const corner = `url("data:image/svg+xml,%3Csvg width='50' height='50' viewBox='0 0 50 50' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M5 5 Q25 5 25 18 Q25 5 5 5 M5 5 Q5 25 18 25 Q5 25 5 5 M10 10 Q18 12 20 20' fill='none' stroke='${encodeURIComponent(c)}' stroke-width='1.3' opacity='0.5'/%3E%3Ccircle cx='5' cy='5' r='2' fill='${encodeURIComponent(c)}' opacity='0.5'/%3E%3C/svg%3E")`;
  const pos = ['top-8 left-8', 'top-8 right-8 scaleX-[-1]', 'bottom-8 left-8 scale-y-[-1]', 'bottom-8 right-8 scale-[-1]'];
  return (
    <>
      {pos.map((cls, i) => (
        <div key={i} className={`absolute ${cls} w-[50px] h-[50px] pointer-events-none z-20`} style={{ backgroundImage: corner, backgroundSize: 'contain', backgroundRepeat: 'no-repeat' }} />
      ))}
    </>
  );
};

// 四角宝相花：佛教/传统吉祥花纹，四角对称（华丽典雅）
const CornerFlower: React.FC<DecorationProps> = (p) => {
  const c = ink(p);
  const flower = `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg opacity='0.45'%3E%3Cpath d='M30 30 Q30 12 18 8 M30 30 Q48 30 52 18 M30 30 Q30 48 42 52 M30 30 Q12 30 8 42' fill='none' stroke='${encodeURIComponent(c)}' stroke-width='1.4'/%3E%3Cpath d='M30 30 Q22 22 14 22 M30 30 Q38 22 46 22 M30 30 Q22 38 14 38 M30 30 Q38 38 46 38' fill='none' stroke='${encodeURIComponent(c)}' stroke-width='1'/%3E%3Ccircle cx='30' cy='30' r='4' fill='none' stroke='${encodeURIComponent(c)}' stroke-width='1.2'/%3E%3C/g%3E%3C/svg%3E")`;
  return (
    <>
      <div className="absolute top-10 left-10 w-[60px] h-[60px] pointer-events-none z-20" style={{ backgroundImage: flower, backgroundSize: 'contain', backgroundRepeat: 'no-repeat', opacity: 0.4 }} />
      <div className="absolute bottom-10 right-10 w-[60px] h-[60px] pointer-events-none z-20" style={{ backgroundImage: flower, backgroundSize: 'contain', backgroundRepeat: 'no-repeat', opacity: 0.4 }} />
    </>
  );
};

// 连珠边：顶部一排小圆点（克制、仪式感，藏式/唐卡风）
const Beads: React.FC<DecorationProps> = (p) => {
  const c = ink(p);
  const dots = `url("data:image/svg+xml,%3Csvg width='12' height='4' viewBox='0 0 12 4' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='1.5' fill='${encodeURIComponent(c)}' opacity='0.5'/%3E%3C/svg%3E")`;
  return (
    <>
      <div className="absolute left-1/2 -translate-x-1/2 top-11 w-[70%] h-1 pointer-events-none z-20" style={{ backgroundImage: dots, backgroundSize: '12px 4px', backgroundRepeat: 'repeat-x' }} />
      <div className="absolute left-1/2 -translate-x-1/2 bottom-11 w-[70%] h-1 pointer-events-none z-20" style={{ backgroundImage: dots, backgroundSize: '12px 4px', backgroundRepeat: 'repeat-x' }} />
    </>
  );
};

const DECORATION_RENDERERS: Record<string, React.FC<DecorationProps>> = {
  lotus: Lotus,
  bamboo: Bamboo,
  orchid: Orchid,
  water: Water,
  clouds: Clouds,
  floral: Floral,
  ruyi: Ruyi,
  borderFrame: BorderFrame,
  cornerFlower: CornerFlower,
  beads: Beads,
};

/** 渲染所有启用的装饰元素 */
export function renderDecorations(ids: string[], theme: PosterTheme, accent?: string): React.ReactNode {
  return ids.map((id) => {
    const Renderer = DECORATION_RENDERERS[id];
    if (!Renderer) return null;
    return <Renderer key={id} theme={theme} accent={accent} />;
  });
}
