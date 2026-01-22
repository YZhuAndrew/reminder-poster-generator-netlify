import React from 'react';
import { PosterStyle, PosterContent } from '../types';
import { SimpleEditor } from './SimpleEditor';

interface ControlsProps {
  inputTitle: string;
  setInputTitle: (val: string) => void;
  inputBody: string;
  setInputBody: (val: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  
  // Style Controls
  styleConfig: PosterStyle;
  setStyleConfig: React.Dispatch<React.SetStateAction<PosterStyle>>;
  content: PosterContent | null;
  onRegenerateImage: () => void;
  isGeneratingImage: boolean;
  onBackToEdit: () => void;
}

export const Controls: React.FC<ControlsProps> = ({
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
  isGeneratingImage,
  onBackToEdit
}) => {
  const handleChange = (key: keyof PosterStyle, value: any) => {
    setStyleConfig(prev => ({ ...prev, [key]: value }));
  };

  if (!content) {
    return (
      <div className="bg-[#111e36] p-6 rounded-xl shadow-lg border border-blue-900/50">
        <h2 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
            <div className="p-1 bg-red-600 rounded shadow-lg shadow-red-900/50">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
            </div>
            <span className="font-serif-sc tracking-wide">
                红头文件/海报生成
            </span>
        </h2>
        <p className="text-blue-200 mb-4 text-sm opacity-80 leading-relaxed">
          请输入标题和正文内容。使用编辑器自定义正文格式。<br/>
          <span className="text-xs text-blue-400">支持：节日纪律、安全生产、廉洁提醒等场景。</span>
        </p>
        
        <div className="space-y-4 mb-4">
            <div>
                <label className="block text-xs font-semibold text-blue-300 mb-1 uppercase tracking-wider">标题 (Title)</label>
                <input
                    value={inputTitle}
                    onChange={(e) => setInputTitle(e.target.value)}
                    placeholder="例如：节日纪律提醒"
                    className="w-full bg-[#0a1628] border border-blue-800 rounded-lg p-3 text-white focus:ring-2 focus:ring-red-600 focus:border-transparent focus:outline-none font-serif-sc font-bold text-lg placeholder-blue-700/50"
                />
            </div>
            <div>
                <label className="block text-xs font-semibold text-blue-300 mb-1 uppercase tracking-wider">正文 (Content)</label>
                <SimpleEditor
                  value={inputBody}
                  onChange={(html) => setInputBody(html)}
                  placeholder="请输入正文内容..."
                  className="w-full h-64"
                />
            </div>
        </div>

        <button
          onClick={onGenerate}
          disabled={isGenerating || !inputBody.trim()}
          className={`w-full py-3 rounded-lg font-bold text-lg transition-all shadow-lg ${
            isGenerating || !inputBody.trim()
              ? 'bg-slate-700 cursor-not-allowed text-slate-400'
              : 'bg-gradient-to-r from-[#DE2910] to-[#b30000] hover:from-red-600 hover:to-red-800 text-white shadow-red-900/40 ring-1 ring-white/10'
          }`}
        >
          {isGenerating ? '正在排版生成...' : '生成正式海报'}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#111e36] p-6 rounded-xl shadow-lg border border-blue-900/50 space-y-6 h-full overflow-y-auto">
      <div className="flex justify-between items-center border-b border-blue-900/50 pb-4">
        <h3 className="font-bold text-white font-serif-sc">版式微调</h3>
        <button 
            onClick={onBackToEdit}
            className="text-xs text-blue-300 hover:text-white underline decoration-blue-500"
        >
            返回编辑
        </button>
      </div>

      {/* Layout Settings */}
      <div className="space-y-4">
        <label className="text-xs font-semibold uppercase text-blue-400 tracking-wider">画布尺寸 (像素)</label>
        
        {/* Width Slider */}
        <div>
            <div className="flex justify-between mb-1">
                <span className="text-sm text-blue-200">宽度 (Width)</span>
                <span className="text-xs text-blue-400">{styleConfig.widthScale}px</span>
            </div>
            <input 
                type="range" min="300" max="1200" step="10"
                value={styleConfig.widthScale} 
                onChange={(e) => handleChange('widthScale', Number(e.target.value))}
                className="w-full accent-red-600 h-2 bg-blue-900 rounded-lg appearance-none cursor-pointer"
            />
        </div>

        {/* Height Slider */}
        <div>
            <div className="flex justify-between mb-1">
                <span className="text-sm text-blue-200">高度 (Height)</span>
                <span className="text-xs text-blue-400">{styleConfig.heightScale}px</span>
            </div>
            <input 
                type="range" min="500" max="2500" step="10"
                value={styleConfig.heightScale} 
                onChange={(e) => handleChange('heightScale', Number(e.target.value))}
                className="w-full accent-red-600 h-2 bg-blue-900 rounded-lg appearance-none cursor-pointer"
            />
            <p className="text-[10px] text-blue-500 mt-1">
                * 若文字显示不全，请拉大高度直至没有滚动条。
            </p>
        </div>
      </div>

      <div className="w-full h-px bg-blue-900/50"></div>

      {/* Text Settings */}
      <div className="space-y-4">
        <label className="text-xs font-semibold uppercase text-blue-400 tracking-wider">字号调整</label>
        
        <div className="space-y-4">
            <div>
                <div className="flex justify-between mb-1">
                    <span className="text-sm text-blue-200">大标题 (Head)</span>
                    <span className="text-xs text-blue-400">{styleConfig.titleSize}px</span>
                </div>
                <input 
                    type="range" min="32" max="100" 
                    value={styleConfig.titleSize} 
                    onChange={(e) => handleChange('titleSize', Number(e.target.value))}
                    className="w-full accent-red-600 h-2 bg-blue-900 rounded-lg appearance-none cursor-pointer"
                />
            </div>
            <div>
                <div className="flex justify-between mb-1">
                    <span className="text-sm text-blue-200">正文基准 (Body Base)</span>
                    <span className="text-xs text-blue-400">{styleConfig.bodySize}px</span>
                </div>
                <input 
                    type="range" min="12" max="32" 
                    value={styleConfig.bodySize} 
                    onChange={(e) => handleChange('bodySize', Number(e.target.value))}
                    className="w-full accent-red-600 h-2 bg-blue-900 rounded-lg appearance-none cursor-pointer"
                />
            </div>
        </div>
      </div>

      {/* Color Info (Read Only mostly, as style is fixed) */}
      <div className="space-y-2">
         <label className="text-xs font-semibold uppercase text-blue-400 tracking-wider">配色方案</label>
         <div className="flex gap-2">
            <div className="h-8 flex-1 bg-[#DE2910] rounded border border-white/10 flex items-center justify-center text-[10px] text-white/80">中国红</div>
            <div className="h-8 flex-1 bg-[#FFFF00] rounded border border-white/10 flex items-center justify-center text-[10px] text-black/80 font-bold">党徽金</div>
            <div className="h-8 flex-1 bg-[#FFFBF0] rounded border border-white/10 flex items-center justify-center text-[10px] text-black/80">米白纸</div>
         </div>
      </div>

       {/* Actions */}
       <div className="pt-4 border-t border-blue-900/50 space-y-3">
            <button 
                onClick={onRegenerateImage}
                disabled={isGeneratingImage}
                className="w-full py-2 bg-blue-800/50 hover:bg-blue-800 text-blue-100 rounded-lg text-sm font-medium transition-colors border border-blue-700/50"
            >
                {isGeneratingImage ? '正在绘制纹理...' : '更换红金底纹'}
            </button>
       </div>
       
       <div className="text-xs text-blue-500 mt-4 opacity-60">
        <p>样式说明: <br/>标准公文风格，强调政治性与严肃性。标题采用书法字体，正文采用宋体。</p>
       </div>

    </div>
  );
};