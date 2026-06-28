import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Controls } from './components/Controls';
import { PosterCanvas } from './components/PosterCanvas';
import { PinchZoom } from './components/PinchZoom';
import { IntroPanel } from './components/IntroPanel';
import { PosterContent, PosterState, PosterStyle, Step, HistoryItem } from './types';
import { analyzeContent } from './services/geminiService';
import { normalizeStyle } from './services/styleUtils';
import html2canvas from 'html2canvas';

// 配置层
import { THEMES, findThemeById } from './config/themes';
import { FONT_OPTIONS, DEFAULT_TITLE_FONT_FAMILY } from './config/fonts';
import { TEXTURE_STYLES } from './config/textures';
import { getUpcomingHoliday, getHolidayStylePatch, findHoliday } from './config/holidays';

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
  // 版式与印章
  layout: 'classic',
  titleFontFamily: DEFAULT_TITLE_FONT_FAMILY,
  sealText: '廉洁',
  // 默认装饰：廉洁主题组合（莲花水印 + 青竹 + 清水 + 四角宝相）
  decorations: ['lotus', 'bamboo', 'water', 'cornerFlower'],
  // 重新设计新增字段
  accentScheme: 'party',       // 默认朱红强调色
  backgroundId: 'paper',       // 默认暖纸底色
  kicker: '廉洁提醒',           // 页眉左标签（纯中文）
  issue: '第 001 期',           // 页眉右期号
  paperTexture: true,          // 典雅升级：宣纸纤维+水墨角晕材质层默认开启
  frameStyle: 'double',        // 典雅升级：装饰边框默认双线装裱
  bgOpacity: 60,               // 背景材质透明度（0-100），越高角晕越明显
};

// 轻量 toast 类型（零依赖，替代原生 alert）
interface Toast {
  id: number;
  message: string;
  kind: 'info' | 'error';
}

