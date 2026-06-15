import React from 'react';

// 纹理选项 id + 名称（UI 展示用）
export interface TextureOption {
  id: string;
  name: string;
  group: 'general' | 'holiday';
  holidayId?: string; // 归属节日（用于分组高亮）
}

export const TEXTURE_STYLES: TextureOption[] = [
  // 通用纹理
  { id: 'clouds', name: '祥云瑞气', group: 'general' },
  { id: 'mountains', name: '巍巍青山', group: 'general' },
  { id: 'bamboo', name: '高风亮节', group: 'general' },
  { id: 'geometric', name: '现代几何', group: 'general' },
  { id: 'paper', name: '宣纸质感', group: 'general' },
  { id: 'city', name: '城市剪影', group: 'general' },
  // 节日纹理
  { id: 'lantern', name: '灯笼', group: 'holiday', holidayId: 'springFestival' },
  { id: 'fu', name: '福字', group: 'holiday', holidayId: 'springFestival' },
  { id: 'willow', name: '柳枝山水', group: 'holiday', holidayId: 'qingming' },
  { id: 'wheat', name: '麦穗齿轮', group: 'holiday', holidayId: 'labour' },
  { id: 'dragonboat', name: '艾草龙舟', group: 'holiday', holidayId: 'dragonBoat' },
  { id: 'moon', name: '月夜祥云', group: 'holiday', holidayId: 'midAutumn' },
  { id: 'stars', name: '五星华表', group: 'holiday', holidayId: 'nationalDay' },
];

interface TextureRenderProps {
  primaryColor: string;
  secondaryColor: string;
}

/**
 * 渲染背景纹理。
 * 硬约束（来自前几次 iOS Safari 踩坑 commit 74c8a25）：
 *   - 禁止 SVG filter、mix-blend-mode、跨域图片
 *   - 仅用纯 CSS 渐变 + 内联 data-URI SVG
 */
