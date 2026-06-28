import React, { useState } from 'react';
import { PosterStyle, PosterContent, HistoryItem, PosterTheme, Step } from '../types';
import { SimpleEditor } from './SimpleEditor';
import { TemplateLibrary } from './TemplateLibrary';
import { FRAME_STYLES } from './PosterCanvas';
import { FONT_OPTIONS } from '../config/fonts';
import { LAYOUT_OPTIONS } from '../config/layouts';
import { DECORATION_OPTIONS } from '../config/decorations';
import { ACCENT_SCHEMES, BACKGROUNDS } from '../config/themes';
import { findHoliday, UpcomingHoliday } from '../config/holidays';

interface ControlsProps {
  step: Step;
  inputTitle: string;
  setInputTitle: (val: string) => void;
  inputBody: string;
  setInputBody: (val: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;

  styleConfig: PosterStyle;
  setStyleConfig: React.Dispatch<React.SetStateAction<PosterStyle>>;
  content: PosterContent | null;
  onBackToEdit: () => void;

  history: HistoryItem[];
  onLoadHistory: (item: HistoryItem) => void;
  onDeleteHistory: (id: string) => void;

  onNew: () => void;
  onSave: () => void;
  onDownload: () => void;
  isDownloading: boolean;

  availableThemes: PosterTheme[];
  availableTextures: { id: string; name: string; group?: string }[];
  upcomingHoliday: UpcomingHoliday | null;
  onApplyHoliday: (holidayId: string) => void;
  onApplyHolidayWithTemplate: (holidayId: string) => void;
  /** 使用模板库的模板：填入标题+正文，节日模板额外套用主题 */
  onUseTemplate: (tpl: { title: string; body: string; holidayId?: string }) => void;
}

// 尺寸预设
const SIZE_PRESETS = [
  { id: 'social', name: '朋友圈竖图', w: 1080, h: 1920 },
  { id: 'square', name: '公众号方图', w: 1080, h: 1080 },
  { id: 'a4', name: 'A4 打印', w: 1240, h: 1754 },
  { id: 'default', name: '默认', w: 600, h: 960 },
];

// 选中态通用 className（朱红强调）—— 跟随主题变量
const SELECTED = 'bg-[var(--ui-accent)] text-[var(--ui-text)] border-[var(--ui-accent)]';
const UNSELECTED = 'bg-[var(--ui-panel)] text-[var(--ui-text-soft)] border-[var(--ui-border)] hover:border-[var(--ui-accent)]';

// 可折叠卡片
const CollapsibleSection: React.FC<{ title: string; defaultOpen?: boolean; children: React.ReactNode }> = ({
  title,
  defaultOpen = false,
  children,
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-[var(--ui-border)] rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full flex items-center justify-between px-3 py-2.5 bg-[var(--ui-panel)] hover:bg-[var(--ui-panel-hover)] transition-colors min-h-[40px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b3261e]"
      >
        <span className="text-sm font-semibold text-[var(--ui-text)]">{title}</span>
        <svg
          className={`w-4 h-4 text-[var(--ui-text-muted)] transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <div className="p-3 space-y-3">{children}</div>}
    </div>
  );
};

export const Controls: React.FC<ControlsProps> = ({
  step,
  inputTitle,
  setInputTitle,
  inputBody,
  setInputBody,
  onGenerate,
  isGenerating,
  styleConfig,
  setStyleConfig,
  content,
  onBackToEdit,
  history,
  onLoadHistory,
  onDeleteHistory,
  onNew,
  onSave,
  onDownload,
  isDownloading,
  availableThemes,
  availableTextures,
  upcomingHoliday,
  onApplyHoliday,
  onApplyHolidayWithTemplate,
  onUseTemplate,
}) => {
  const [activeTab, setActiveTab] = useState<'editor' | 'templates' | 'history'>('editor');

  const handleChange = (key: keyof PosterStyle, value: any) => {
    setStyleConfig((prev) => ({ ...prev, [key]: value }));
  };

  // 装饰开关
  const toggleDecoration = (id: string) => {
    const current = styleConfig.decorations || [];
    const next = current.includes(id) ? current.filter((d) => d !== id) : [...current, id];
    handleChange('decorations', next);
  };

  const renderHistory = () => (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-[var(--ui-text)] mb-4">历史记录（{history.length}）</h3>
      {history.length === 0 ? (
        <div className="text-center py-10 text-[var(--ui-text-muted)] text-sm">
          暂无历史记录
          <br />
          生成海报后会自动保存
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((item) => {
            const holiday = item.styleConfig?.holidayId ? findHoliday(item.styleConfig.holidayId) : null;
            return (
              <div
                key={item.id}
                className="bg-[var(--ui-panel)] border border-[var(--ui-border)] rounded-lg p-3 hover:border-[#b3261e] transition-colors group"
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-[var(--ui-text)] text-sm line-clamp-1 font-serif-sc mr-2 flex items-center gap-1">
                    {holiday && <span className="text-base">{holiday.emoji}</span>}
                    {item.title || '无标题'}
                  </h4>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteHistory(item.id);
                    }}
                    className="text-[var(--ui-text-muted)] hover:text-[#e08077] transition-colors p-1 min-w-[36px] min-h-[36px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b3261e] rounded"
                    title="删除"
                    aria-label="删除此记录"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
                <p className="text-xs text-[var(--ui-text-muted)] mb-3">{new Date(item.timestamp).toLocaleString()}</p>
                <button
                  onClick={() => {
                    onLoadHistory(item);
                    setActiveTab('editor');
                  }}
                  className="w-full py-2 bg-[var(--ui-input)] hover:bg-[#3a2f20] text-[var(--ui-text-soft)] text-xs rounded border border-[var(--ui-border)] transition-colors min-h-[36px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b3261e]"
                >
                  加载此海报
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  // 节日横幅（顶部推荐）—— 当前入口已停用（见 renderInput 中被注释的调用）
  const renderHolidayBanner = () => {
    if (!upcomingHoliday) return null;
    const { holiday, daysUntil } = upcomingHoliday;
    const dayText = daysUntil === 0 ? '就是今天' : daysUntil > 0 ? `还有 ${daysUntil} 天` : `刚过去 ${Math.abs(daysUntil)} 天`;
    return (
      <div
        className="mb-3 rounded-lg border p-3 flex items-center gap-3 cursor-pointer hover:brightness-110 transition-all"
        style={{
          background: `linear-gradient(90deg, ${holiday.theme.primaryColor}33, ${holiday.theme.primaryColor}11)`,
          borderColor: `${holiday.theme.primaryColor}66`,
        }}
        onClick={() => onApplyHolidayWithTemplate(holiday.id)}
        title="点击一键套用节日主题和模板文案"
      >
        <span className="text-2xl flex-shrink-0">{holiday.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-[var(--ui-text)]">
            临近【{holiday.name}】· {dayText}
          </div>
          <div className="text-xs text-[var(--ui-text-soft)] truncate">{holiday.bannerHint || '点击套用节日主题'}</div>
        </div>
        <span className="text-xs text-[var(--ui-text)] bg-white/20 px-2 py-1 rounded flex-shrink-0">一键套用</span>
      </div>
    );
  };

  // 节日模板快捷入口（编辑页）—— 当前入口已停用（见 renderInput 中被注释的调用）
  const renderPreviewControls = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center border-b border-[var(--ui-border)] pb-4">
        <h3 className="font-bold text-[var(--ui-text)] font-serif-sc">版式微调</h3>
        <button
          onClick={onBackToEdit}
          className="px-3 py-1.5 bg-[var(--ui-panel)] hover:bg-[var(--ui-panel-hover)] text-[var(--ui-text-soft)] text-xs rounded border border-[var(--ui-border)] transition-colors flex items-center gap-1 min-h-[36px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b3261e]"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
          </svg>
          返回编辑
        </button>
      </div>

      {/* Download Action —— 朱红主操作（统一强调色，去原 emerald 多色撞色） */}
      <button
        onClick={onDownload}
        disabled={isDownloading}
        className="w-full py-3.5 bg-gradient-to-r from-[#b3261e] to-[#8c1a14] hover:from-[#c92a20] hover:to-[#a01e16] disabled:opacity-60 disabled:cursor-wait text-white font-bold rounded-lg shadow-lg shadow-black/40 transition-all flex items-center justify-center gap-2 mb-2 min-h-[48px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ui-bg)] focus-visible:ring-[#b3261e]"
      >
        {isDownloading ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            生成中...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4 4m4-4V4" />
            </svg>
            下载海报图片
          </>
        )}
      </button>

      {/* 折叠分组：布局与版式 */}
      <CollapsibleSection title="📐 版式模板" defaultOpen={false}>
        <div className="grid grid-cols-2 gap-2">
          {LAYOUT_OPTIONS.map((layout) => (
            <button
              key={layout.id}
              onClick={() => handleChange('layout', layout.id)}
              className={`py-2.5 px-3 rounded border text-left transition-all min-h-[52px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b3261e] ${
                styleConfig.layout === layout.id ? SELECTED : UNSELECTED
              }`}
            >
              <div className="text-sm font-bold">{layout.name}</div>
              <div className="text-[10px] opacity-70 leading-tight mt-0.5">{layout.desc}</div>
            </button>
          ))}
        </div>
      </CollapsibleSection>

      {/* 折叠分组：尺寸 */}
      <CollapsibleSection title="📏 尺寸设置" defaultOpen={false}>
        <div className="grid grid-cols-2 gap-2 mb-3">
          {SIZE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => {
                handleChange('widthScale', preset.w);
                handleChange('heightScale', preset.h);
              }}
              className={`py-2 px-2 rounded border text-xs transition-all min-h-[40px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b3261e] ${
                styleConfig.widthScale === preset.w && styleConfig.heightScale === preset.h ? SELECTED : UNSELECTED
              }`}
            >
              {preset.name}
              <div className="text-[9px] opacity-60">{preset.w}×{preset.h}</div>
            </button>
          ))}
        </div>

        <SliderRow
          label="宽度"
          value={styleConfig.widthScale}
          min={300}
          max={1500}
          step={10}
          unit="px"
          onChange={(v) => handleChange('widthScale', v)}
        />
        <SliderRow
          label="高度"
          value={styleConfig.heightScale}
          min={500}
          max={2500}
          step={10}
          unit="px"
          onChange={(v) => handleChange('heightScale', v)}
        />
      </CollapsibleSection>

      {/* 折叠分组：强调色方案（默认展开） */}
      <CollapsibleSection title="🎨 强调色方案" defaultOpen={true}>
        <div className="grid grid-cols-3 gap-2">
          {ACCENT_SCHEMES.map((scheme) => (
            <button
              key={scheme.id}
              onClick={() => handleChange('accentScheme', scheme.id)}
              className={`flex items-center gap-2 p-2 rounded border text-left transition-all min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b3261e] ${
                styleConfig.accentScheme === scheme.id ? 'border-[#b3261e] ring-1 ring-[#b3261e] bg-white/5' : 'border-[var(--ui-border)] opacity-70 hover:opacity-100'
              }`}
              title={scheme.hint}
            >
              <span className="w-5 h-5 rounded flex-shrink-0" style={{ background: scheme.accent }} />
              <span className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-[var(--ui-text)] truncate">{scheme.name}</span>
                <span className="text-[10px] text-[var(--ui-text-muted)] truncate">{scheme.hint}</span>
              </span>
            </button>
          ))}
        </div>
      </CollapsibleSection>

      {/* 折叠分组：底色（与强调色独立搭配） */}
      <CollapsibleSection title="🗂️ 底色" defaultOpen={false}>
        <div className="grid grid-cols-3 gap-2">
          {BACKGROUNDS.map((bg) => (
            <button
              key={bg.id}
              onClick={() => handleChange('backgroundId', bg.id)}
              className={`flex items-center gap-2 p-2 rounded border text-left transition-all min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b3261e] ${
                styleConfig.backgroundId === bg.id ? 'border-[#b3261e] ring-1 ring-[#b3261e] bg-white/5' : 'border-[var(--ui-border)] opacity-70 hover:opacity-100'
              }`}
              title={bg.name}
            >
              <span className="w-5 h-5 rounded flex-shrink-0 border border-black/20" style={{ background: bg.paper }} />
              <span className="text-xs font-bold text-[var(--ui-text)] truncate">{bg.name}</span>
            </button>
          ))}
        </div>
        {/* 背景材质强度（角晕/纤维透明度） */}
        <SliderRow
          label="背景质感强度"
          value={styleConfig.bgOpacity ?? 60}
          min={0}
          max={100}
          step={5}
          unit="%"
          onChange={(v) => handleChange('bgOpacity', v)}
        />
      </CollapsibleSection>

      {/* 折叠分组：报头信息（页眉） */}
      <CollapsibleSection title="📰 报头信息" defaultOpen={false}>
        <label className="text-[10px] text-[var(--ui-text-muted)] mb-1.5 block">页眉标签（左）</label>
        <input
          type="text"
          value={styleConfig.kicker || ''}
          onChange={(e) => handleChange('kicker', e.target.value)}
          placeholder="如：廉洁提醒"
          className="w-full px-3 py-2 mb-3 rounded bg-[var(--ui-input)] border border-[var(--ui-border)] text-sm text-[var(--ui-text)] placeholder-[var(--ui-text-muted)] focus:outline-none focus:border-[#b3261e] focus-visible:ring-2 focus-visible:ring-[#b3261e]/40"
        />
        <label className="text-[10px] text-[var(--ui-text-muted)] mb-1.5 block">期号（右）</label>
        <input
          type="text"
          value={styleConfig.issue || ''}
          onChange={(e) => handleChange('issue', e.target.value)}
          placeholder="如：第 001 期"
          className="w-full px-3 py-2 rounded bg-[var(--ui-input)] border border-[var(--ui-border)] text-sm text-[var(--ui-text)] placeholder-[var(--ui-text-muted)] focus:outline-none focus:border-[#b3261e] focus-visible:ring-2 focus-visible:ring-[#b3261e]/40"
        />
      </CollapsibleSection>

      {/* 折叠分组：字体与字号 */}
      <CollapsibleSection title="🔤 字体与字号" defaultOpen={false}>
        <label className="text-[10px] text-[var(--ui-text-muted)] mb-1.5 block">标题字体</label>
        <div className="grid grid-cols-2 gap-2 mb-3">
          {FONT_OPTIONS.map((font) => (
            <button
              key={`title-${font.id}`}
              onClick={() => handleChange('titleFontFamily', font.value)}
              className={`py-2 px-3 rounded border text-sm transition-all text-left truncate min-h-[40px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b3261e] ${
                styleConfig.titleFontFamily === font.value ? SELECTED : UNSELECTED
              }`}
              style={{ fontFamily: font.value }}
            >
              {font.name}
            </button>
          ))}
        </div>

        <label className="text-[10px] text-[var(--ui-text-muted)] mb-1.5 block">正文字体</label>
        <div className="grid grid-cols-2 gap-2 mb-3">
          {FONT_OPTIONS.map((font) => (
            <button
              key={`body-${font.id}`}
              onClick={() => handleChange('fontFamily', font.value)}
              className={`py-2 px-3 rounded border text-sm transition-all text-left truncate min-h-[40px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b3261e] ${
                styleConfig.fontFamily === font.value ? SELECTED : UNSELECTED
              }`}
              style={{ fontFamily: font.value }}
            >
              {font.name}
            </button>
          ))}
        </div>

        <SliderRow
          label="大标题"
          value={styleConfig.titleSize}
          min={32}
          max={200}
          step={1}
          unit="px"
          onChange={(v) => handleChange('titleSize', v)}
        />
        <SliderRow
          label="正文基准"
          value={styleConfig.bodySize}
          min={10}
          max={120}
          step={1}
          unit="px"
          onChange={(v) => handleChange('bodySize', v)}
        />
      </CollapsibleSection>

      {/* 折叠分组：装饰边框（独立分组，8 种样式可选） */}
      <CollapsibleSection title="🖼️ 装饰边框" defaultOpen={false}>
        <div className="grid grid-cols-3 gap-1.5 mb-3">
          {FRAME_STYLES.map((f) => (
            <button
              key={f.id}
              onClick={() => handleChange('frameStyle', f.id)}
              className={`py-2 px-1 rounded border text-[11px] transition-all min-h-[40px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b3261e] ${
                (styleConfig.frameStyle || 'double') === f.id ? SELECTED : UNSELECTED
              }`}
            >
              {f.name}
            </button>
          ))}
        </div>
      </CollapsibleSection>

      {/* 折叠分组：材质与印章 */}
      <CollapsibleSection title="🎊 材质与印章" defaultOpen={false}>
        {/* 印章开关 */}
        <ToggleRow
          label="显示印章"
          checked={styleConfig.showSeal}
          onChange={(v) => handleChange('showSeal', v)}
        />
        {/* 纸张质感开关（典雅升级：宣纸纤维+水墨角晕） */}
        <ToggleRow
          label="纸张质感（宣纸纤维 / 水墨角晕）"
          checked={styleConfig.paperTexture !== false}
          onChange={(v) => handleChange('paperTexture', v)}
        />

        {/* 印章文字（可编辑，2-6 字） */}
        <label className="text-[10px] text-[var(--ui-text-muted)] mb-1.5 block">印章文字（2-6 字）</label>
        <input
          type="text"
          value={styleConfig.sealText || ''}
          maxLength={6}
          onChange={(e) => handleChange('sealText', e.target.value)}
          placeholder="如：廉洁 / 纪检 / 清风"
          className="w-full px-3 py-2 mb-3 rounded bg-[var(--ui-input)] border border-[var(--ui-border)] text-sm text-[var(--ui-text)] placeholder-[var(--ui-text-muted)] focus:outline-none focus:border-[#b3261e] focus-visible:ring-2 focus-visible:ring-[#b3261e]/40"
        />

        <label className="text-[10px] text-[var(--ui-text-muted)] mb-1.5 block">装饰元素</label>
        <div className="grid grid-cols-3 gap-2">
          {DECORATION_OPTIONS.map((dec) => {
            const active = (styleConfig.decorations || []).includes(dec.id);
            return (
              <button
                key={dec.id}
                onClick={() => toggleDecoration(dec.id)}
                className={`py-2 px-1 rounded border text-center transition-all min-h-[48px] flex flex-col items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b3261e] ${
                  active ? SELECTED : UNSELECTED
                }`}
              >
                <span className="text-lg leading-none mb-0.5">{dec.icon}</span>
                <span className="text-[10px] leading-tight">{dec.name}</span>
              </button>
            );
          })}
        </div>
      </CollapsibleSection>

      {/* 保存 */}
      <div className="pt-2 border-t border-[var(--ui-border)] space-y-3">
        <button
          onClick={onSave}
          className="w-full py-2.5 bg-[var(--ui-panel)] text-[var(--ui-text-soft)] hover:bg-[var(--ui-panel-hover)] hover:text-[var(--ui-text)] rounded-lg text-sm font-medium transition-colors border border-[var(--ui-border)] min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b3261e]"
        >
          保存当前更改
        </button>
      </div>
    </div>
  );

  const renderInput = () => (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-[var(--ui-text)] flex items-center gap-2">
          <div className="p-1 bg-[#b3261e] rounded shadow-lg shadow-black/40">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-[var(--ui-text)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
              />
            </svg>
          </div>
          <span className="font-serif-sc tracking-wide">警示海报生成</span>
        </h2>
        <div className="flex gap-2">
          <button
            onClick={onNew}
            className="text-xs px-3 py-2 bg-[var(--ui-panel)] hover:bg-[var(--ui-panel-hover)] hover:text-[var(--ui-text)] rounded text-[var(--ui-text-soft)] border border-[var(--ui-border)] min-h-[40px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b3261e]"
          >
            新建
          </button>
          <button
            onClick={onSave}
            className="text-xs px-3 py-2 bg-[var(--ui-panel)] hover:bg-[var(--ui-panel-hover)] hover:text-[var(--ui-text)] rounded text-[var(--ui-text-soft)] border border-[var(--ui-border)] min-h-[40px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b3261e]"
          >
            保存草稿
          </button>
        </div>
      </div>

      {/* 节日推荐横幅：节庆时段自动出现，一键套用主题+模板+装饰+底色 */}
      {renderHolidayBanner()}

      <div className="space-y-4 mb-4">
        <div>
          <label className="block text-xs font-semibold text-[var(--ui-text-muted)] mb-1">标题</label>
          <input
            value={inputTitle}
            onChange={(e) => setInputTitle(e.target.value)}
            placeholder="例如：节日纪律提醒"
            className="w-full bg-[var(--ui-input)] border border-[var(--ui-border)] rounded-lg p-3 text-[var(--ui-text)] focus:ring-2 focus:ring-[#b3261e] focus:border-transparent focus:outline-none font-serif-sc font-bold text-lg placeholder-[var(--ui-text-muted)] min-h-[48px]"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[var(--ui-text-muted)] mb-1">正文</label>
          <SimpleEditor
            value={inputBody}
            onChange={(html) => setInputBody(html)}
            placeholder="请输入正文内容..."
            className="w-full"
            fontFamily={styleConfig.fontFamily}
          />
        </div>
      </div>

      <button
        onClick={onGenerate}
        disabled={isGenerating || !inputBody.trim()}
        className={`w-full py-4 rounded-lg font-bold text-lg transition-all shadow-lg min-h-[56px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ui-bg)] focus-visible:ring-[#b3261e] ${
          isGenerating || !inputBody.trim()
            ? 'bg-[var(--ui-input)] cursor-not-allowed text-[var(--ui-text-muted)]'
            : 'bg-gradient-to-r from-[#b3261e] to-[#8c1a14] hover:from-[#c92a20] hover:to-[#a01e16] text-white shadow-black/40'
        }`}
      >
        {isGenerating ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            生成中...
          </span>
        ) : (
          '开始生成海报'
        )}
      </button>
    </>
  );

  return (
    <div className="flex flex-col h-full">
      {/* Mobile/Tab Switcher */}
      <div className="flex border-b border-[var(--ui-border)] mb-4" role="tablist">
        <button
          role="tab"
          aria-selected={activeTab === 'editor'}
          onClick={() => setActiveTab('editor')}
          className={`flex-1 py-3.5 text-sm font-bold border-b-2 transition-colors min-h-[48px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b3261e] ${
            activeTab === 'editor' ? 'border-[#b3261e] text-[var(--ui-text)]' : 'border-transparent text-[var(--ui-text-muted)] hover:text-[var(--ui-text-soft)]'
          }`}
        >
          编辑设计
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'templates'}
          onClick={() => setActiveTab('templates')}
          className={`flex-1 py-3.5 text-sm font-bold border-b-2 transition-colors min-h-[48px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b3261e] ${
            activeTab === 'templates' ? 'border-[#b3261e] text-[var(--ui-text)]' : 'border-transparent text-[var(--ui-text-muted)] hover:text-[var(--ui-text-soft)]'
          }`}
        >
          模板库
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'history'}
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-3.5 text-sm font-bold border-b-2 transition-colors min-h-[48px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b3261e] ${
            activeTab === 'history' ? 'border-[#b3261e] text-[var(--ui-text)]' : 'border-transparent text-[var(--ui-text-muted)] hover:text-[var(--ui-text-soft)]'
          }`}
        >
          历史记录
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 pb-4">
        {activeTab === 'templates' ? (
          <TemplateLibrary
            upcomingHoliday={upcomingHoliday}
            onUseTemplate={(tpl) => {
              onUseTemplate(tpl);
              setActiveTab('editor');
            }}
            fontFamily={styleConfig.fontFamily}
          />
        ) : activeTab === 'history' ? (
          renderHistory()
        ) : step === Step.PREVIEW && content ? (
          renderPreviewControls()
        ) : (
          renderInput()
        )}
      </div>
    </div>
  );
};

