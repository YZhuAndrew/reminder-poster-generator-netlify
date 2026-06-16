import React, { useState, useEffect, useMemo } from 'react';
import { Controls } from './components/Controls';
import { PosterCanvas } from './components/PosterCanvas';
import { PinchZoom } from './components/PinchZoom';
import { LoginGate } from './components/LoginGate';
import { IntroPanel } from './components/IntroPanel';
import { PosterContent, PosterState, PosterStyle, Step, HistoryItem } from './types';
import { analyzeWarningText, generatePosterBackground } from './services/geminiService';
import html2canvas from 'html2canvas';

// 配置层
import { THEMES, findThemeById } from './config/themes';
import { FONT_OPTIONS, DEFAULT_TITLE_FONT_FAMILY } from './config/fonts';
import { TEXTURE_STYLES } from './config/textures';
import { getUpcomingHoliday, getHolidayStylePatch, findHoliday } from './config/holidays';
import { GENERAL_TEMPLATES } from './config/templates';

export { FONT_OPTIONS };

const DEFAULT_STYLE: PosterStyle = {
  titleSize: 56,
  bodySize: 16,
  overlayOpacity: 0.2,
  textColor: '#000000',
  alignment: 'center',
  fontFamily: FONT_OPTIONS[0].value,
  widthScale: 600,
  heightScale: 960,
  theme: THEMES[0],
  textureStyle: 'clouds',
  showSeal: true,
  // 新字段默认值
  layout: 'classic',
  titleFontFamily: DEFAULT_TITLE_FONT_FAMILY,
  sealText: '警示',
  decorations: [],
};

