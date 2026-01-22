import React, { useState } from 'react';
import { Controls } from './components/Controls';
import { PosterCanvas } from './components/PosterCanvas';
import { PosterContent, PosterState, PosterStyle, Step } from './types';
import { analyzeWarningText, generatePosterBackground } from './services/geminiService';

const DEFAULT_STYLE: PosterStyle = {
  titleSize: 56,
  bodySize: 16,
  overlayOpacity: 0.2,
  textColor: '#000000',
  alignment: 'center',
  fontFamily: 'serif',
  widthScale: 600, // Default width in px
  heightScale: 960, // Default height in px
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

  const handleGenerate = async () => {
    if (!inputTitle.trim() || !inputBody.trim()) return;

    setState(prev => ({ ...prev, isGeneratingText: true, error: null }));

    try {
      // 1. Analyze text structure (Title + Body)
      const content = await analyzeWarningText(inputTitle, inputBody);
      
      setState(prev => ({ ...prev, content, isGeneratingText: false, isGeneratingImage: true }));
      setStep(Step.PREVIEW);

      // 2. Generate Image (in parallel or sequence)
      const imageUrl = await generatePosterBackground(content.imagePrompt);
      setState(prev => ({ ...prev, imageUrl, isGeneratingImage: false }));

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
      const imageUrl = await generatePosterBackground(state.content.imagePrompt + ` variant ${Date.now()}`);
      setState(prev => ({ ...prev, imageUrl, isGeneratingImage: false }));
    } catch (error) {
       setState(prev => ({ ...prev, isGeneratingImage: false }));
    }
  };

  const handleBackToEdit = () => {
    // Preserve inputTitle and inputBody, but clear generated content
    setState(prev => ({ ...prev, content: null, imageUrl: null, error: null }));
    setStep(Step.INPUT);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#050C1A]">
      {/* Left Panel: Controls */}
      <div className="w-full lg:w-[400px] flex-shrink-0 p-4 lg:h-screen lg:overflow-y-auto z-20">
        <Controls 
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
        />
        {state.error && (
            <div className="mt-4 p-3 bg-red-900/50 text-red-200 text-sm rounded border border-red-800">
                {state.error}
            </div>
        )}
      </div>

      {/* Right Panel: Preview */}
      <div className="flex-1 flex items-center justify-center p-4 lg:p-10 relative bg-[#050C1A] overflow-hidden">
         {/* Background Grid Pattern */}
         <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" 
              style={{ backgroundImage: 'radial-gradient(#1e3a8a 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
         </div>

         {state.content ? (
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
            </div>
         )}
      </div>
    </div>
  );
}

export default App;