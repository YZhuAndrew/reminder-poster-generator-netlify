import React, { useRef, useEffect } from 'react';

interface SimpleEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  fontFamily?: string;
}

export const SimpleEditor: React.FC<SimpleEditorProps> = ({ value, onChange, placeholder, className, fontFamily }) => {
  const contentRef = useRef<HTMLDivElement>(null);

  // Initial load
  useEffect(() => {
    if (contentRef.current && value && contentRef.current.innerHTML === '') {
        contentRef.current.innerHTML = value;
    }
  }, []);

  // Sync external value to internal content
  useEffect(() => {
    if (contentRef.current && document.activeElement !== contentRef.current) {
        if (contentRef.current.innerHTML !== value) {
            contentRef.current.innerHTML = value;
        }
    }
  }, [value]);

  const exec = (command: string, value: string | undefined = undefined) => {
    // Force CSS styles for better rendering fidelity (spans vs font tags)
    document.execCommand('styleWithCSS', false, 'true');
    
    // Handle special commands
    if (command === 'createLink') {
        const url = prompt('Enter link URL:', 'http://');
        if (url) document.execCommand(command, false, url);
    } else {
        document.execCommand(command, false, value);
    }
    
    if (contentRef.current) {
      onChange(contentRef.current.innerHTML);
    }
    contentRef.current?.focus();
  };

  const handleInput = () => {
    if (contentRef.current) {
      onChange(contentRef.current.innerHTML);
    }
  };

  const ToolbarButton = ({ cmd, arg, icon, label, activeColor, wide }: any) => (
    <button
      onMouseDown={(e) => { 
        e.preventDefault(); 
        exec(cmd, arg); 
      }}
      className={`
        flex items-center justify-center rounded hover:bg-slate-200 text-slate-700 transition-colors
        ${wide ? 'px-2 py-1.5' : 'w-8 h-8'}
        ${activeColor ? activeColor : ''}
      `}
      title={label}
    >
      {icon}
    </button>
  );

  const Divider = () => <div className="w-px h-5 bg-slate-300 mx-1"></div>;

  return (
    <div className={`flex flex-col border border-blue-800 rounded-lg overflow-hidden bg-[#FFFBF0] shadow-inner ${className}`}>
      
      {/* Enhanced Toolbar */}
      <div className="flex flex-col gap-1 p-2 bg-slate-100 border-b border-slate-300">
        
        {/* Row 1: Basic Formatting & Structure */}
        <div className="flex flex-wrap items-center gap-1">
            <ToolbarButton cmd="bold" icon={<b className="font-serif text-lg">B</b>} label="加粗" />
            <ToolbarButton cmd="italic" icon={<i className="font-serif text-lg">I</i>} label="斜体" />
            <ToolbarButton cmd="underline" icon={<u className="font-serif text-lg">U</u>} label="下划线" />
            
            <Divider />
            
            <ToolbarButton cmd="justifyLeft" icon={
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="17" y1="10" x2="3" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="17" y1="18" x2="3" y2="18"></line></svg>
            } label="左对齐" />
            <ToolbarButton cmd="justifyCenter" icon={
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="21" y1="10" x2="3" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="21" y1="18" x2="3" y2="18"></line></svg>
            } label="居中" />

            <Divider />

            <ToolbarButton cmd="formatBlock" arg="H2" wide icon={<span className="font-bold text-sm">大标题</span>} label="大标题 (H2)" />
            <ToolbarButton cmd="formatBlock" arg="H3" wide icon={<span className="font-bold text-xs">小标题</span>} label="小标题 (H3)" />
            <ToolbarButton cmd="formatBlock" arg="P" wide icon={<span className="text-xs">正文</span>} label="普通正文" />
        </div>

        {/* Row 2: Colors & Extras */}
        <div className="flex flex-wrap items-center gap-1 pt-1 border-t border-slate-200 mt-1">
            <span className="text-[10px] text-slate-400 uppercase tracking-wide mr-1">文字颜色</span>
            
            <ToolbarButton cmd="foreColor" arg="#DE2910" icon={<div className="w-5 h-5 bg-[#DE2910] rounded shadow-sm border border-slate-300"></div>} label="中国红" />
            <ToolbarButton cmd="foreColor" arg="#000000" icon={<div className="w-5 h-5 bg-black rounded shadow-sm border border-slate-300"></div>} label="黑色" />
            <ToolbarButton cmd="foreColor" arg="#D4AF37" icon={<div className="w-5 h-5 bg-[#D4AF37] rounded shadow-sm border border-slate-300"></div>} label="金色" />
            <ToolbarButton cmd="foreColor" arg="#125227" icon={<div className="w-5 h-5 bg-[#125227] rounded shadow-sm border border-slate-300"></div>} label="森林绿" />
            
            {/* Custom Color Picker Input */}
            <div className="relative group ml-1">
                <input 
                    type="color" 
                    className="w-6 h-6 p-0 border-0 rounded overflow-hidden cursor-pointer"
                    onChange={(e) => exec('foreColor', e.target.value)}
                    title="自定义颜色"
                />
            </div>

            <div className="flex-1"></div>

            <ToolbarButton cmd="removeFormat" icon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            } label="清除格式" />
            
            <ToolbarButton cmd="backColor" arg="black" icon={
                <div className="flex items-center gap-1"><div className="w-3 h-3 bg-black border border-slate-400"></div><span className="text-[10px]">遮挡</span></div>
            } wide label="重点遮挡 (黑底)" />
        </div>
      </div>

      {/* Editable Area */}
      <div className="relative group">
        <div
            ref={contentRef}
            contentEditable
            onInput={handleInput}
            // Use 'prose' (Tailwind Typography) conceptual styles here to match the poster feel
            // Removed: h-full, overflow-y-auto to allow growth
            className="w-full p-4 text-slate-900 focus:outline-none leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:my-2 [&_h2]:text-[#DE2910] [&_h3]:text-xl [&_h3]:font-bold [&_h3]:my-1"
            style={{ 
                minHeight: '200px',
                fontFamily: fontFamily || '"Noto Serif SC", serif' // Use passed font family or default
            }}
        />
        {value === '' && (
            <div className="absolute top-4 left-4 pointer-events-none text-slate-400 italic">
                {placeholder}
            </div>
        )}
      </div>
    </div>
  );
};