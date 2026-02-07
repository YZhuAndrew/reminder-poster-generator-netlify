import React, { useState, useEffect } from 'react';
import { Controls } from './components/Controls';
import { PosterCanvas } from './components/PosterCanvas';
import { PosterContent, PosterState, PosterStyle, Step, HistoryItem, PosterTheme } from './types';
import { analyzeWarningText, generatePosterBackground } from './services/geminiService';
import html2canvas from 'html2canvas';

export const THEMES: PosterTheme[] = [
  {
    id: 'red',
    name: '党建红',
    primaryColor: '#DE2910',
    secondaryColor: '#FFFF00',
    backgroundColor: '#FFFBF0',
    accentColor: '#DE2910'
  },
  {
    id: 'blue',
    name: '税务蓝',
    primaryColor: '#0f2b5c',
    secondaryColor: '#FFFFFF',
    backgroundColor: '#F0F7FF',
    accentColor: '#0f2b5c'
  },
  {
    id: 'ink',
    name: '水墨黑',
    primaryColor: '#1a1a1a',
    secondaryColor: '#D4AF37',
    backgroundColor: '#F5F5F5',
    accentColor: '#333333'
  },
  {
    id: 'green',
    name: '生态绿',
    primaryColor: '#125227',
    secondaryColor: '#FFFFFF',
    backgroundColor: '#F2FFF5',
    accentColor: '#125227'
  }
];

export const TEXTURE_STYLES = [
  { id: 'clouds', name: '祥云瑞气' },
  { id: 'mountains', name: '巍巍青山' },
  { id: 'bamboo', name: '高风亮节' },
  { id: 'geometric', name: '现代几何' },
  { id: 'paper', name: '宣纸质感' },
  { id: 'city', name: '城市剪影' },
];

export const FONT_OPTIONS = [
  { id: 'song', name: '标准宋体', value: '"Noto Serif SC", "SimSun", "Songti SC", serif' },
  { id: 'hei', name: '现代黑体', value: '"Noto Sans SC", "SimHei", "Heiti SC", sans-serif' },
  { id: 'kai', name: '传统楷体', value: '"KaiTi", "STKaiti", "Ma Shan Zheng", serif' },
  { id: 'fang', name: '公文仿宋', value: '"FangSong", "STFangsong", serif' },
  { id: 'calligraphy', name: '书法行书', value: '"Zhi Mang Xing", "Ma Shan Zheng", cursive' },
];

