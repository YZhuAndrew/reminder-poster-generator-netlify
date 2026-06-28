import { HolidayConfig } from '../types';
import { HOLIDAY_TEMPLATES } from './templates';

/**
 * 农历节日公历日期查找表（2024-2030）。
 * 避免引入完整农历库，直接内置未来 7 年的春节/端午/中秋公历日期。
 * 数据来源：国务院公布的节假日安排 / 万年历。
 */
const LUNAR_HOLIDAY_DATES: Record<string, Record<number, [number, number]>> = {
  springFestival: {
    2024: [2, 10], 2025: [1, 29], 2026: [2, 17], 2027: [2, 6],
    2028: [1, 26], 2029: [2, 13], 2030: [2, 3],
  },
  dragonBoat: {
    2024: [6, 10], 2025: [5, 31], 2026: [6, 19], 2027: [6, 9],
    2028: [5, 28], 2029: [6, 16], 2030: [6, 5],
  },
  midAutumn: {
    2024: [9, 17], 2025: [10, 6], 2026: [9, 25], 2027: [9, 15],
    2028: [10, 3], 2029: [9, 22], 2030: [9, 12],
  },
};

/** 给定年份返回农历节日的公历 [月, 日]，找不到返回 null（超出表范围） */
export function getLunarHolidayDate(lunarKey: string, year: number): [number, number] | null {
  return LUNAR_HOLIDAY_DATES[lunarKey]?.[year] || null;
}

// 7 大法定节日配置
export const HOLIDAYS: HolidayConfig[] = [
  {
    id: 'newYear',
    name: '元旦',
    emoji: '🎉',
    dateInfo: { type: 'solar', month: 1, day: 1 },
    theme: {
      id: 'newYear',
      name: '新年红金',
      primaryColor: '#C8102E',
      secondaryColor: '#F4D03F',
      backgroundColor: '#FFF9F0',
      accentColor: '#C8102E',
      holidayId: 'newYear',
      titleGradient: ['#F4D03F', '#FFB300'],
    },
    textures: ['lantern', 'clouds'],
    decorations: ['cornerFlower'],
    sealText: '廉洁过节',
    layout: 'banner',
    templates: HOLIDAY_TEMPLATES.newYear,
    bannerHint: '元旦将至，廉洁开年',
    accentSchemeId: 'party',
    backgroundId: 'cream',
  },
  {
    id: 'springFestival',
    name: '春节',
    emoji: '🧨',
    dateInfo: { type: 'lunar', month: 1, day: 1, lunarKey: 'springFestival' },
    theme: {
      id: 'springFestival',
      name: '大红金黄',
      primaryColor: '#E60012',
      secondaryColor: '#FFD700',
      backgroundColor: '#FFF8E7',
      accentColor: '#E60012',
      holidayId: 'springFestival',
      titleGradient: ['#FFD700', '#FFA500'],
    },
    textures: ['fu', 'lantern'],
    decorations: ['lantern', 'cornerFlower'],
    sealText: '节日纪律',
    layout: 'banner',
    templates: HOLIDAY_TEMPLATES.springFestival,
    bannerHint: '年关廉关，风清气正',
    accentSchemeId: 'party',
    backgroundId: 'paper',
  },
  {
    id: 'qingming',
    name: '清明',
    emoji: '🌿',
    dateInfo: { type: 'solar', month: 4, day: 5 },
    theme: {
      id: 'qingming',
      name: '青灰水墨',
      primaryColor: '#4A5859',
      secondaryColor: '#A8B5A2',
      backgroundColor: '#F5F7F2',
      accentColor: '#4A5859',
      holidayId: 'qingming',
    },
    textures: ['willow', 'mountains'],
    decorations: [],
    sealText: '文明祭扫',
    layout: 'minimal',
    templates: HOLIDAY_TEMPLATES.qingming,
    bannerHint: '清明将至，文明祭扫',
    accentSchemeId: 'pine',
    backgroundId: 'mist',
  },
  {
    id: 'labour',
    name: '劳动节',
    emoji: '🔨',
    dateInfo: { type: 'solar', month: 5, day: 1 },
    theme: {
      id: 'labour',
      name: '国际红',
      primaryColor: '#D32F2F',
      secondaryColor: '#FFC107',
      backgroundColor: '#FFFDF5',
      accentColor: '#D32F2F',
      holidayId: 'labour',
      titleGradient: ['#FFC107', '#FF8F00'],
    },
    textures: ['wheat', 'clouds'],
    decorations: ['ribbon'],
    sealText: '致敬劳动',
    layout: 'classic',
    templates: HOLIDAY_TEMPLATES.labour,
    bannerHint: '劳动光荣，清廉过节',
    accentSchemeId: 'guofeng',
    backgroundId: 'cream',
  },
  {
    id: 'dragonBoat',
    name: '端午',
    emoji: '🐉',
    dateInfo: { type: 'lunar', month: 5, day: 5, lunarKey: 'dragonBoat' },
    theme: {
      id: 'dragonBoat',
      name: '艾绿土黄',
      primaryColor: '#5D7C3F',
      secondaryColor: '#C99B5E',
      backgroundColor: '#F7F5EE',
      accentColor: '#5D7C3F',
      holidayId: 'dragonBoat',
    },
    textures: ['dragonboat', 'bamboo'],
    decorations: ['cornerFlower'],
    sealText: '端午安康',
    layout: 'classic',
    templates: HOLIDAY_TEMPLATES.dragonBoat,
    bannerHint: '端午安康，廉洁相伴',
    accentSchemeId: 'pine',
    backgroundId: 'ivory',
  },
  {
    id: 'midAutumn',
    name: '中秋',
    emoji: '🌕',
    dateInfo: { type: 'lunar', month: 8, day: 15, lunarKey: 'midAutumn' },
    theme: {
      id: 'midAutumn',
      name: '夜蓝月金',
      primaryColor: '#1A237E',
      secondaryColor: '#FFD54F',
      backgroundColor: '#FBF8EC',
      accentColor: '#1A237E',
      holidayId: 'midAutumn',
      titleGradient: ['#FFD54F', '#FFB300'],
    },
    textures: ['moon', 'clouds'],
    decorations: ['moonOrnament'],
    sealText: '廉洁中秋',
    layout: 'banner',
    templates: HOLIDAY_TEMPLATES.midAutumn,
    bannerHint: '月圆人圆，廉洁中秋',
    accentSchemeId: 'plum',
    backgroundId: 'ivory',
  },
  {
    id: 'nationalDay',
    name: '国庆',
    emoji: '🇨🇳',
    dateInfo: { type: 'solar', month: 10, day: 1 },
    theme: {
      id: 'nationalDay',
      name: '中国红金',
      primaryColor: '#DE2910',
      secondaryColor: '#FFDE00',
      backgroundColor: '#FFFBF0',
      accentColor: '#DE2910',
      holidayId: 'nationalDay',
      titleGradient: ['#FFDE00', '#FFA500'],
    },
    textures: ['stars', 'clouds'],
    decorations: ['starBadge', 'ribbon'],
    sealText: '国庆献礼',
    layout: 'banner',
    templates: HOLIDAY_TEMPLATES.nationalDay,
    bannerHint: '喜迎国庆，廉洁同行',
    accentSchemeId: 'party',
    backgroundId: 'paper',
  },
];