function App() {
  // Input States
  const [inputTitle, setInputTitle] = useState('');
  const [inputBody, setInputBody] = useState('');

  // 编辑器外壳主题（亮/暗），持久化到 localStorage，默认亮色
  const [uiTheme, setUiTheme] = useState<'dark' | 'light'>(() => {
    try { return (localStorage.getItem('ui_theme') as 'dark' | 'light') || 'light'; }
    catch { return 'light'; }
  });
  useEffect(() => {
    document.documentElement.setAttribute('data-ui-theme', uiTheme);
    try { localStorage.setItem('ui_theme', uiTheme); } catch {}
  }, [uiTheme]);

  // App Logic States
  const [step, setStep] = useState<Step>(Step.INPUT);
  const [state, setState] = useState<PosterState>({
    content: null,
    isGeneratingText: false,
    error: null,
  });

  // UI State
  const [isZoomed, setIsZoomed] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Visual Style Config
  const [styleConfig, setStyleConfig] = useState<PosterStyle>(DEFAULT_STYLE);

  // History State
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);

  // 节日推荐（自动检测临近节日）
  const upcomingHoliday = useMemo(() => getUpcomingHoliday(new Date(), 30), []);

  // toast 工具：info 2.6s 自动消失；error 5s（错误信息需留够时间读完）
  const showToast = useCallback((message: string, kind: 'info' | 'error' = 'info', duration?: number) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, kind }]);
    const ttl = duration ?? (kind === 'error' ? 5000 : 2600);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, ttl);
  }, []);

  // Load history from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('poster_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (!Array.isArray(parsed)) return;

        // 迁移：兼容旧记录 + 回填新字段默认值（统一走 normalizeStyle）
        const migrated = parsed.map((item: any) => ({
          ...item,
          styleConfig: normalizeStyle(item.styleConfig, DEFAULT_STYLE, THEMES, findThemeById),
        }));
        setHistory(migrated);
      } catch (e) {
        console.error('Failed to parse history', e);
        localStorage.removeItem('poster_history');
      }
    }
  }, []);

  // Save history to local storage whenever it changes, with quota management
  useEffect(() => {
    // 超限时递归删最旧一条，并把结果回写 state，保证 state 与 storage 一致。
    // （旧版 bug：catch 里只写盘不回写 state，导致 state 永远比 storage 多、
    //  每次 effect 重跑又超限，刷新后丢数据。）
    const trimAndSave = (items: HistoryItem[]): void => {
      try {
        localStorage.setItem('poster_history', JSON.stringify(items));
      } catch (e: any) {
        if (
          e.name === 'QuotaExceededError' ||
          e.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
          e.code === 22
        ) {
          if (items.length <= 1) return; // 仅剩一条仍超限，放弃
          const trimmed = items.slice(0, items.length - 1);
          trimAndSave(trimmed);
          setHistory(trimmed); // 关键：回写 state
        } else {
          console.error('Failed to save history', e);
        }
      }
    };

    if (history.length > 0) {
      trimAndSave(history);
    }
  }, [history]);

  const addToHistory = (
    title: string,
    body: string,
    content: PosterContent,
    style: PosterStyle,
    existingId: string | null = null,
  ) => {
    const timestamp = Date.now();
    if (existingId) {
      setHistory((prev) =>
        prev.map((item) => (item.id === existingId ? { ...item, title, body, content, styleConfig: style, timestamp } : item)),
      );
    } else {
      const id = timestamp.toString();
      const newItem: HistoryItem = { id, timestamp, title, body, content, styleConfig: style };
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
    setStyleConfig(normalizeStyle(item.styleConfig, DEFAULT_STYLE, THEMES, findThemeById));
    setState({
      content: item.content,
      isGeneratingText: false,
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
      isGeneratingText: false,
      error: null,
    });
    setStep(Step.INPUT);
  };

  const handleManualSave = () => {
    if (!state.content) return;
    addToHistory(inputTitle, inputBody, state.content, styleConfig, currentId);
    showToast('已保存到历史记录');
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

  // 使用模板库的模板（来自内置通用/节日/我的模板）
  const handleUseTemplate = (tpl: { title: string; body: string; holidayId?: string }) => {
    setInputTitle(tpl.title);
    setInputBody(tpl.body);
    // 节日模板同步套用对应配色 + 印章文字 + 版式（装饰/边框保留默认，任何模板都不覆盖）
    if (tpl.holidayId) {
      const holiday = findHoliday(tpl.holidayId);
      if (holiday) {
        const patch = getHolidayStylePatch(holiday);
        setStyleConfig((prev) => ({ ...prev, ...patch }));
      }
    }
    showToast('已套用模板，可在编辑页继续调整');
  };

  const handleGenerate = async () => {
    if (!inputTitle.trim() || !inputBody.trim()) return;

    setState((prev) => ({ ...prev, isGeneratingText: true, error: null }));
    setCurrentId(null);

    try {
      const content = await analyzeContent(inputTitle, inputBody);

      setState((prev) => ({ ...prev, content, isGeneratingText: false }));
      setStep(Step.PREVIEW);
      addToHistory(inputTitle, inputBody, content, styleConfig, null);
    } catch (error: any) {
      console.error(error);
      const errorMsg = error.message || '未知错误';
      showToast(`生成失败：${errorMsg}`, 'error');
      setState((prev) => ({ ...prev, isGeneratingText: false, error: errorMsg }));
    }
  };

  const handleDownloadImage = async () => {
    const element = document.getElementById('poster-capture-area');
    if (!element) {
      showToast('找不到海报内容，无法下载', 'error');
      return;
    }

    // iOS Safari 受系统安全策略限制，html2canvas 截图后的 canvas 会被判定为"被污染"，
    // toDataURL 始终抛 "The operation is insecure"，无法直接下载。
    // 经多轮尝试（移除装饰层/blend/降级渲染/新页面打开）均无法根治，故改为引导提示：
    // 指引用户通过截屏或电脑端下载，不再触发会失败的下载流程。
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isIOS) {
      window.alert(
        'iPhone 暂不支持直接下载图片（受 iOS 安全策略限制）。\n\n' +
        '推荐两种方式获取海报：\n\n' +
        '① 截屏保存：放大海报后，同时按「电源键 + 音量上键」截屏，再裁剪即可\n' +
        '② 电脑下载：在电脑浏览器打开 hsjj.netlify.app，可一键下载高清原图'
      );
      return;
    }

    setIsDownloading(true);
    try {
      // 等中文字体加载完成再截图，避免导出的 PNG 标题 fallback 成系统字体。
      const fonts = (document as any).fonts;
      if (fonts?.ready) {
        await fonts.ready;
      }
      // 再兜底等一帧，覆盖 fonts.ready 在部分浏览器提前 resolve 的情况
      await new Promise((r) => setTimeout(r, 100));

      const w = styleConfig.widthScale;
      const h = styleConfig.heightScale;
      // 仅 iOS 走降级：iOS Safari 的 html2canvas 对密集重复梯度、blend mode、
      // 大 canvas 都不稳定，容易崩溃/空白。桌面端/Android 保持高质量完整渲染。
      const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

      let targetScale: number;
      if (isIOS) {
        // iOS：激进降采样，压在 ~9MP 安全线内（A4@0.8x 也才 ~2.5MP）
        targetScale = 1.2;
        while ((w * targetScale) * (h * targetScale) > 9000000 && targetScale > 0.8) {
          targetScale = Math.max(0.8, targetScale - 0.2);
        }
      } else {
        // 桌面端/Android：保持 2x 高清，仅对超大尺寸降采样防 OOM
        targetScale = 2;
        const renderPixels = (w * targetScale) * (h * targetScale);
        if (renderPixels > 16000000) targetScale = 1.5;
      }

      const canvas = await html2canvas(element, {
        scale: targetScale,
        // 装饰纹样是内联 data-URI SVG，同源不需要 CORS；
        // iOS 在 useCORS:true 时对 data-URI 反而可能抛安全异常，故统一关闭。
        useCORS: false,
        allowTaint: true,
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
      if (dataUrl === 'data:,' || dataUrl.length < 100) throw new Error('Canvas data is empty');

      // 桌面/Android：直接 a.download 触发下载（iOS 已在函数开头拦截，不会走到这里）
      const link = document.createElement('a');
      link.download = `poster-${Date.now()}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('海报已下载');
    } catch (err: any) {
      console.error('Download failed', err);
      showToast(`下载失败：${err.message || '请稍后重试'}`, 'error');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleBackToEdit = () => {
    setStep(Step.INPUT);
  };

  const hasContent = !!state.content;

  return (
    <main className="h-screen w-full flex flex-col lg:flex-row bg-[var(--ui-bg)] overflow-hidden">
      {/* 主题切换按钮（亮/暗），固定左下角（放右下/右上会遮挡放大预览的关闭按钮） */}
      <button
        onClick={() => setUiTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
        aria-label={uiTheme === 'dark' ? '切换到亮色' : '切换到暗色'}
        title={uiTheme === 'dark' ? '亮色模式' : '暗色模式'}
        className="fixed bottom-4 left-4 z-[90] w-10 h-10 rounded-full flex items-center justify-center bg-[var(--ui-panel)] border border-[var(--ui-border)] hover:border-[var(--ui-accent)] transition-colors shadow-lg"
      >
        {uiTheme === 'dark' ? (
          // 太阳图标（当前暗色，点击切亮）
          <svg className="w-5 h-5 text-[var(--ui-text-soft)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <circle cx="12" cy="12" r="4" />
            <path strokeLinecap="round" d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
          </svg>
        ) : (
          // 月亮图标（当前亮色，点击切暗）
          <svg className="w-5 h-5 text-[var(--ui-text-soft)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
          </svg>
        )}
      </button>

      {/* PREVIEW PANEL */}
      <aside
        className={`
          relative z-10 bg-[var(--ui-bg)] transition-all duration-300 ease-in-out shadow-2xl
          order-1 lg:order-2
          w-full lg:w-[500px] flex-shrink-0
          ${hasContent ? 'h-[42vh] border-b border-[var(--ui-border)]' : 'h-0 border-b-0'} lg:h-full lg:border-b-0 lg:border-l lg:border-[var(--ui-border)]
          flex items-center justify-center
        `}
      >
        <div
          className="absolute inset-0 z-0 opacity-[0.07] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(rgba(180,150,90,0.5) 1px, transparent 1px)', backgroundSize: '24px 24px' }}
        />

        {state.content && styleConfig ? (
          <PosterCanvas
            id="poster-capture-area"
            content={state.content}
            styleConfig={styleConfig}
            onClick={() => setIsZoomed(true)}
          />
        ) : (
          <IntroPanel />
        )}
      </aside>

      {/* CONTROLS PANEL */}
      <section className="order-2 lg:order-1 flex-1 min-w-0 h-full overflow-y-auto custom-scrollbar p-4 relative z-0">
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
          onUseTemplate={handleUseTemplate}
        />
        {state.error && (
          <div role="alert" className="mt-4 p-3 bg-[#5a1a16]/60 text-[#f0bcb6] text-sm rounded border border-[#7a2a22]">{state.error}</div>
        )}
      </section>

      {/* FULL SCREEN ZOOM MODAL */}
      {isZoomed && state.content && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 lg:p-10">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setIsZoomed(false)} />

          <div className="relative w-full h-full flex flex-col items-center justify-center pointer-events-none">
            <button
              onClick={() => setIsZoomed(false)}
              aria-label="关闭预览"
              className="absolute top-0 right-0 lg:top-4 lg:right-4 z-50 p-2 text-[var(--ui-text)]/70 hover:text-[var(--ui-text)] bg-black/50 hover:bg-black/80 rounded-full transition-colors pointer-events-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b3261e]"
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
                  styleConfig={styleConfig}
                />
              </PinchZoom>
            </div>
          </div>
        </div>
      )}

      {/* TOAST 容器 —— 替代原生 alert */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] flex flex-col gap-2 pointer-events-none w-[92vw] max-w-sm">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`pointer-events-auto px-4 py-3 rounded-lg shadow-lg text-sm font-medium border animate-[fadein_0.2s_ease-out] ${
              t.kind === 'error'
                ? 'bg-[#5a1a16]/95 text-[#f0bcb6] border-[#7a2a22]'
                : 'bg-[var(--ui-panel)]/95 text-[var(--ui-text)] border-[var(--ui-border)]'
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </main>
  );
}

export default App;