const DEFAULT_STYLE: PosterStyle = {
  titleSize: 56,
  bodySize: 16,
  overlayOpacity: 0.2,
  textColor: '#000000',
  alignment: 'center',
  fontFamily: FONT_OPTIONS[0].value, // Default to Songti
  widthScale: 600, // Default width in px
  heightScale: 960, // Default height in px
  theme: THEMES[0],
  textureStyle: 'clouds',
  showSeal: true // Default to showing the seal
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

  // Visual Style Config
  const [styleConfig, setStyleConfig] = useState<PosterStyle>(DEFAULT_STYLE);

  // History State
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);

  // Load history from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('poster_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (!Array.isArray(parsed)) return;

        // CRITICAL MIGRATION FIX:
        // Ensure all history items have a valid theme OBJECT, not just a string ID.
        // If theme is missing or invalid, fallback to default.
        const migrated = parsed.map((item: any) => {
            let safeTheme = THEMES[0];
            
            // If theme is an object with an ID, try to find the up-to-date theme definition
            if (item.styleConfig?.theme && typeof item.styleConfig.theme === 'object') {
                const found = THEMES.find(t => t.id === item.styleConfig.theme.id);
                if (found) safeTheme = found;
            } 
            // If theme is just a string ID (old version), find it
            else if (typeof item.styleConfig?.theme === 'string') {
                 const found = THEMES.find(t => t.id === item.styleConfig.theme);
                 if (found) safeTheme = found;
            }

            return {
                ...item,
                styleConfig: {
                    ...(item.styleConfig || DEFAULT_STYLE),
                    theme: safeTheme,
                    textureStyle: item.styleConfig?.textureStyle || 'clouds',
                    // Ensure fontFamily exists (migration for old records)
                    fontFamily: item.styleConfig?.fontFamily || DEFAULT_STYLE.fontFamily,
                    // Ensure showSeal exists (migration for old records), default to true
                    showSeal: item.styleConfig?.showSeal !== undefined ? item.styleConfig.showSeal : true
                }
            };
        });
        setHistory(migrated);
      } catch (e) {
        console.error("Failed to parse history", e);
        // If history is corrupt, clear it to prevent persistent crashes
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
        // Handle QuotaExceededError (name varies by browser)
        if (
          e.name === 'QuotaExceededError' || 
          e.name === 'NS_ERROR_DOM_QUOTA_REACHED' || 
          e.code === 22
        ) {
          console.warn("LocalStorage quota exceeded. Trimming history to fit.");
          
          if (items.length === 0) return;

          // Create a copy to modify
          const newItems = [...items];
          
          // Strategy: Find the oldest item (last in array)
          const oldestIndex = newItems.length - 1;
          const oldestItem = newItems[oldestIndex];

          // If the oldest item has an image, strip it first (user can regenerate)
          if (oldestItem.imageUrl) {
            newItems[oldestIndex] = { ...oldestItem, imageUrl: null };
            saveWithQuotaManagement(newItems); // Retry with stripped image
          } else {
            // If it has no image, remove the item entirely
            newItems.pop();
            saveWithQuotaManagement(newItems); // Retry with fewer items
          }
        } else {
          console.error("Failed to save history", e);
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
    existingId: string | null = null
  ) => {
    const timestamp = Date.now();
    
    if (existingId) {
      // Update existing
      setHistory(prev => prev.map(item => {
        if (item.id === existingId) {
            return { ...item, title, body, content, imageUrl, styleConfig: style, timestamp };
        }
        return item;
      }));
    } else {
      // Create new
      const id = timestamp.toString();
      const newItem: HistoryItem = {
        id,
        timestamp,
        title,
        body,
        content,
        imageUrl,
        styleConfig: style
      };
      // Add to top, keep max 10 items (reduced from 20 to prevent rapid quota usage)
      setHistory(prev => [newItem, ...prev].slice(0, 10));
      setCurrentId(id);
    }
  };

  const handleDeleteHistory = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
    if (currentId === id) {
        handleNew(); // Reset if deleting current
    }
  };

  const handleLoadHistory = (item: HistoryItem) => {
    setCurrentId(item.id);
    setInputTitle(item.title);
    setInputBody(item.body);
    // Ensure we are loading a styleConfig with a valid theme object
    const safeStyle = {
        ...item.styleConfig,
        theme: item.styleConfig.theme || THEMES[0],
        fontFamily: item.styleConfig.fontFamily || DEFAULT_STYLE.fontFamily,
        showSeal: item.styleConfig.showSeal !== undefined ? item.styleConfig.showSeal : true
    };
    setStyleConfig(safeStyle);
    setState({
      content: item.content,
      imageUrl: item.imageUrl,
      isGeneratingText: false,
      isGeneratingImage: false,
      error: null
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
    setState(prev => ({ ...prev, imageUrl: null }));
  };

  const handleGenerate = async () => {
    if (!inputTitle.trim() || !inputBody.trim()) return;

    setState(prev => ({ ...prev, isGeneratingText: true, error: null }));
    setCurrentId(null); 

    try {
      const content = await analyzeWarningText(inputTitle, inputBody);
      
      setState(prev => ({ ...prev, content, isGeneratingText: false, isGeneratingImage: false, imageUrl: null }));
      setStep(Step.PREVIEW);
      addToHistory(inputTitle, inputBody, content, null, styleConfig, null);

    } catch (error: any) {
      console.error(error);
      const errorMsg = error.message || "未知错误";
      
      // Explicit Alert for Mobile Users who might not see the error div
      alert(`生成失败: ${errorMsg}`);

      setState(prev => ({ 
        ...prev, 
        isGeneratingText: false, 
        isGeneratingImage: false, 
        error: errorMsg 
      }));
    }
  };

  const handleRegenerateImage = async () => {
    if (!state.content) return;
    setState(prev => ({ ...prev, isGeneratingImage: true }));
    try {
      const imageUrl = await generatePosterBackground(state.content.imagePrompt + ` variant ${Date.now()}`, styleConfig.theme, styleConfig.textureStyle);
      
      setState(prev => ({ ...prev, imageUrl, isGeneratingImage: false }));
      
      if (currentId && imageUrl) {
          addToHistory(inputTitle, inputBody, state.content, imageUrl, styleConfig, currentId);
      }
    } catch (error: any) {
       alert(`绘图失败: ${error.message}`);
       setState(prev => ({ ...prev, isGeneratingImage: false }));
    }
  };

  const handleDownloadImage = async () => {
    const element = document.getElementById('poster-capture-area');
    if (!element) {
        alert("找不到海报内容，无法下载");
        return;
    }

    try {
        // Calculate safe scale logic for Mobile Safari memory limits
        const w = styleConfig.widthScale;
        const h = styleConfig.heightScale;
        let targetScale = 2; // Default High Res
        
        // Safety check: iOS Safari canvas limit (approx 16MP, but lower is safer for processing)
        const totalPixels = (w * 2) * (h * 2);
        if (totalPixels > 6000000) { // If > 6MP, reduce scale
            targetScale = 1.5;
        }
        if (totalPixels > 10000000) { // If > 10MP, use 1:1
            targetScale = 1;
        }

        const canvas = await html2canvas(element, {
            scale: targetScale, 
            useCORS: true, 
            backgroundColor: null,
            logging: false,
            // CRITICAL FIX: Reset transforms on the clone. 
            // The original element is scaled via CSS transform for preview fitting.
            // We must capture it at 100% scale (none) to get the correct resolution.
            onclone: (clonedDoc) => {
                const el = clonedDoc.getElementById('poster-capture-area');
                if (el) {
                    el.style.transform = 'none';
                    el.style.margin = '0';
                    el.style.boxShadow = 'none'; // Optional: cleaner edge
                }
            }
        });

        const dataUrl = canvas.toDataURL('image/png');
        
        // Check for empty canvas
        if (dataUrl === 'data:,') throw new Error("Canvas data is empty");

        const link = document.createElement('a');
        link.download = `poster-${Date.now()}.png`;
        link.href = dataUrl;
        
        // Append to body is required for some mobile browsers to trigger click
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

    } catch (err: any) {
        console.error("Download failed", err);
        alert(`下载图片失败: ${err.message || "请稍后重试"}`);
    }
  };

  const handleBackToEdit = () => {
    setStep(Step.INPUT);
  };

  // Determine if we should show the preview pane on mobile
  // On Desktop it's always visible. On Mobile, only when content is generated.
  const hasContent = !!state.content;

  return (
    // Main Container: No Window Scroll, Inner Scroll Only.
    <div className="h-screen w-full flex flex-col lg:flex-row bg-[#050C1A] overflow-hidden">
      
      {/* 
         PREVIEW PANEL 
         Mobile: Order 1 (Top). Height depends on content (0 if inputting, 40vh if previewing).
         Desktop: Order 2 (Right). Height 100%.
      */}
      <div className={`
          relative z-10 bg-[#050C1A] transition-all duration-300 ease-in-out shadow-2xl
          order-1 lg:order-2
          w-full lg:w-[500px] flex-shrink-0
          ${hasContent ? 'h-[40vh] border-b border-white/10' : 'h-0 border-b-0'} lg:h-full lg:border-b-0 lg:border-l lg:border-white/10
          flex items-center justify-center
      `}>
         {/* Background Grid Pattern */}
         <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" 
              style={{ backgroundImage: 'radial-gradient(#1e3a8a 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
         </div>

         {/* Only render PosterCanvas if content exists. */}
         {/* If no content, on Desktop we show placeholder. On Mobile height is 0 so it's hidden. */}
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
            <div className="text-center opacity-40 px-4">
                <div className="w-24 h-32 border-2 border-dashed border-blue-500 rounded-lg mx-auto mb-4 flex items-center justify-center">
                    <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </div>
                <p className="text-blue-200 font-serif-sc">等待生成海报...</p>
                <p className="text-blue-400/50 text-xs mt-2">或从“历史记录”加载</p>
            </div>
         )}
      </div>

      {/* 
         CONTROLS PANEL
         Mobile: Order 2 (Bottom). Takes remaining height. Scrollable.
         Desktop: Order 1 (Left). Takes remaining width. Scrollable.
      */}
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
          
          availableThemes={THEMES}
          availableTextures={TEXTURE_STYLES}
        />
        {state.error && (
            <div className="mt-4 p-3 bg-red-900/50 text-red-200 text-sm rounded border border-red-800">
                {state.error}
            </div>
        )}
      </div>

      {/* FULL SCREEN ZOOM MODAL */}
      {isZoomed && state.content && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 lg:p-10">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/90 backdrop-blur-sm"
                onClick={() => setIsZoomed(false)}
            ></div>
            
            {/* Modal Content */}
            <div className="relative w-full h-full flex flex-col items-center justify-center pointer-events-none">
                {/* Close Button */}
                <button 
                    onClick={() => setIsZoomed(false)}
                    className="absolute top-0 right-0 lg:top-4 lg:right-4 z-50 p-2 text-white/70 hover:text-white bg-black/50 hover:bg-black/80 rounded-full transition-colors pointer-events-auto"
                >
                     <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Scaled Poster */}
                <div className="w-full h-full pointer-events-auto" onClick={(e) => e.stopPropagation()}>
                    <PosterCanvas 
                        id="poster-zoom-view" // Diff ID so we don't conflict with download
                        content={state.content}
                        imageUrl={state.imageUrl}
                        styleConfig={styleConfig}
                        isGeneratingImage={state.isGeneratingImage}
                    />
                </div>
            </div>
        </div>
      )}

    </div>
  );
}

export default App;