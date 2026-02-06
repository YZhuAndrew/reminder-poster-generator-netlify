import React, { useRef, useState, useLayoutEffect } from 'react';
import { PosterContent, PosterStyle, PosterTheme } from '../types';

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
  const theme = styleConfig.theme || {} as Partial<PosterTheme>; // Fallback to empty object casted to Partial type
  
  // Safe accessors
  const primaryColor = theme.primaryColor || '#DE2910';
  const secondaryColor = theme.secondaryColor || '#FFFF00';
  const backgroundColor = theme.backgroundColor || '#FFFBF0';
  const accentColor = theme.accentColor || '#DE2910';

  const footerSize = Math.max(10, Math.round((styleConfig.bodySize || 16) * 0.6));
  
  // Logical dimensions from config (pixels)
  const logicalW = styleConfig.widthScale > 100 ? styleConfig.widthScale : 600;
  const logicalH = styleConfig.heightScale > 100 ? styleConfig.heightScale : 960;

  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const calculateScale = () => {
        if (!containerRef.current) return;
        const parent = containerRef.current;
        const availableW = parent.clientWidth - 40; 
        const availableH = parent.clientHeight - 40;
        if (availableW <= 0 || availableH <= 0) return;
        const scaleX = availableW / logicalW;
        const scaleY = availableH / logicalH;
        setScale(Math.min(scaleX, scaleY));
    };
    calculateScale();
    window.addEventListener('resize', calculateScale);
    return () => window.removeEventListener('resize', calculateScale);
  }, [logicalW, logicalH]);

  return (
    <div ref={containerRef} className="w-full h-full flex items-center justify-center overflow-hidden">
      <div 
        id="poster-capture-area"
        className="relative shadow-2xl overflow-hidden text-black flex-shrink-0 transition-[width,height,background-color] duration-200 ease-out"
        style={{ 
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            width: `${logicalW}px`,
            height: `${logicalH}px`,
            transform: `scale(${scale})`,
            transformOrigin: 'center center',
            backgroundColor: primaryColor 
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
          <div 
            className="absolute inset-0 z-0 flex items-center justify-center"
            style={{ 
                background: `linear-gradient(to bottom, ${primaryColor}, #000000)`
            }}
          >
             {isGeneratingImage && (
                <div className="animate-spin w-8 h-8 border-4 border-current border-t-transparent rounded-full" style={{ color: secondaryColor }}></div>
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
                        color: secondaryColor,
                        textShadow: '2px 2px 4px rgba(0,0,0,0.5), 0 0 10px rgba(0,0,0,0.2)',
                        fontFamily: '"Noto Serif SC", serif',
                        lineHeight: 1.2,
                        wordBreak: 'break-word',
                    }}
                >
                    {content.headline}
                </h1>
            </div>

            {/* 2. White "Paper" Content Box */}
            <div 
                className="flex-1 w-full rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.3)] p-8 relative flex flex-col overflow-hidden transition-colors duration-300"
                style={{ backgroundColor: backgroundColor }}
            >
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
                        className={`mt-4 pt-4 border-t text-center font-bold ${fontFamilyClass} flex-shrink-0`} 
                        style={{ 
                            fontSize: `${footerSize}px`,
                            color: accentColor, 
                            borderColor: `${accentColor}33`
                        }}
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
          background: ${accentColor};
          border-radius: 4px;
          opacity: 0.2;
        }

        /* 
           CRITICAL FIX for Body Size Slider:
           Force all generic text elements to inherit the font-size set on the parent .rich-text-content div.
           This overrides browser defaults and any inline styles that might have been pasted in.
        */
        .rich-text-content * {
            font-size: inherit !important;
            line-height: inherit;
        }

        /* Re-establish relative sizing for Headers so they scale PROPORTIONALLY to the slider */
        .rich-text-content h2 {
            font-size: 2em !important;
            line-height: 1.3;
            margin-top: 0.8em;
            margin-bottom: 0.4em;
            font-weight: 900;
            color: ${accentColor};
        }
        .rich-text-content h3 {
            font-size: 1.5em !important;
            line-height: 1.3;
            margin-top: 0.6em;
            margin-bottom: 0.3em;
            font-weight: 800;
        }
        
        .rich-text-content p {
            margin-bottom: 0.8em;
        }
        .rich-text-content b, .rich-text-content strong {
            font-weight: 900;
        }
        .rich-text-content ul, .rich-text-content ol {
            margin-bottom: 0.8em;
        }
      `}</style>
    </div>
  );
};