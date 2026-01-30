import React, { useState } from 'react';
import { PosterStyle, PosterContent, HistoryItem, PosterTheme } from '../types';
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

  // History
  history: HistoryItem[];
  onLoadHistory: (item: HistoryItem) => void;
  onDeleteHistory: (id: string) => void;

  // Actions
  onNew: () => void;
  onSave: () => void;
  onDownload: () => void;

  // Themes & Textures
  availableThemes: PosterTheme[];
  availableTextures: { id: string, name: string }[];
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
  onBackToEdit,
  history,
  onLoadHistory,
  onDeleteHistory,
  onNew,
  onSave,
  onDownload,
  availableThemes,
  availableTextures
}) => {
  const [activeTab, setActiveTab] = useState<'editor' | 'history'>('editor');

  const handleChange = (key: keyof PosterStyle, value: any) => {
    setStyleConfig(prev => ({ ...prev, [key]: value }));
  };

  // Render History Tab Content
  const renderHistory = () => (
    <div className="space-y-4">
        <h3 className="text-sm font-bold text-blue-200 uppercase tracking-wider mb-4">历史记录 ({history.length})</h3>
        {history.length === 0 ? (
            <div className="text-center py-10 text-blue-500/50 text-sm">
                暂无历史记录<br/>生成海报后会自动保存
            </div>
        ) : (
            <div className="space-y-3">
                {history.map((item) => (
                    <div key={item.id} className="bg-[#0a1628] border border-blue-800/50 rounded-lg p-3 hover:border-blue-600 transition-colors group">
                        <div className="flex justify-between items-start mb-2">
                            <h4 className="font-bold text-white text-sm line-clamp-1 font-serif-sc mr-2">{item.title || "无标题"}</h4>
                            <button 
                                onClick={(e) => { e.stopPropagation(); onDeleteHistory(item.id); }}
                                className="text-blue-500 hover:text-red-400 transition-colors p-1"
                                title="删除"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>
                        <p className="text-xs text-blue-400 mb-3">
                            {new Date(item.timestamp).toLocaleString()}
                        </p>
                        <button 
                            onClick={() => { onLoadHistory(item); setActiveTab('editor'); }}
                            className="w-full py-1.5 bg-blue-900/30 hover:bg-blue-800 text-blue-200 text-xs rounded border border-blue-800/50 transition-colors"
                        >
                            加载此海报
                        </button>
                    </div>
                ))}
            </div>
        )}
    </div>
  );

  // If we are in "Editor" tab but content is generated, showing the layout settings
  const renderPreviewControls = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-blue-900/50 pb-4">
        <h3 className="font-bold text-white font-serif-sc">版式微调</h3>
        <button 
            onClick={onBackToEdit}
            className="text-xs text-blue-300 hover:text-white underline decoration-blue-500"
        >
            返回编辑
        </button>
      </div>

      {/* Download Action */}
      <button 
        onClick={onDownload}
        className="w-full py-3 bg-gradient-to-r from-emerald-600 to-emerald-800 hover:from-emerald-500 hover:to-emerald-700 text-white font-bold rounded-lg shadow-lg shadow-emerald-900/40 transition-all flex items-center justify-center gap-2 mb-2"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4 4m4 4V4" />
        </svg>
        下载海报图片
      </button>

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

      {/* Color / Theme Selection */}
      <div className="space-y-2">
         <label className="text-xs font-semibold uppercase text-blue-400 tracking-wider">配色方案</label>
         <div className="grid grid-cols-4 gap-2">
            {availableThemes.map(theme => (
                <button
                    key={theme.id}
                    onClick={() => handleChange('theme', theme)}
                    className={`h-10 rounded border flex flex-col items-center justify-center transition-all ${styleConfig.theme?.id === theme.id ? 'border-white ring-2 ring-blue-500 scale-105' : 'border-white/10 opacity-70 hover:opacity-100'}`}
                    style={{ backgroundColor: theme.primaryColor }}
                    title={theme.name}
                >
                    <span 
                        className="text-[10px] font-bold" 
                        style={{ color: theme.secondaryColor }}
                    >
                        {theme.name}
                    </span>
                </button>
            ))}
         </div>
      </div>

      {/* Texture Style Selection */}
      <div className="space-y-2">
         <label className="text-xs font-semibold uppercase text-blue-400 tracking-wider">背景纹理</label>
         <div className="grid grid-cols-3 gap-2">
            {availableTextures && availableTextures.map(tex => (
                <button
                    key={tex.id}
                    onClick={() => handleChange('textureStyle', tex.id)}
                    className={`py-2 rounded border text-xs font-medium transition-all ${styleConfig.textureStyle === tex.id ? 'bg-blue-600 text-white border-blue-400 ring-1 ring-blue-300' : 'bg-[#0a1628] text-blue-300 border-blue-800 hover:border-blue-600'}`}
                >
                    {tex.name}
                </button>
            ))}
         </div>
      </div>

       {/* Actions */}
       <div className="pt-4 border-t border-blue-900/50 space-y-3">
            <button 
                onClick={onRegenerateImage}
                disabled={isGeneratingImage}
                className="w-full py-2 bg-blue-800/50 hover:bg-blue-800 text-blue-100 rounded-lg text-sm font-medium transition-colors border border-blue-700/50 flex items-center justify-center gap-2"
            >
                {isGeneratingImage ? (
                    <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        绘制中...
                    </>
                ) : (
                    '根据当前配置生成背景'
                )}
            </button>
            <button 
                onClick={onSave}
                className="w-full py-2 bg-blue-900 text-blue-100 hover:bg-blue-800 rounded-lg text-sm font-medium transition-colors border border-blue-700"
            >
                保存当前更改
            </button>
       </div>
    </div>
  );

  // Render Input Editor
  const renderInput = () => (
    <>
        <div className="flex items-center justify-between mb-4">
             <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <div className="p-1 bg-red-600 rounded shadow-lg shadow-red-900/50">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
                </div>
                <span className="font-serif-sc tracking-wide">
                    警示海报生成
                </span>
            </h2>
            <div className="flex gap-2">
                 <button onClick={onNew} className="text-xs px-2 py-1 bg-blue-900/50 hover:bg-blue-800 rounded text-blue-200 border border-blue-800">新建</button>
                 <button onClick={onSave} className="text-xs px-2 py-1 bg-blue-900/50 hover:bg-blue-800 rounded text-blue-200 border border-blue-800">保存草稿</button>
            </div>
        </div>
       
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
    </>
  );

  return (
    <div className="bg-[#111e36] rounded-xl shadow-lg border border-blue-900/50 h-full flex flex-col overflow-hidden">
        {/* Tab Header */}
        <div className="flex border-b border-blue-900/50 bg-[#0a1628]">
            <button 
                onClick={() => setActiveTab('editor')}
                className={`flex-1 py-3 text-sm font-bold tracking-wide transition-colors ${activeTab === 'editor' ? 'text-white bg-[#111e36] border-b-2 border-red-600' : 'text-blue-400 hover:text-blue-200'}`}
            >
                编辑设计
            </button>
            <button 
                onClick={() => setActiveTab('history')}
                className={`flex-1 py-3 text-sm font-bold tracking-wide transition-colors ${activeTab === 'history' ? 'text-white bg-[#111e36] border-b-2 border-red-600' : 'text-blue-400 hover:text-blue-200'}`}
            >
                历史记录
            </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            {activeTab === 'history' ? (
                renderHistory()
            ) : (
                content ? renderPreviewControls() : renderInput()
            )}
        </div>
        
        {/* Footer info only shown in editor */}
        {activeTab === 'editor' && content && (
            <div className="p-4 border-t border-blue-900/50 bg-[#111e36] text-xs text-blue-500 opacity-60">
                <p>样式说明: 标准公文风格，强调政治性与严肃性。</p>
            </div>
        )}
    </div>
  );
};