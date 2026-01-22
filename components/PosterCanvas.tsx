import React, { useRef, useState, useLayoutEffect } from 'react';
import { PosterContent, PosterStyle } from '../types';

interface PosterCanvasProps {
  content: PosterContent;
  imageUrl: string | null;
  styleConfig: PosterStyle;
  isGeneratingImage: boolean;
}

export const PosterCanvas: React.FC<PosterCanvasProps> = ({ 
  content, 
  imageUrl, 
  styleConfig, 
  isGeneratingImage 
}) => {
  const fontFamilyClass = 'font-serif-sc'; 
  const footerSize = Math.max(10, Math.round(styleConfig.bodySize * 0.6));
  
  // Logical dimensions from config (pixels)
  // Fallback to reasonable defaults if state was initialized with old values
  const logicalW = styleConfig.widthScale > 100 ? styleConfig.widthScale : 600;
  const logicalH = styleConfig.heightScale > 100 ? styleConfig.heightScale : 960;

  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const calculateScale = () => {
        if (!containerRef.current) return;
        const parent = containerRef.current;
        
        // Available space with some padding
        const availableW = parent.clientWidth - 40; 
        const availableH = parent.clientHeight - 40;

        if (availableW <= 0 || availableH <= 0) return;

        // Determine scale needed to fit logical dimensions into available space
        const scaleX = availableW / logicalW;
        const scaleY = availableH / logicalH;
        
        // Use the smaller scale to ensure it fits both dimensions (contain)
        const newScale = Math.min(scaleX, scaleY);
        
        // Limit max scale to 1.2 to avoid getting too pixelated if window is huge, 
        // but allow it to shrink as much as needed.
        setScale(newScale);
    };

    calculateScale();
    window.addEventListener('resize', calculateScale);
    return () => window.removeEventListener('resize', calculateScale);
  }, [logicalW, logicalH]);

  return (
    <div ref={containerRef} className="w-full h-full flex items-center justify-center overflow-hidden">
      <div 
        id="poster-capture-area"
        className="relative bg-[#DE2910] shadow-2xl overflow-hidden text-black flex-shrink-0 transition-[width,height] duration-200 ease-out"
        style={{ 
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            width: `${logicalW}px`,
            height: `${logicalH}px`,
            transform: `scale(${scale})`,
            transformOrigin: 'center center',
        }}
      >
        {/* Background Image Layer */}
        {imageUrl ? (
            <img 
              src={imageUrl} 
              alt="Background Texture" 
              className="absolute inset-0 w-full h-full object-cover z-0 opacity-100"
              crossOrigin="anonymous" 
            />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-[#ff4d4d] to-[#b30000] z-0 flex items-center justify-center">
             {isGeneratingImage && (
                <div className="animate-spin text-yellow-400 w-8 h-8 border-4 border-current border-t-transparent rounded-full"></div>
             )}
          </div>
        )}

        {/* Layout Container */}
        <div className="absolute inset-0 z-10 flex flex-col items-center p-4 pt-8 pb-8">
            
            {/* 1. Header Title */}
            <div className="w-full mb-6 z-20 text-center flex items-center justify-center flex-shrink-0 px-4">
                <h1 
                    className={`font-black ${fontFamilyClass} text-center`}
                    style={{ 
                        fontSize: `${styleConfig.titleSize}px`,
                        color: '#FFFF00', // Gold
                        textShadow: '2px 2px 4px #8B0000, 0 0 10px rgba(255,215,0,0.5)',
                        fontFamily: '"Noto Serif SC", serif',
                        lineHeight: 1.2,
                        wordBreak: 'break-word',
                    }}
                >
                    {content.headline}
                </h1>
            </div>

            {/* 2. White "Paper" Content Box */}
            <div className="flex-1 w-full bg-[#FFFBF0] rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.3)] p-8 relative flex flex-col overflow-hidden">
                
                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    
                    {/* Main Body (Rich Text Render) */}
                    <div 
                        className={`text-slate-900 leading-relaxed text-justify ${fontFamilyClass} rich-text-content`} 
                        style={{ fontSize: `${styleConfig.bodySize}px` }}
                        dangerouslySetInnerHTML={{ __html: content.bodyText }}
                    >
                    </div>

                </div>

                {/* Footer Greeting */}
                {content.footer && (
                    <div 
                        className={`mt-4 pt-4 border-t border-[#DE2910]/20 text-center font-bold text-[#DE2910] ${fontFamilyClass} flex-shrink-0`} 
                        style={{ fontSize: `${footerSize}px` }}
                    >
                        {content.footer}
                    </div>
                )}

                {/* Decorative "Seal" */}
                <div className="absolute bottom-6 right-6 z-30 opacity-95 transform rotate-[-5deg] mix-blend-multiply pointer-events-none">
                     <div className="w-24 h-24 relative transition-all duration-300">
                        <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-sm">
                            <defs>
                                <filter id="stampNoise">
                                    <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="3" stitchTiles="stitch" />
                                    <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 20 -10" />
                                    <feComposite operator="in" in2="SourceGraphic" />
                                </filter>
                                <mask id="grungeMask">
                                    <rect width="100%" height="100%" fill="white" />
                                    <rect width="100%" height="100%" fill="black" filter="url(#stampNoise)" opacity="0.4" />
                                </mask>
                            </defs>
                            
                            <g mask="url(#grungeMask)">
                                <rect x="10" y="10" width="180" height="180" rx="25" ry="25" fill="#D81E06" />
                                <rect x="20" y="20" width="160" height="160" rx="18" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeDasharray="10 5" />
                                <text x="100" y="92" textAnchor="middle" fill="white" fontFamily="'Noto Serif SC', serif" fontWeight="900" fontSize="60" letterSpacing="6">横税</text>
                                <text x="100" y="165" textAnchor="middle" fill="white" fontFamily="'Noto Serif SC', serif" fontWeight="900" fontSize="60" letterSpacing="6">纪检</text>
                            </g>
                        </svg>
                     </div>
                </div>
            </div>

        </div>
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #DE2910;
          border-radius: 4px;
          opacity: 0.2;
        }
        .rich-text-content p {
            margin-bottom: 0.5em;
        }
        .rich-text-content b, .rich-text-content strong {
            font-weight: 900;
        }
      `}</style>
    </div>
  );
};