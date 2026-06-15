import React, { useState } from 'react';
import { PosterStyle, PosterContent, HistoryItem, PosterTheme, Step, HolidayConfig } from '../types';
import { SimpleEditor } from './SimpleEditor';
import { FONT_OPTIONS } from '../App';
import { LAYOUT_OPTIONS } from '../config/layouts';
import { DECORATION_OPTIONS } from '../config/decorations';
import { findHoliday } from '../config/holidays';
import { UpcomingHoliday } from '../config/holidays';
import { HolidayTemplate } from '../types';

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
  onRegenerateImage: () => void;
  onClearImage: () => void;
  isGeneratingImage: boolean;
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
  generalTemplates: HolidayTemplate[];
}

// 尺寸预设
const SIZE_PRESETS = [
  { id: 'social', name: '朋友圈竖图', w: 1080, h: 1920 },
  { id: 'square', name: '公众号方图', w: 1080, h: 1080 },
  { id: 'a4', name: 'A4 打印', w: 1240, h: 1754 },
  { id: 'default', name: '默认', w: 600, h: 960 },
];

// 可折叠卡片
const CollapsibleSection: React.FC<{ title: string; defaultOpen?: boolean; children: React.ReactNode }> = ({
  title,
  defaultOpen = false,
  children,
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-blue-800/50 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-3 py-2.5 bg-blue-900/30 hover:bg-blue-900/50 transition-colors min-h-[40px]"
      >
        <span className="text-sm font-semibold text-blue-200">{title}</span>
        <svg
          className={`w-4 h-4 text-blue-400 transition-transform ${open ? 'rotate-180' : ''}`}
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
  onRegenerateImage,
  onClearImage,
  isGeneratingImage,
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
  generalTemplates,
}) => {
  const [activeTab, setActiveTab] = useState<'editor' | 'history'>('editor');

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
      <h3 className="text-sm font-bold text-blue-200 uppercase tracking-wider mb-4">历史记录 ({history.length})</h3>
      {history.length === 0 ? (
        <div className="text-center py-10 text-blue-500/50 text-sm">
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
                className="bg-[#0a1628] border border-blue-800/50 rounded-lg p-3 hover:border-blue-600 transition-colors group"
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-white text-sm line-clamp-1 font-serif-sc mr-2 flex items-center gap-1">
                    {holiday && <span className="text-base">{holiday.emoji}</span>}
                    {item.title || '无标题'}
                  </h4>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteHistory(item.id);
                    }}
                    className="text-blue-500 hover:text-red-400 transition-colors p-1 min-w-[36px] min-h-[36px] flex items-center justify-center"
                    title="删除"
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
                <p className="text-xs text-blue-400 mb-3">{new Date(item.timestamp).toLocaleString()}</p>
                <button
                  onClick={() => {
                    onLoadHistory(item);
                    setActiveTab('editor');
                  }}
                  className="w-full py-2 bg-blue-900/30 hover:bg-blue-800 text-blue-200 text-xs rounded border border-blue-800/50 transition-colors min-h-[36px]"
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

  // 节日横幅（顶部推荐）
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
          <div className="text-sm font-bold text-white">
            临近【{holiday.name}】· {dayText}
          </div>
          <div className="text-xs text-blue-200 truncate">{holiday.bannerHint || '点击套用节日主题'}</div>
        </div>
        <span className="text-xs text-white bg-white/20 px-2 py-1 rounded flex-shrink-0">一键套用</span>
      </div>
    );
  };

  // 节日模板快捷入口（编辑页）
  const renderHolidayTemplates = () => (
    <div className="mb-4">
      <label className="block text-xs font-semibold text-blue-300 mb-2 uppercase tracking-wider">快速模板</label>
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
        {/* 通用模板 */}
        {generalTemplates.map((tpl, i) => (
          <button
            key={`g-${i}`}
            onClick={() => {
              setInputTitle(tpl.title);
              setInputBody(tpl.body);
            }}
            className="flex-shrink-0 w-24 h-20 rounded-lg border border-blue-800 bg-[#0a1628] hover:border-blue-500 hover:bg-blue-900/30 transition-all flex flex-col items-center justify-center p-2 text-center"
          >
            <span className="text-xl mb-1">📋</span>
            <span className="text-[10px] text-blue-200 leading-tight line-clamp-2">{tpl.title}</span>
          </button>
        ))}
      </div>
    </div>
  );

  const renderPreviewControls = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center border-b border-blue-900/50 pb-4">
        <h3 className="font-bold text-white font-serif-sc">版式微调</h3>
        <button
          onClick={onBackToEdit}
          className="px-3 py-1.5 bg-blue-900/50 hover:bg-blue-800 text-blue-200 text-xs rounded border border-blue-800 transition-colors flex items-center gap-1 min-h-[36px]"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
          </svg>
          返回编辑
        </button>
      </div>

      {/* Download Action */}
      <button
        onClick={onDownload}
        disabled={isDownloading}
        className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-800 hover:from-emerald-500 hover:to-emerald-700 disabled:opacity-60 disabled:cursor-wait text-white font-bold rounded-lg shadow-lg shadow-emerald-900/40 transition-all flex items-center justify-center gap-2 mb-2 min-h-[48px]"
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
              className={`py-2.5 px-3 rounded border text-left transition-all min-h-[52px] ${
                styleConfig.layout === layout.id
                  ? 'bg-blue-600 text-white border-blue-400 ring-1 ring-blue-300'
                  : 'bg-[#0a1628] text-blue-300 border-blue-800 hover:border-blue-600'
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
              className={`py-2 px-2 rounded border text-xs transition-all min-h-[40px] ${
                styleConfig.widthScale === preset.w && styleConfig.heightScale === preset.h
                  ? 'bg-blue-600 text-white border-blue-400'
                  : 'bg-[#0a1628] text-blue-300 border-blue-800 hover:border-blue-600'
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

      {/* 折叠分组：配色（默认展开） */}
      <CollapsibleSection title="🎨 配色方案" defaultOpen={true}>
        <div className="grid grid-cols-4 gap-2">
          {availableThemes.map((theme) => (
            <button
              key={theme.id}
              onClick={() => handleChange('theme', theme)}
              className={`h-12 rounded border flex flex-col items-center justify-center transition-all min-h-[48px] ${
                styleConfig.theme?.id === theme.id ? 'border-white ring-2 ring-blue-500 scale-105' : 'border-white/10 opacity-70 hover:opacity-100'
              }`}
              style={{ backgroundColor: theme.primaryColor }}
              title={theme.name}
            >
              <span className="text-[10px] font-bold" style={{ color: theme.secondaryColor }}>
                {theme.name}
              </span>
            </button>
          ))}
        </div>
      </CollapsibleSection>

      {/* 折叠分组：纹理（分组展示通用/节日） */}
      <CollapsibleSection title="🌫️ 背景纹理" defaultOpen={false}>
        <div className="text-[10px] text-blue-400 mb-1.5 uppercase tracking-wide">通用</div>
        <div className="grid grid-cols-3 gap-2 mb-3">
          {availableTextures
            .filter((t) => !t.group || t.group === 'general')
            .map((tex) => (
              <TextureButton key={tex.id} tex={tex} active={styleConfig.textureStyle === tex.id} onChange={handleChange} onClearImage={onClearImage} />
            ))}
        </div>
        <div className="text-[10px] text-blue-400 mb-1.5 uppercase tracking-wide">节日专属</div>
        <div className="grid grid-cols-3 gap-2">
          {availableTextures
            .filter((t) => t.group === 'holiday')
            .map((tex) => (
              <TextureButton key={tex.id} tex={tex} active={styleConfig.textureStyle === tex.id} onChange={handleChange} onClearImage={onClearImage} />
            ))}
        </div>
      </CollapsibleSection>

      {/* 折叠分组：字体与字号 */}
      <CollapsibleSection title="🔤 字体与字号" defaultOpen={false}>
        <label className="text-[10px] text-blue-400 mb-1.5 uppercase tracking-wide block">标题字体</label>
        <div className="grid grid-cols-2 gap-2 mb-3">
          {FONT_OPTIONS.map((font) => (
            <button
              key={`title-${font.id}`}
              onClick={() => handleChange('titleFontFamily', font.value)}
              className={`py-2 px-3 rounded border text-sm transition-all text-left truncate min-h-[40px] ${
                styleConfig.titleFontFamily === font.value
                  ? 'bg-blue-600 text-white border-blue-400'
                  : 'bg-[#0a1628] text-blue-300 border-blue-800 hover:border-blue-600'
              }`}
              style={{ fontFamily: font.value }}
            >
              {font.name}
            </button>
          ))}
        </div>

        <label className="text-[10px] text-blue-400 mb-1.5 uppercase tracking-wide block">正文字体</label>
        <div className="grid grid-cols-2 gap-2 mb-3">
          {FONT_OPTIONS.map((font) => (
            <button
              key={`body-${font.id}`}
              onClick={() => handleChange('fontFamily', font.value)}
              className={`py-2 px-3 rounded border text-sm transition-all text-left truncate min-h-[40px] ${
                styleConfig.fontFamily === font.value
                  ? 'bg-blue-600 text-white border-blue-400'
                  : 'bg-[#0a1628] text-blue-300 border-blue-800 hover:border-blue-600'
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

      {/* 折叠分组：装饰与印章 */}
      <CollapsibleSection title="🎊 装饰与印章" defaultOpen={false}>
        {/* 印章开关 + 文字 */}
        <div className="flex items-center justify-between py-2 border border-blue-800/50 rounded bg-blue-900/20 px-3 mb-3">
          <span className="text-sm text-blue-200">显示印章</span>
          <button
            onClick={() => handleChange('showSeal', !styleConfig.showSeal)}
            className={`w-12 h-6 rounded-full relative transition-colors duration-200 min-h-[40px] ${
              styleConfig.showSeal ? 'bg-red-600' : 'bg-blue-900'
            }`}
          >
            <div
              className={`absolute top-1.5 w-4 h-4 bg-white rounded-full transition-all duration-200 shadow-sm ${
                styleConfig.showSeal ? 'left-7' : 'left-1'
              }`}
            />
          </button>
        </div>

        {styleConfig.showSeal && (
          <div className="mb-3">
            <label className="text-[10px] text-blue-400 mb-1.5 uppercase tracking-wide block">印章文字（2-4字）</label>
            <input
              type="text"
              value={styleConfig.sealText}
              maxLength={4}
              onChange={(e) => handleChange('sealText', e.target.value)}
              placeholder="例如：警示、节日纪律"
              className="w-full bg-[#0a1628] border border-blue-800 rounded-lg p-2.5 text-white text-sm focus:ring-2 focus:ring-red-600 focus:border-transparent focus:outline-none min-h-[40px]"
            />
          </div>
        )}

        <label className="text-[10px] text-blue-400 mb-1.5 uppercase tracking-wide block">装饰元素</label>
        <div className="grid grid-cols-3 gap-2">
          {DECORATION_OPTIONS.map((dec) => {
            const active = (styleConfig.decorations || []).includes(dec.id);
            return (
              <button
                key={dec.id}
                onClick={() => toggleDecoration(dec.id)}
                className={`py-2 px-1 rounded border text-center transition-all min-h-[48px] flex flex-col items-center justify-center ${
                  active ? 'bg-blue-600 text-white border-blue-400' : 'bg-[#0a1628] text-blue-300 border-blue-800 hover:border-blue-600'
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
      <div className="pt-2 border-t border-blue-900/50 space-y-3">
        <button
          onClick={onSave}
          className="w-full py-2.5 bg-blue-900 text-blue-100 hover:bg-blue-800 rounded-lg text-sm font-medium transition-colors border border-blue-700 min-h-[44px]"
        >
          保存当前更改
        </button>
      </div>
    </div>
  );

  const renderInput = () => (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <div className="p-1 bg-red-600 rounded shadow-lg shadow-red-900/50">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-white"
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
            className="text-xs px-3 py-2 bg-blue-900/50 hover:bg-blue-800 rounded text-blue-200 border border-blue-800 min-h-[40px]"
          >
            新建
          </button>
          <button
            onClick={onSave}
            className="text-xs px-3 py-2 bg-blue-900/50 hover:bg-blue-800 rounded text-blue-200 border border-blue-800 min-h-[40px]"
          >
            保存草稿
          </button>
        </div>
      </div>

      {/* 节日推荐横幅 */}
      {renderHolidayBanner()}

      {/* 快速模板入口 */}
      {renderHolidayTemplates()}

      <div className="space-y-4 mb-4">
        <div>
          <label className="block text-xs font-semibold text-blue-300 mb-1 uppercase tracking-wider">标题 (Title)</label>
          <input
            value={inputTitle}
            onChange={(e) => setInputTitle(e.target.value)}
            placeholder="例如：节日纪律提醒"
            className="w-full bg-[#0a1628] border border-blue-800 rounded-lg p-3 text-white focus:ring-2 focus:ring-red-600 focus:border-transparent focus:outline-none font-serif-sc font-bold text-lg placeholder-blue-700/50 min-h-[48px]"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-blue-300 mb-1 uppercase tracking-wider">正文 (Content)</label>
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
        className={`w-full py-4 rounded-lg font-bold text-lg transition-all shadow-lg min-h-[56px] ${
          isGenerating || !inputBody.trim()
            ? 'bg-slate-700 cursor-not-allowed text-slate-400'
            : 'bg-gradient-to-r from-[#DE2910] to-[#b30000] hover:from-red-600 hover:to-red-800 text-white shadow-red-900/50'
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
      <div className="flex border-b border-blue-900/50 mb-4">
        <button
          onClick={() => setActiveTab('editor')}
          className={`flex-1 py-3.5 text-sm font-bold border-b-2 transition-colors min-h-[48px] ${
            activeTab === 'editor' ? 'border-red-600 text-white' : 'border-transparent text-blue-400 hover:text-blue-300'
          }`}
        >
          编辑设计
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-3.5 text-sm font-bold border-b-2 transition-colors min-h-[48px] ${
            activeTab === 'history' ? 'border-red-600 text-white' : 'border-transparent text-blue-400 hover:text-blue-300'
          }`}
        >
          历史记录
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 pb-4">
        {activeTab === 'history' ? (
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
      <span className="text-sm text-blue-200">{label}</span>
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
          className="w-16 bg-[#0a1628] border border-blue-800 rounded px-2 py-1 text-xs text-white text-right min-h-[32px]"
        />
        <span className="text-xs text-blue-400">{unit}</span>
      </div>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full accent-red-600 h-2 bg-blue-900 rounded-lg appearance-none cursor-pointer"
    />
  </div>
);

// 纹理按钮
const TextureButton: React.FC<{
  tex: { id: string; name: string };
  active: boolean;
  onChange: (key: keyof PosterStyle, value: any) => void;
  onClearImage: () => void;
}> = ({ tex, active, onChange, onClearImage }) => (
  <button
    onClick={() => {
      onChange('textureStyle', tex.id);
      onClearImage();
    }}
    className={`py-2.5 rounded border text-xs font-medium transition-all min-h-[44px] ${
      active ? 'bg-blue-600 text-white border-blue-400 ring-1 ring-blue-300' : 'bg-[#0a1628] text-blue-300 border-blue-800 hover:border-blue-600'
    }`}
  >
    {tex.name}
  </button>
);
