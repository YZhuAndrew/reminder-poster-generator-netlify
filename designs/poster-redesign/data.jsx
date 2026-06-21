/* data.jsx —— 示例内容、字体搭配、文案模板
   全部挂在 window 上供后续脚本使用 */

// ---------- 字体方案 ----------
// 精简为 4 款最契合「暖纸编辑设计」的搭配，全部 Google Fonts 可加载。
const FONT_PRESETS = [
  {
    id: 'serif',
    name: '宋体巨字',
    desc: '思源宋体 · 报头权威感',
    title: '"Noto Serif SC", "Songti SC", serif',
    body: '"Noto Serif SC", "Songti SC", serif',
    weight: 900,
  },
  {
    id: 'xiaowei',
    name: '小薇刊头',
    desc: '小薇标题 · 宋体正文',
    title: '"ZCOOL XiaoWei", "Noto Serif SC", serif',
    body: '"Noto Serif SC", "Songti SC", serif',
    weight: 400,
  },
  {
    id: 'sans',
    name: '思源黑体',
    desc: '黑体标题 · 现代冷峻',
    title: '"Noto Sans SC", "PingFang SC", sans-serif',
    body: '"Noto Sans SC", "PingFang SC", sans-serif',
    weight: 900,
  },
  {
    id: 'qingke',
    name: '青铜黄油',
    desc: '字形厚重 · 张力强',
    title: '"ZCOOL QingKe HuangYou", "Noto Sans SC", sans-serif',
    body: '"Noto Sans SC", "PingFang SC", sans-serif',
    weight: 400,
  },
];

// ---------- 视觉方向（共享构图，仅强调色不同） ----------
const DIRECTIONS = [
  { id: 'party',   name: '朱红', hint: '节庆热烈',     accent: '#b3261e', sealFill: '#b3261e' },
  { id: 'guofeng', name: '赭石', hint: '雅致沉稳',     accent: '#8a5a2b', sealFill: '#9c2a1c' },
  { id: 'clean',   name: '靛蓝', hint: '现代冷静',     accent: '#1f5f8b', sealFill: '#1f5f8b' },
  { id: 'pine',    name: '松绿', hint: '清新稳重',     accent: '#2d6a4f', sealFill: '#2d6a4f' },
  { id: 'ink',     name: '墨黑', hint: '极简克制',     accent: '#1c1814', sealFill: '#1c1814' },
  { id: 'plum',    name: '紫绛', hint: '庄重典雅',     accent: '#7a2e4a', sealFill: '#7a2e4a' },
];

// ---------- 底色（与强调色独立可选，可任意搭配） ----------
// 通过 data-bg 切换（见 app.css）。每项给 paper / ink / soft 三色。
const BACKGROUNDS = [
  { id: 'paper',    name: '暖纸',  swatch: '#f0e8d4' },
  { id: 'cream',    name: '米白',  swatch: '#f7f2e7' },
  { id: 'white',    name: '纯白',  swatch: '#ffffff' },
  { id: 'mist',     name: '浅青',  swatch: '#e8eef0' },
  { id: 'stone',    name: '浅墨',  swatch: '#e6e4df' },
  { id: 'ivory',    name: '象牙',  swatch: '#f3ead6' },
];

// ---------- 示例内容 ----------
const DEFAULT_TITLE = '节日廉洁提醒';

// 编号要点正文：序号「一、」用 <b> 包裹，渲染时变朱红、字距更开，形成编号列
const DEFAULT_BODY = [
  '<p>节日期间，全体党员干部要严格遵守中央八项规定精神，做到令行禁止、清正廉洁。</p>',
  '<p><b>一、</b>严禁违规收送礼品礼金、有价证券和支付凭证；</p>',
  '<p><b>二、</b>严禁公款吃喝、公款旅游、公车私用；</p>',
  '<p><b>三、</b>严禁大操大办婚丧喜庆事宜并借机敛财；</p>',
  '<p><b>四、</b>严禁参与赌博、封建迷信及酒驾醉驾。</p>',
  '<p>祝全体同志度过一个风清气正、欢乐祥和的节日。</p>',
].join('');

// 各方向推荐的印章文字
const SEAL_TEXT = {
  party: '廉洁',
  guofeng: '清风',
  clean: '纪检',
  pine: '清风',
  ink: '纪检',
  plum: '廉政',
};

const DEFAULT_FOOTER = '中共 XX 县纪委';
const DEFAULT_ISSUE = '第 001 期';
const DEFAULT_DATE = '二〇二六';

// ---------- 文案模板 ----------
const TEMPLATES = [
  {
    id: 'integrity',
    title: '节日廉洁提醒',
    kicker: '廉洁提醒',
    body: DEFAULT_BODY,
    footer: '中共 XX 县纪委',
  },
  {
    id: 'safety',
    title: '安全生产提醒',
    kicker: '安全预警',
    body: [
      '<p>各单位要切实扛起安全生产主体责任，守牢安全底线。</p>',
      '<p><b>一、</b>压实安全生产责任制，层层传导压力；</p>',
      '<p><b>二、</b>加强重点部位、关键环节隐患排查治理；</p>',
      '<p><b>三、</b>严格执行值班值守与信息报告制度；</p>',
      '<p><b>四、</b>完善应急预案，强化应急演练与物资保障。</p>',
      '<p>安全无小事，责任重于泰山。</p>',
    ].join(''),
    footer: 'XX 应急管理局',
  },
  {
    id: 'meeting',
    title: '专题会议通知',
    kicker: '会议通知',
    body: [
      '<p>为贯彻落实上级工作部署，经研究，决定召开专题工作会议。</p>',
      '<p><b>时间：</b>2026 年 7 月 1 日（周三）上午 9:00</p>',
      '<p><b>地点：</b>机关大楼三楼会议室</p>',
      '<p><b>参会人员：</b>各科室、直属单位主要负责人</p>',
      '<p><b>要求：</b>请参会人员准时到会，原则上不得请假。</p>',
    ].join(''),
    footer: 'XX 局办公室',
  },
];

Object.assign(window, {
  FONT_PRESETS,
  DIRECTIONS,
  BACKGROUNDS,
  DEFAULT_TITLE,
  DEFAULT_BODY,
  SAL_TEXT: SEAL_TEXT,
  DEFAULT_FOOTER,
  DEFAULT_ISSUE,
  DEFAULT_DATE,
  TEMPLATES,
});