/** 按 id 查找节日 */
export function findHoliday(id: string | undefined): HolidayConfig | null {
  if (!id) return null;
  return HOLIDAYS.find((h) => h.id === id) || null;
}

/** 取某节日在指定年份的公历日期 [月, 日]，找不到返回 null */
export function getHolidayDate(holiday: HolidayConfig, year: number): [number, number] | null {
  if (holiday.dateInfo.type === 'solar') {
    return [holiday.dateInfo.month, holiday.dateInfo.day];
  }
  return getLunarHolidayDate(holiday.dateInfo.lunarKey!, year);
}

export interface UpcomingHoliday {
  holiday: HolidayConfig;
  /** 距今天的天数（负数=已过去几天，正数=还有几天，0=今天） */
  daysUntil: number;
  /** 该节日最近的公历日期 */
  date: Date;
}

/**
 * 找出距 today 最近（前后 N 天窗口内）的节日。
 * 跨年检查：同时检查去年、今年、明年的日期。
 */
export function getUpcomingHoliday(
  today: Date = new Date(),
  windowDays = 30,
): UpcomingHoliday | null {
  const candidates: UpcomingHoliday[] = [];

  for (const holiday of HOLIDAYS) {
    // 检查去年、今年、明年的日期
    for (const yearOffset of [-1, 0, 1]) {
      const year = today.getFullYear() + yearOffset;
      const md = getHolidayDate(holiday, year);
      if (!md) continue;
      const date = new Date(year, md[0] - 1, md[1]);
      const diffMs = date.getTime() - today.getTime();
      const daysUntil = Math.round(diffMs / (1000 * 60 * 60 * 24));
      if (Math.abs(daysUntil) <= windowDays) {
        candidates.push({ holiday, daysUntil, date });
      }
    }
  }

  if (candidates.length === 0) return null;

  // 取距离今天最近的（按绝对值）
  candidates.sort((a, b) => Math.abs(a.daysUntil) - Math.abs(b.daysUntil));
  return candidates[0];
}

/**
 * 一键套用节日：返回应写入 styleConfig 的部分字段。
 *
 * 关键：必须同时写入 accentScheme + backgroundId，否则新设计的 PosterCanvas
 * 仍按旧 accentScheme/backgroundId 渲染，导致"主题对象变了但纸张配色没变"的割裂。
 *
 * 注意：只改配色 + 印章文字 + 版式，**不改装饰/边框**。
 * 装饰（莲花水印/青竹/清水/宝相）和边框（双线装裱）是全局默认视觉骨架，
 * 任何模板套用都要保留，不被节日配置里陈旧的 decorations 覆盖。
 */
export function getHolidayStylePatch(holiday: HolidayConfig) {
  return {
    theme: holiday.theme,
    textureStyle: holiday.textures[0],
    sealText: holiday.sealText,
    layout: holiday.layout,
    holidayId: holiday.id,
    accentScheme: holiday.accentSchemeId || 'party',
    backgroundId: holiday.backgroundId || 'paper',
  };
}
