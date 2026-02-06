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
    name: '公安蓝',
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

const DEFAULT_STYLE: PosterStyle = {
  titleSize: 56,
  bodySize: 16,
  overlayOpacity: 0.2,
  textColor: '#000000',
  alignment: 'center',
  fontFamily: 'serif',
  widthScale: 600, // Default width in px
  heightScale: 960, // Default height in px
  theme: THEMES[0],
  textureStyle: 'clouds'
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
                    textureStyle: item.styleConfig?.textureStyle || 'clouds'
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

  // Save history to local storage whenever it changes
  useEffect(() => {
    try {
        localStorage.setItem('poster_history', JSON.stringify(history));
    } catch (e) {
        console.error("Failed to save history", e);
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
      // Add to top, keep max 20 items
      setHistory(prev => [newItem, ...prev].slice(0, 20));
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
    // The migration logic on mount should have fixed this, but double check
    const safeStyle = {
        ...item.styleConfig,
        theme: item.styleConfig.theme || THEMES[0]
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

  const handleGenerate = async () => {
    if (!inputTitle.trim() || !inputBody.trim()) return;

    setState(prev => ({ ...prev, isGeneratingText: true, error: null }));
    // Reset ID on new generation to ensure we don't overwrite history unless user explicitly saves over it later
    setCurrentId(null); 

    try {
      // 1. Analyze text structure (Title + Body)
      const content = await analyzeWarningText(inputTitle, inputBody);
      
      setState(prev => ({ ...prev, content, isGeneratingText: false, isGeneratingImage: true }));
      setStep(Step.PREVIEW);

      // 2. Generate Image (in parallel or sequence)
      // Pass the current theme and texture style
      const imageUrl = await generatePosterBackground(content.imagePrompt, styleConfig.theme, styleConfig.textureStyle);
      setState(prev => ({ ...prev, imageUrl, isGeneratingImage: false }));

      // 3. Auto-save to history on success (creates a NEW entry)
      addToHistory(inputTitle, inputBody, content, imageUrl, styleConfig, null);

    } catch (error) {
      console.error(error);
      setState(prev => ({ 
        ...prev, 
        isGeneratingText: false, 
        isGeneratingImage: false, 
        error: "Failed to generate content. Please try again." 
      }));
    }
  };

  const handleRegenerateImage = async () => {
    if (!state.content) return;
    setState(prev => ({ ...prev, isGeneratingImage: true }));
    try {
      // Pass the current theme and texture style
      const imageUrl = await generatePosterBackground(state.content.imagePrompt + ` variant ${Date.now()}`, styleConfig.theme, styleConfig.textureStyle);
      setState(prev => ({ ...prev, imageUrl, isGeneratingImage: false }));
    } catch (error) {
       setState(prev => ({ ...prev, isGeneratingImage: false }));
    }
  };

  const handleDownloadImage = async () => {
    const element = document.getElementById('poster-capture-area');
    if (!element) return;

    try {
        const canvas = await html2canvas(element, {
            scale: 2, // 2x for retina quality
            useCORS: true, // Allow cross-origin images (important for base64 or external images)
            backgroundColor: null,
        });

        const link = document.createElement('a');
        link.download = `poster-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    } catch (err) {
        console.error("Download failed", err);
        alert("下载图片失败，请重试");
    }
  };

  const handleBackToEdit = () => {
    setStep(Step.INPUT);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#050C1A]">
      {/* Left Panel: Controls (NOW MAIN, Flex-1) */}
      <div className="flex-1 min-w-0 p-4 lg:h-screen lg:overflow-y-auto z-20 order-1">
        <Controls 
          step={step} // Pass the current step status
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
          isGeneratingImage={state.isGeneratingImage}
          onBackToEdit={handleBackToEdit}
          
          // History Props
          history={history}
          onLoadHistory={handleLoadHistory}
          onDeleteHistory={handleDeleteHistory}
          
          // New Actions
          onNew={handleNew}
          onSave={handleManualSave}
          onDownload={handleDownloadImage}
          
          // Theme Props
          availableThemes={THEMES}
          availableTextures={TEXTURE_STYLES}
        />
        {state.error && (
            <div className="mt-4 p-3 bg-red-900/50 text-red-200 text-sm rounded border border-red-800">
                {state.error}
            </div>
        )}
      </div>

      {/* Right Panel: Preview (NOW SIDEBAR, Fixed Width) */}
      <div className="w-full lg:w-[500px] flex-shrink-0 flex items-center justify-center p-4 relative bg-[#050C1A] overflow-hidden order-2 border-l border-white/5">
         {/* Background Grid Pattern */}
         <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" 
              style={{ backgroundImage: 'radial-gradient(#1e3a8a 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
         </div>

         {/* Added Safety Check: Only render Canvas if content AND styleConfig exist */}
         {state.content && styleConfig ? (
            <PosterCanvas 
                content={state.content}
                imageUrl={state.imageUrl}
                styleConfig={styleConfig}
                isGeneratingImage={state.isGeneratingImage}
            />
         ) : (
            <div className="text-center opacity-40">
                <div className="w-24 h-32 border-2 border-dashed border-blue-500 rounded-lg mx-auto mb-4 flex items-center justify-center">
                    <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </div>
                <p className="text-blue-200 font-serif-sc">等待生成海报...</p>
                <p className="text-blue-400/50 text-xs mt-2">或从左侧“历史记录”加载</p>
            </div>
         )}
      </div>
    </div>
  );
}

export default App;