function App() {
  // Input States
  const [inputTitle, setInputTitle] = useState('');
  const [inputBody, setInputBody] = useState('');

  // App Logic States
  const [step, setStep] = useState<Step>(Step.INPUT);
  const [state, setState] = useState<PosterState>({
    content: null,
    imageUrl: null,
    isGeneratingText: false,
    isGeneratingImage: false,
    error: null,
  });

  // UI State
  const [isZoomed, setIsZoomed] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Visual Style Config
  const [styleConfig, setStyleConfig] = useState<PosterStyle>(DEFAULT_STYLE);

  // History State
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);

  // 节日推荐（自动检测临近节日）
  const upcomingHoliday = useMemo(() => getUpcomingHoliday(new Date(), 30), []);

  // Load history from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('poster_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (!Array.isArray(parsed)) return;

        // 迁移：兼容旧记录 + 回填新字段默认值
        const migrated = parsed.map((item: any) => {
          const rawStyle = item.styleConfig || {};
          let safeTheme = THEMES[0];

          if (rawStyle.theme && typeof rawStyle.theme === 'object') {
            const found = THEMES.find((t) => t.id === rawStyle.theme.id);
            if (found) {
              safeTheme = found;
            } else {
              // 可能是节日主题（不在通用 THEMES 中），保留原值
              safeTheme = rawStyle.theme;
            }
          } else if (typeof rawStyle.theme === 'string') {
            safeTheme = findThemeById(rawStyle.theme);
          }

          return {
            ...item,
            styleConfig: {
              ...DEFAULT_STYLE,
              ...rawStyle,
              theme: safeTheme,
              textureStyle: rawStyle.textureStyle || 'clouds',
              fontFamily: rawStyle.fontFamily || DEFAULT_STYLE.fontFamily,
              showSeal: rawStyle.showSeal !== undefined ? rawStyle.showSeal : true,
              // 新字段回填
              layout: rawStyle.layout || DEFAULT_STYLE.layout,
              titleFontFamily: rawStyle.titleFontFamily || DEFAULT_STYLE.titleFontFamily,
              sealText: rawStyle.sealText || DEFAULT_STYLE.sealText,
              decorations: Array.isArray(rawStyle.decorations) ? rawStyle.decorations : [],
              holidayId: rawStyle.holidayId,
            },
          };
        });
        setHistory(migrated);
      } catch (e) {
        console.error('Failed to parse history', e);
        localStorage.removeItem('poster_history');
      }
    }
  }, []);

  // Save history to local storage whenever it changes, with quota management
  useEffect(() => {
    const saveWithQuotaManagement = (items: HistoryItem[]) => {
      try {
        localStorage.setItem('poster_history', JSON.stringify(items));
      } catch (e: any) {
        if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED' || e.code === 22) {
          console.warn('LocalStorage quota exceeded. Trimming history to fit.');
          if (items.length === 0) return;
          const newItems = [...items];
          const oldestIndex = newItems.length - 1;
          const oldestItem = newItems[oldestIndex];
          if (oldestItem.imageUrl) {
            newItems[oldestIndex] = { ...oldestItem, imageUrl: null };
            saveWithQuotaManagement(newItems);
          } else {
            newItems.pop();
            saveWithQuotaManagement(newItems);
          }
        } else {
          console.error('Failed to save history', e);
        }
      }
    };

    if (history.length > 0) {
      saveWithQuotaManagement(history);
    }
  }, [history]);

  const addToHistory = (
    title: string,
    body: string,
    content: PosterContent,
    imageUrl: string | null,
    style: PosterStyle,
    existingId: string | null = null,
  ) => {
    const timestamp = Date.now();

    if (existingId) {
      setHistory((prev) =>
        prev.map((item) => (item.id === existingId ? { ...item, title, body, content, imageUrl, styleConfig: style, timestamp } : item)),
      );
    } else {
      const id = timestamp.toString();
      const newItem: HistoryItem = { id, timestamp, title, body, content, imageUrl, styleConfig: style };
      setHistory((prev) => [newItem, ...prev].slice(0, 10));
      setCurrentId(id);
    }
  };

  const handleDeleteHistory = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
    if (currentId === id) {
      handleNew();
    }
  };

  const handleLoadHistory = (item: HistoryItem) => {
    setCurrentId(item.id);
    setInputTitle(item.title);
    setInputBody(item.body);
    const safeStyle: PosterStyle = {
      ...DEFAULT_STYLE,
      ...item.styleConfig,
      theme: item.styleConfig.theme || THEMES[0],
      fontFamily: item.styleConfig.fontFamily || DEFAULT_STYLE.fontFamily,
      showSeal: item.styleConfig.showSeal !== undefined ? item.styleConfig.showSeal : true,
      decorations: Array.isArray(item.styleConfig.decorations) ? item.styleConfig.decorations : [],
    };
    setStyleConfig(safeStyle);
    setState({
      content: item.content,
      imageUrl: item.imageUrl,
      isGeneratingText: false,
      isGeneratingImage: false,
      error: null,
    });
    setStep(Step.PREVIEW);
  };

  const handleNew = () => {
    setCurrentId(null);
    setInputTitle('');
    setInputBody('');
    setStyleConfig(DEFAULT_STYLE);
    setState({
      content: null,
      imageUrl: null,
      isGeneratingText: false,
      isGeneratingImage: false,
      error: null,
    });
    setStep(Step.INPUT);
  };

  const handleManualSave = () => {
    if (!state.content) return;
    addToHistory(inputTitle, inputBody, state.content, state.imageUrl, styleConfig, currentId);
    alert('已保存到历史记录');
  };

  const handleClearImage = () => {
    setState((prev) => ({ ...prev, imageUrl: null }));
  };

  // 一键套用节日主题
  const handleApplyHoliday = (holidayId: string) => {
    const holiday = findHoliday(holidayId);
    if (!holiday) return;
    const patch = getHolidayStylePatch(holiday);
    setStyleConfig((prev) => ({ ...prev, ...patch }));
  };

  // 套用节日并自动填充模板文案
  const handleApplyHolidayWithTemplate = (holidayId: string) => {
    const holiday = findHoliday(holidayId);
    if (!holiday) return;
    const patch = getHolidayStylePatch(holiday);
    const tpl = holiday.templates[0];
    setStyleConfig((prev) => ({ ...prev, ...patch }));
    if (tpl) {
      setInputTitle(tpl.title);
      setInputBody(tpl.body);
    }
  };

  const handleGenerate = async () => {
    if (!inputTitle.trim() || !inputBody.trim()) return;

    setState((prev) => ({ ...prev, isGeneratingText: true, error: null }));
    setCurrentId(null);

    try {
      const content = await analyzeWarningText(inputTitle, inputBody);

      setState((prev) => ({ ...prev, content, isGeneratingText: false, isGeneratingImage: false, imageUrl: null }));
      setStep(Step.PREVIEW);
      addToHistory(inputTitle, inputBody, content, null, styleConfig, null);
    } catch (error: any) {
      console.error(error);
      const errorMsg = error.message || '未知错误';
      alert(`生成失败: ${errorMsg}`);
      setState((prev) => ({ ...prev, isGeneratingText: false, isGeneratingImage: false, error: errorMsg }));
    }
  };

  const handleRegenerateImage = async () => {
    if (!state.content) return;
    setState((prev) => ({ ...prev, isGeneratingImage: true }));
    try {
      const imageUrl = await generatePosterBackground(
        state.content.imagePrompt + ` variant ${Date.now()}`,
        styleConfig.theme,
        styleConfig.textureStyle,
      );
      setState((prev) => ({ ...prev, imageUrl, isGeneratingImage: false }));
      if (currentId && imageUrl) {
        addToHistory(inputTitle, inputBody, state.content, imageUrl, styleConfig, currentId);
      }
    } catch (error: any) {
      alert(`绘图失败: ${error.message}`);
      setState((prev) => ({ ...prev, isGeneratingImage: false }));
    }
  };

  const handleDownloadImage = async () => {
    const element = document.getElementById('poster-capture-area');
    if (!element) {
      alert('找不到海报内容，无法下载');
      return;
    }

    setIsDownloading(true);
    try {
      const w = styleConfig.widthScale;
      const h = styleConfig.heightScale;
      let targetScale = 2;

      const totalPixels = w * 2 * (h * 2);
      if (totalPixels > 6000000) targetScale = 1.5;
      if (totalPixels > 10000000) targetScale = 1;

      const canvas = await html2canvas(element, {
        scale: targetScale,
        useCORS: true,
        backgroundColor: null,
        logging: false,
        onclone: (clonedDoc) => {
          const el = clonedDoc.getElementById('poster-capture-area');
          if (el) {
            el.style.transform = 'none';
            el.style.margin = '0';
            el.style.boxShadow = 'none';
          }
        },
      });

      const dataUrl = canvas.toDataURL('image/png');
      if (dataUrl === 'data:,') throw new Error('Canvas data is empty');

      const link = document.createElement('a');
      link.download = `poster-${Date.now()}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: any) {
      console.error('Download failed', err);
      alert(`下载图片失败: ${err.message || '请稍后重试'}`);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleBackToEdit = () => {
    setStep(Step.INPUT);
  };

  const hasContent = !!state.content;

  return (
    <LoginGate>
    <div className="h-screen w-full flex flex-col lg:flex-row bg-[#050C1A] overflow-hidden">
      {/* PREVIEW PANEL */}
      <div
        className={`
          relative z-10 bg-[#050C1A] transition-all duration-300 ease-in-out shadow-2xl
          order-1 lg:order-2
          w-full lg:w-[500px] flex-shrink-0
          ${hasContent ? 'h-[42vh] border-b border-white/10' : 'h-0 border-b-0'} lg:h-full lg:border-b-0 lg:border-l lg:border-white/10
          flex items-center justify-center
        `}
      >
        <div
          className="absolute inset-0 z-0 opacity-20 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(#1e3a8a 1px, transparent 1px)', backgroundSize: '24px 24px' }}
        />

        {state.content && styleConfig ? (
          <PosterCanvas
            id="poster-capture-area"
            content={state.content}
            imageUrl={state.imageUrl}
            styleConfig={styleConfig}
            isGeneratingImage={state.isGeneratingImage}
            onClick={() => setIsZoomed(true)}
          />
        ) : (
          <IntroPanel />
        )}
      </div>

      {/* CONTROLS PANEL */}
      <div className="order-2 lg:order-1 flex-1 min-w-0 h-full overflow-y-auto custom-scrollbar p-4 relative z-0">
        <Controls
          step={step}
          inputTitle={inputTitle}
          setInputTitle={setInputTitle}
          inputBody={inputBody}
          setInputBody={setInputBody}
          onGenerate={handleGenerate}
          isGenerating={state.isGeneratingText}
          styleConfig={styleConfig}
          setStyleConfig={setStyleConfig}
          content={state.content}
          onRegenerateImage={handleRegenerateImage}
          onClearImage={handleClearImage}
          isGeneratingImage={state.isGeneratingImage}
          onBackToEdit={handleBackToEdit}
          history={history}
          onLoadHistory={handleLoadHistory}
          onDeleteHistory={handleDeleteHistory}
          onNew={handleNew}
          onSave={handleManualSave}
          onDownload={handleDownloadImage}
          isDownloading={isDownloading}
          availableThemes={THEMES}
          availableTextures={TEXTURE_STYLES}
          upcomingHoliday={upcomingHoliday}
          onApplyHoliday={handleApplyHoliday}
          onApplyHolidayWithTemplate={handleApplyHolidayWithTemplate}
          generalTemplates={GENERAL_TEMPLATES}
        />
        {state.error && (
          <div className="mt-4 p-3 bg-red-900/50 text-red-200 text-sm rounded border border-red-800">{state.error}</div>
        )}
      </div>

      {/* FULL SCREEN ZOOM MODAL */}
      {isZoomed && state.content && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 lg:p-10">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setIsZoomed(false)} />

          <div className="relative w-full h-full flex flex-col items-center justify-center pointer-events-none">
            <button
              onClick={() => setIsZoomed(false)}
              className="absolute top-0 right-0 lg:top-4 lg:right-4 z-50 p-2 text-white/70 hover:text-white bg-black/50 hover:bg-black/80 rounded-full transition-colors pointer-events-auto"
            >
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="w-full h-full pointer-events-auto" onClick={(e) => e.stopPropagation()}>
              <PinchZoom className="w-full h-full">
                <PosterCanvas
                  id="poster-zoom-view"
                  content={state.content}
                  imageUrl={state.imageUrl}
                  styleConfig={styleConfig}
                  isGeneratingImage={state.isGeneratingImage}
                />
              </PinchZoom>
            </div>
          </div>
        </div>
      )}
    </div>
    </LoginGate>
  );
}

export default App;