// 滑块行：带数值输入框（触摸友好）
const SliderRow: React.FC<{
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (v: number) => void;
}> = ({ label, value, min, max, step, unit, onChange }) => (
  <div>
    <div className="flex justify-between items-center mb-1">
      <span className="text-sm text-[var(--ui-text-soft)]">{label}</span>
      <div className="flex items-center gap-1">
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (!isNaN(v)) onChange(Math.max(min, Math.min(max, v)));
          }}
          className="w-16 bg-[var(--ui-input)] border border-[var(--ui-border)] rounded px-2 py-1 text-xs text-[var(--ui-text)] text-right min-h-[32px] focus:outline-none focus:border-[#b3261e]"
        />
        <span className="text-xs text-[var(--ui-text-muted)]">{unit}</span>
      </div>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full accent-[#b3261e] h-2 bg-[var(--ui-border)] rounded-lg appearance-none cursor-pointer"
    />
  </div>
);

// 开关行：印章/纸张质感等布尔项复用（触摸友好 + 可访问）
const ToggleRow: React.FC<{ label: string; checked: boolean; onChange: (v: boolean) => void }> = ({ label, checked, onChange }) => (
  <div className="flex items-center justify-between py-2 border border-[var(--ui-border)] rounded bg-[var(--ui-panel)] px-3 mb-3">
    <span className="text-sm text-[var(--ui-text-soft)]">{label}</span>
    <button
      onClick={() => onChange(!checked)}
      role="switch"
      aria-checked={checked}
      className={`w-12 h-6 rounded-full relative transition-colors duration-200 min-h-[40px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b3261e] ${
        checked ? 'bg-[#b3261e]' : 'bg-[var(--ui-border)]'
      }`}
    >
      <div
        className={`absolute top-1.5 w-4 h-4 bg-white rounded-full transition-all duration-200 shadow-sm ${
          checked ? 'left-7' : 'left-1'
        }`}
      />
    </button>
  </div>
);
