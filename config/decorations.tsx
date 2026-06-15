import React from 'react';
import { PosterTheme } from '../types';

export interface DecorationOption {
  id: string;
  name: string;
  icon: string; // emoji 用于 UI
}

// 可开关的装饰元素清单
export const DECORATION_OPTIONS: DecorationOption[] = [
  { id: 'cornerFlower', name: '四角花纹', icon: '❖' },
  { id: 'ribbon', name: '飘带', icon: '🎀' },
  { id: 'lantern', name: '灯笼', icon: '🏮' },
  { id: 'starBadge', name: '五星徽标', icon: '⭐' },
  { id: 'moonOrnament', name: '月亮', icon: '🌕' },
  { id: 'borderFrame', name: '花纹边框', icon: '🖼️' },
];

interface DecorationProps {
  theme: PosterTheme;
}

// 四角花纹 —— 用 data-URI SVG，绝对定位四角，pointer-events-none
const CornerFlower: React.FC<DecorationProps> = ({ theme }) => {
  const cornerSvg = `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M5 5 Q 30 5 30 30 Q 30 5 5 5 Z M5 5 Q 5 30 30 30 Q 5 30 5 5 Z M15 15 Q 20 20 25 15' fill='none' stroke='${encodeURIComponent(theme.secondaryColor)}' stroke-width='2' opacity='0.5'/%3E%3Ccircle cx='8' cy='8' r='3' fill='${encodeURIComponent(theme.secondaryColor)}' opacity='0.4'/%3E%3C/svg%3E")`;
  const positions = ['top-3 left-3', 'top-3 right-3 scale-x-[-1]', 'bottom-3 left-3 scale-y-[-1]', 'bottom-3 right-3 scale-[-1]'];
  return (
    <>
      {positions.map((pos, i) => (
        <div
          key={i}
          className={`absolute ${pos} w-16 h-16 pointer-events-none z-20`}
          style={{ backgroundImage: cornerSvg, backgroundSize: '80px 80px' }}
        />
      ))}
    </>
  );
};

// 飘带 —— 标题下方的彩带（banner 版式下尤其好看）
const Ribbon: React.FC<DecorationProps> = ({ theme }) => (
  <div className="absolute top-[16%] left-1/2 -translate-x-1/2 z-20 pointer-events-none flex flex-col items-center">
    <div
      className="h-2 w-48 rounded-full"
      style={{ background: `linear-gradient(90deg, transparent, ${theme.secondaryColor}, transparent)` }}
    />
  </div>
);

// 灯笼 —— 左右上角悬挂
const Lantern: React.FC<DecorationProps> = ({ theme }) => {
  const lanternSvg = `url("data:image/svg+xml,%3Csvg width='50' height='70' viewBox='0 0 50 70' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='22' y='4' width='6' height='6' fill='${encodeURIComponent(theme.secondaryColor)}'/%3E%3Cellipse cx='25' cy='30' rx='18' ry='15' fill='${encodeURIComponent(theme.secondaryColor)}' opacity='0.85'/%3E%3Crect x='22' y='46' width='6' height='4' fill='${encodeURIComponent(theme.secondaryColor)}'/%3E%3Cpath d='M22 50 Q25 64 28 50' stroke='${encodeURIComponent(theme.secondaryColor)}' stroke-width='1.5' fill='none' opacity='0.7'/%3E%3Cpath d='M22 52 L20 60 M25 53 L25 63 M28 52 L30 60' stroke='${encodeURIComponent(theme.secondaryColor)}' stroke-width='1' opacity='0.6'/%3E%3C/svg%3E")`;
  return (
    <>
      <div
        className="absolute top-2 left-2 w-12 h-16 pointer-events-none z-20"
        style={{ backgroundImage: lanternSvg, backgroundSize: '50px 70px' }}
      />
      <div
        className="absolute top-2 right-2 w-12 h-16 pointer-events-none z-20"
        style={{ backgroundImage: lanternSvg, backgroundSize: '50px 70px' }}
      />
    </>
  );
};

// 五星徽标 —— 国庆主题
const StarBadge: React.FC<DecorationProps> = ({ theme }) => (
  <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
    <svg width="60" height="40" viewBox="0 0 60 40">
      <path
        d="M8 18 L11 28 L2 22 L14 22 L5 28 Z"
        fill={theme.secondaryColor}
        opacity="0.9"
      />
    </svg>
  </div>
);

// 月亮装饰 —— 中秋主题
const MoonOrnament: React.FC<DecorationProps> = ({ theme }) => (
  <div className="absolute top-8 right-8 z-20 pointer-events-none">
    <div
      className="w-20 h-20 rounded-full"
      style={{
        background: `radial-gradient(circle at 35% 35%, ${theme.secondaryColor}, ${theme.secondaryColor}cc)`,
        boxShadow: `0 0 30px ${theme.secondaryColor}66`,
      }}
    />
  </div>
);

// 花纹边框 —— 正文卡片的装饰边框
const BorderFrame: React.FC<DecorationProps> = ({ theme }) => {
  const borderSvg = `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M5 5 Q 20 5 20 20 Q 20 5 5 5' fill='none' stroke='${encodeURIComponent(theme.accentColor)}' stroke-width='1.5' opacity='0.4'/%3E%3C/svg%3E")`;
  return (
    <>
      <div className="absolute inset-3 border-2 rounded-lg pointer-events-none" style={{ zIndex: 15, borderColor: `${theme.accentColor}55` }} />
      <div
        className="absolute top-3 left-3 w-8 h-8 pointer-events-none"
        style={{ zIndex: 15, backgroundImage: borderSvg, backgroundSize: '40px 40px' }}
      />
      <div
        className="absolute top-3 right-3 w-8 h-8 pointer-events-none scale-x-[-1]"
        style={{ zIndex: 15, backgroundImage: borderSvg, backgroundSize: '40px 40px' }}
      />
    </>
  );
};

const DECORATION_RENDERERS: Record<string, React.FC<DecorationProps>> = {
  cornerFlower: CornerFlower,
  ribbon: Ribbon,
  lantern: Lantern,
  starBadge: StarBadge,
  moonOrnament: MoonOrnament,
  borderFrame: BorderFrame,
};

/** 渲染所有启用的装饰元素 */
export function renderDecorations(ids: string[], theme: PosterTheme): React.ReactNode {
  return ids.map((id) => {
    const Renderer = DECORATION_RENDERERS[id];
    if (!Renderer) return null;
    return <Renderer key={id} theme={theme} />;
  });
}
