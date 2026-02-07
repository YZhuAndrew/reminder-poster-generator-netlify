import React, { useRef, useState, useLayoutEffect } from 'react';
import { PosterContent, PosterStyle, PosterTheme } from '../types';

interface PosterCanvasProps {
  id?: string;
  content: PosterContent;
  imageUrl: string | null;
  styleConfig: PosterStyle;
  isGeneratingImage: boolean;
  onClick?: () => void;
}

export const PosterCanvas: React.FC<PosterCanvasProps> = ({ 
  id = "poster-capture-area",
  content, 
  imageUrl, 
  styleConfig, 
  isGeneratingImage,
  onClick
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
        // Use clientWidth/Height of the parent container
        const availableW = parent.clientWidth - 40; // 20px padding each side
        const availableH = parent.clientHeight - 40;
        
        if (availableW <= 0 || availableH <= 0) return;
        
        const scaleX = availableW / logicalW;
        const scaleY = availableH / logicalH;
        // Fit to contain
        setScale(Math.min(scaleX, scaleY));
    };

    calculateScale();
    
    // Add ResizeObserver to react to container resizing (e.g., mobile split view open/close)
    const observer = new ResizeObserver(() => {
        calculateScale();
    });

    if (containerRef.current) {
        observer.observe(containerRef.current);
    }

    window.addEventListener('resize', calculateScale);
    return () => {
        window.removeEventListener('resize', calculateScale);
        observer.disconnect();
    };
  }, [logicalW, logicalH]);

  // --- Background Pattern Renderers ---
  const renderBackgroundPattern = () => {
      // Common opacity layer for texture
      const commonOverlay = (
        <div className="absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none z-0"
            style={{
                filter: 'contrast(120%) brightness(120%)',
                backgroundImage: 'url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPSc0JyBoZWlnaHQ9JzQnPgo8cmVjdCB3aWR0aD0nNCcgaGVpZ2h0PSc0JyBmaWxsPScjZmZmJy8+CjxyZWN0IHdpZHRoPScxJyBoZWlnaHQ9JzEnIGZpbGw9JyNjY2MnLz4KPC9zdmc+")'
            }}
        ></div>
      );

      switch (styleConfig.textureStyle) {
        case 'clouds':
            return (
                <>
                    <div className="absolute inset-0 opacity-20 pointer-events-none" 
                        style={{
                            backgroundImage: `
                                radial-gradient(circle at 10% 20%, ${secondaryColor} 0%, transparent 20%),
                                radial-gradient(circle at 90% 80%, ${secondaryColor} 0%, transparent 20%),
                                radial-gradient(circle at 50% 50%, white 0%, transparent 40%)
                            `,
                            filter: 'blur(40px)'
                        }}
                    ></div>
                    {/* SVG Cloud Pattern */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 30c0-5.5 4.5-10 10-10s10 4.5 10 10c0 5.5-4.5 10-10 10s-10-4.5-10-10z' fill='white' fill-opacity='0.4'/%3E%3Cpath d='M10 10c0-5.5 4.5-10 10-10s10 4.5 10 10c0 5.5-4.5 10-10 10S10 15.5 10 10z' fill='white' fill-opacity='0.4'/%3E%3C/svg%3E")`,
                            backgroundSize: '120px 120px'
                        }}
                    ></div>
                    {commonOverlay}
                </>
            );
        case 'mountains':
            return (
                <>
                     <div className="absolute inset-0 opacity-30 pointer-events-none" 
                        style={{
                            background: `linear-gradient(to bottom, transparent 40%, ${primaryColor} 100%)`
                        }}
                    ></div>
                    <svg className="absolute bottom-0 left-0 w-full h-[40%] opacity-20 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                         <path d="M0 100 L30 40 L60 100 Z" fill="white" />
                         <path d="M40 100 L70 50 L100 100 Z" fill="white" />
                         <path d="M-20 100 L20 70 L60 100 Z" fill="white" opacity="0.7"/>
                    </svg>
                    {commonOverlay}
                </>
            );
        case 'bamboo':
             return (
                <>
                    <div className="absolute inset-0 opacity-10 pointer-events-none"
                        style={{
                             backgroundImage: `linear-gradient(90deg, transparent 95%, ${secondaryColor} 96%, ${secondaryColor} 98%, transparent 99%)`,
                             backgroundSize: '80px 100%'
                        }}
                    ></div>
                    <svg className="absolute bottom-0 right-0 w-[40%] h-[60%] opacity-10 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                         <path d="M80 100 Q 85 50 80 0" stroke="white" strokeWidth="2" fill="none" />
                         <path d="M60 100 Q 65 60 60 10" stroke="white" strokeWidth="1.5" fill="none" />
                         <path d="M80 80 L90 75 M80 60 L70 55 M60 40 L50 35" stroke="white" strokeWidth="1" fill="none" />
                    </svg>
                    {commonOverlay}
                </>
             );
        case 'geometric':
            return (
                <>
                     <div className="absolute inset-0 opacity-10 pointer-events-none"
                        style={{
                            backgroundImage: `linear-gradient(45deg, ${secondaryColor} 25%, transparent 25%, transparent 75%, ${secondaryColor} 75%, ${secondaryColor}), linear-gradient(45deg, ${secondaryColor} 25%, transparent 25%, transparent 75%, ${secondaryColor} 75%, ${secondaryColor})`,
                            backgroundSize: '40px 40px',
                            backgroundPosition: '0 0, 20px 20px'
                        }}
                     ></div>
                     <div className="absolute inset-0 opacity-30 bg-gradient-to-br from-transparent via-transparent to-black pointer-events-none"></div>
                     {commonOverlay}
                </>
            );
        case 'city':
             return (
                <>
                    <div className="absolute inset-0 opacity-10 pointer-events-none" 
                        style={{
                            background: `repeating-linear-gradient(0deg, transparent, transparent 19px, ${secondaryColor} 20px)`
                        }}
                    ></div>
                    <div className="absolute bottom-0 left-0 right-0 h-[20%] opacity-20 pointer-events-none flex items-end justify-between px-4">
                         <div className="w-[10%] h-[80%] bg-white"></div>
                         <div className="w-[15%] h-[60%] bg-white"></div>
                         <div className="w-[10%] h-[90%] bg-white"></div>
                         <div className="w-[12%] h-[50%] bg-white"></div>
                         <div className="w-[15%] h-[70%] bg-white"></div>
                         <div className="w-[8%] h-[40%] bg-white"></div>
                         <div className="w-[10%] h-[85%] bg-white"></div>
                    </div>
                    {commonOverlay}
                </>
             );
        default: // paper or default
             return (
                <>
                    <div className="absolute inset-0 opacity-20 pointer-events-none" 
                         style={{ 
                            backgroundImage: `radial-gradient(${secondaryColor} 1px, transparent 1px)`, 
                            backgroundSize: '30px 30px' 
                         }} 
                    ></div>
                    {commonOverlay}
                </>
             );
      }
  };

  return (
    <div ref={containerRef} className="w-full h-full flex items-center justify-center overflow-hidden">
      <div 
        id={id}
        onClick={onClick}
        className={`relative shadow-2xl overflow-hidden text-black flex-shrink-0 transition-[width,height,background-color] duration-200 ease-out ${onClick ? 'cursor-zoom-in hover:shadow-emerald-500/20' : ''}`}
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
            className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden"
            style={{ 
                background: `linear-gradient(135deg, ${primaryColor}, #000000)`
            }}
          >
             {/* Dynamic CSS/SVG Pattern */}
             {renderBackgroundPattern()}

             {isGeneratingImage && (
                <div className="absolute inset-0 flex items-center justify-center z-50 bg-black/30 backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-3">
                        <div className="animate-spin w-12 h-12 border-4 border-white/20 border-t-white rounded-full shadow-lg"></div>
                        <div className="text-white font-bold text-sm tracking-wider">AI 绘图中...</div>
                    </div>
                </div>
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
                        style={{ 
                            fontSize: `${styleConfig.bodySize}px`,
                            fontFamily: styleConfig.fontFamily 
                        }}
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
                {styleConfig.showSeal && (
                <div className="absolute bottom-6 right-6 z-30 transform rotate-[-5deg] pointer-events-none">
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
                                {/* Use rgba instead of mix-blend-mode for broader compatibility (html2canvas) */}
                                <rect x="10" y="10" width="180" height="180" rx="25" ry="25" fill="rgba(216, 30, 6, 0.75)" />
                                <rect x="20" y="20" width="160" height="160" rx="18" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeDasharray="10 5" />
                                <text x="100" y="92" textAnchor="middle" fill="white" fontFamily="'Noto Serif SC', serif" fontWeight="900" fontSize="60" letterSpacing="6">横税</text>
                                <text x="100" y="165" textAnchor="middle" fill="white" fontFamily="'Noto Serif SC', serif" fontWeight="900" fontSize="60" letterSpacing="6">纪检</text>
                            </g>
                        </svg>
                     </div>
                </div>
                )}
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
            /* Allow font-family to inherit from parent */
            font-family: inherit;
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