export function renderBackgroundPattern(
  textureStyle: string,
  { primaryColor, secondaryColor }: TextureRenderProps,
): React.ReactNode {
  switch (textureStyle) {
    case 'clouds':
      return (
        <>
          <div
            className="absolute inset-0 opacity-30 pointer-events-none"
            style={{
              backgroundImage: `
                radial-gradient(circle at 20% 20%, ${secondaryColor} 0%, transparent 40%),
                radial-gradient(circle at 80% 80%, ${secondaryColor} 0%, transparent 40%)
              `,
            }}
          />
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 30c0-5.5 4.5-10 10-10s10 4.5 10 10c0 5.5-4.5 10-10 10s-10-4.5-10-10z' fill='white' fill-opacity='0.4'/%3E%3Cpath d='M10 10c0-5.5 4.5-10 10-10s10 4.5 10 10c0 5.5-4.5 10-10 10S10 15.5 10 10z' fill='white' fill-opacity='0.4'/%3E%3C/svg%3E")`,
              backgroundSize: '120px 120px',
            }}
          />
        </>
      );
    case 'mountains':
      return (
        <>
          <div
            className="absolute inset-0 opacity-30 pointer-events-none"
            style={{ background: `linear-gradient(to bottom, transparent 40%, ${primaryColor} 100%)` }}
          />
          <svg
            className="absolute bottom-0 left-0 w-full h-[40%] opacity-20 pointer-events-none"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <path d="M0 100 L30 40 L60 100 Z" fill="white" />
            <path d="M40 100 L70 50 L100 100 Z" fill="white" />
            <path d="M-20 100 L20 70 L60 100 Z" fill="white" opacity="0.7" />
          </svg>
        </>
      );
    case 'bamboo':
      return (
        <>
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: `linear-gradient(90deg, transparent 95%, ${secondaryColor} 96%, ${secondaryColor} 98%, transparent 99%)`,
              backgroundSize: '80px 100%',
            }}
          />
          <svg
            className="absolute bottom-0 right-0 w-[40%] h-[60%] opacity-10 pointer-events-none"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <path d="M80 100 Q 85 50 80 0" stroke="white" strokeWidth="2" fill="none" />
            <path d="M60 100 Q 65 60 60 10" stroke="white" strokeWidth="1.5" fill="none" />
            <path d="M80 80 L90 75 M80 60 L70 55 M60 40 L50 35" stroke="white" strokeWidth="1" fill="none" />
          </svg>
        </>
      );
    case 'geometric':
      return (
        <>
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: `linear-gradient(45deg, ${secondaryColor} 25%, transparent 25%, transparent 75%, ${secondaryColor} 75%, ${secondaryColor}), linear-gradient(45deg, ${secondaryColor} 25%, transparent 25%, transparent 75%, ${secondaryColor} 75%, ${secondaryColor})`,
              backgroundSize: '40px 40px',
              backgroundPosition: '0 0, 20px 20px',
            }}
          />
          <div className="absolute inset-0 opacity-30 bg-gradient-to-br from-transparent via-transparent to-black pointer-events-none" />
        </>
      );
    case 'city':
      return (
        <>
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{ background: `repeating-linear-gradient(0deg, transparent, transparent 19px, ${secondaryColor} 20px)` }}
          />
          <div className="absolute bottom-0 left-0 right-0 h-[20%] opacity-20 pointer-events-none flex items-end justify-between px-4">
            <div className="w-[10%] h-[80%] bg-white" />
            <div className="w-[15%] h-[60%] bg-white" />
            <div className="w-[10%] h-[90%] bg-white" />
            <div className="w-[12%] h-[50%] bg-white" />
            <div className="w-[15%] h-[70%] bg-white" />
            <div className="w-[8%] h-[40%] bg-white" />
            <div className="w-[10%] h-[85%] bg-white" />
          </div>
        </>
      );

    // --- 节日纹理 ---

    case 'lantern': // 春节灯笼
      return (
        <>
          <div
            className="absolute inset-0 opacity-30 pointer-events-none"
            style={{
              backgroundImage: `
                radial-gradient(circle at 15% 25%, ${secondaryColor}55 0%, transparent 25%),
                radial-gradient(circle at 85% 18%, ${secondaryColor}55 0%, transparent 25%),
                linear-gradient(135deg, ${primaryColor}, #7a0a0a)
              `,
            }}
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              opacity: 0.15,
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='140' viewBox='0 0 100 140' xmlns='http://www.w3.org/2000/svg'%3E%3Cellipse cx='50' cy='60' rx='32' ry='26' fill='${encodeURIComponent(secondaryColor)}' opacity='0.5'/%3E%3Crect x='46' y='30' width='8' height='8' fill='${encodeURIComponent(secondaryColor)}'/%3E%3Crect x='46' y='88' width='8' height='6' fill='${encodeURIComponent(secondaryColor)}'/%3E%3Cpath d='M44 96 Q50 110 56 96' stroke='${encodeURIComponent(secondaryColor)}' stroke-width='2' fill='none' opacity='0.6'/%3E%3C/svg%3E")`,
              backgroundSize: '160px 200px',
            }}
          />
        </>
      );
    case 'fu': // 春节福字
      return (
        <>
          <div
            className="absolute inset-0 opacity-40 pointer-events-none"
            style={{ background: `linear-gradient(135deg, ${primaryColor}, #8b0000)` }}
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              opacity: 0.12,
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='20' y='20' width='80' height='80' rx='8' fill='none' stroke='${encodeURIComponent(secondaryColor)}' stroke-width='3' opacity='0.6'/%3E%3Ctext x='60' y='78' text-anchor='middle' font-family='serif' font-size='52' font-weight='900' fill='${encodeURIComponent(secondaryColor)}' opacity='0.45'%3E%E7%A6%8F%3C/text%3E%3C/svg%3E")`,
              backgroundSize: '180px 180px',
            }}
          />
        </>
      );
    case 'willow': // 清明柳枝山水
      return (
        <>
          <div
            className="absolute inset-0 opacity-40 pointer-events-none"
            style={{ background: `linear-gradient(to bottom, ${primaryColor}88 0%, ${secondaryColor}33 100%)` }}
          />
          <svg
            className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <path d="M0 0 Q 25 30 15 60 Q 10 75 5 100" stroke="white" strokeWidth="0.6" fill="none" opacity="0.7" />
            <path d="M12 28 Q 25 26 30 20 M11 40 Q 24 39 30 34 M9 55 Q 22 55 28 50 M7 72 Q 20 73 26 68" stroke="white" strokeWidth="0.4" fill="none" opacity="0.6" />
          </svg>
        </>
      );
    case 'wheat': // 劳动节麦穗齿轮
      return (
        <>
          <div
            className="absolute inset-0 opacity-30 pointer-events-none"
            style={{ background: `linear-gradient(135deg, ${primaryColor}, #8b1a1a)` }}
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              opacity: 0.12,
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='120' viewBox='0 0 80 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M40 110 L40 30' stroke='${encodeURIComponent(secondaryColor)}' stroke-width='1.5' opacity='0.5'/%3E%3Cpath d='M40 40 Q 30 38 28 32 Q 35 34 40 40 Q 45 34 52 32 Q 50 38 40 40' fill='${encodeURIComponent(secondaryColor)}' opacity='0.4'/%3E%3Cpath d='M40 55 Q 28 53 26 47 Q 34 49 40 55 Q 46 49 54 47 Q 52 53 40 55' fill='${encodeURIComponent(secondaryColor)}' opacity='0.4'/%3E%3Cpath d='M40 70 Q 28 68 26 62 Q 34 64 40 70 Q 46 64 54 62 Q 52 68 40 70' fill='${encodeURIComponent(secondaryColor)}' opacity='0.4'/%3E%3C/svg%3E")`,
              backgroundSize: '100px 150px',
            }}
          />
        </>
      );
    case 'dragonboat': // 端午艾草龙舟
      return (
        <>
          <div
            className="absolute inset-0 opacity-35 pointer-events-none"
            style={{ background: `linear-gradient(135deg, ${primaryColor}, #3d4f2a)` }}
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              opacity: 0.12,
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 100 Q 60 95 100 100' stroke='${encodeURIComponent(secondaryColor)}' stroke-width='1.5' fill='none' opacity='0.5'/%3E%3Cpath d='M40 60 L40 95 M40 65 Q 32 60 30 54 M40 75 Q 30 72 28 66 M40 85 Q 32 84 30 78' stroke='${encodeURIComponent(secondaryColor)}' stroke-width='1' fill='none' opacity='0.45'/%3E%3C/svg%3E")`,
              backgroundSize: '140px 140px',
            }}
          />
        </>
      );
    case 'moon': // 中秋月夜祥云
      return (
        <>
          <div
            className="absolute inset-0 opacity-50 pointer-events-none"
            style={{
              background: `
                radial-gradient(circle at 75% 22%, ${secondaryColor}cc 0%, transparent 18%),
                linear-gradient(160deg, ${primaryColor} 0%, #0d1448 100%)
              `,
            }}
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              opacity: 0.15,
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='40' viewBox='0 0 80 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 25 Q 5 25 5 20 Q 5 14 12 14 Q 14 8 22 8 Q 30 8 32 16 Q 40 14 42 22 Q 48 22 48 28 Q 48 33 42 33 L 12 33 Q 8 33 10 25 Z' fill='white' opacity='0.35'/%3E%3C/svg%3E")`,
              backgroundSize: '160px 80px',
            }}
          />
        </>
      );
    case 'stars': // 国庆五星
      return (
        <>
          <div
            className="absolute inset-0 opacity-40 pointer-events-none"
            style={{ background: `linear-gradient(135deg, ${primaryColor}, #a30000)` }}
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              opacity: 0.15,
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50 15 L55 38 L78 38 L60 52 L67 75 L50 60 L33 75 L40 52 L22 38 L45 38 Z' fill='${encodeURIComponent(secondaryColor)}' opacity='0.5'/%3E%3C/svg%3E")`,
              backgroundSize: '160px 160px',
            }}
          />
        </>
      );

    default: // paper / 默认
      return (
        <>
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(${secondaryColor} 1px, transparent 1px)`,
              backgroundSize: '30px 30px',
            }}
          />
        </>
      );
  }
}
