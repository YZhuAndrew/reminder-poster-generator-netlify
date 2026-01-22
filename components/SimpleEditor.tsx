import React, { useRef, useEffect } from 'react';

interface SimpleEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
}

export const SimpleEditor: React.FC<SimpleEditorProps> = ({ value, onChange, placeholder, className }) => {
  const contentRef = useRef<HTMLDivElement>(null);

  // Initial load
  useEffect(() => {
    if (contentRef.current && value && contentRef.current.innerHTML === '') {
        contentRef.current.innerHTML = value;
    }
  }, []);

  // Sync external value to internal content
  useEffect(() => {
    // CRITICAL: Only update the DOM if the user is NOT currently typing in it.
    // This prevents the cursor from jumping to the beginning on every keystroke.
    if (contentRef.current && document.activeElement !== contentRef.current) {
        if (contentRef.current.innerHTML !== value) {
            contentRef.current.innerHTML = value;
        }
    }
  }, [value]);

  const exec = (command: string, value: string | undefined = undefined) => {
    // Enable CSS styling for cleaner HTML (spans instead of font tags)
    document.execCommand('styleWithCSS', false, 'true');
    
    if (command === 'redact') {
        // Redaction: Black background, Black text (effectively hidden block)
        document.execCommand('backColor', false, '#000000');
        document.execCommand('foreColor', false, '#000000');
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

  const ToolbarButton = ({ cmd, arg, icon, label, activeColor }: any) => (
    <button
      onMouseDown={(e) => { 
        // Use onMouseDown + preventDefault to prevent losing focus from the editor area
        e.preventDefault(); 
        exec(cmd, arg); 
      }}
      className={`p-1.5 rounded hover:bg-slate-200 text-slate-700 transition-colors ${activeColor ? activeColor : ''}`}
      title={label}
    >
      {icon}
    </button>
  );

  return (
    <div className={`flex flex-col border border-blue-800 rounded-lg overflow-hidden bg-[#FFFBF0] ${className}`}>
      {/* Toolbar - Light Theme */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-100 border-b border-slate-300">
        <ToolbarButton cmd="bold" icon={<b className="font-serif">B</b>} label="加粗" />
        <ToolbarButton cmd="italic" icon={<i className="font-serif">I</i>} label="斜体" />
        <ToolbarButton cmd="underline" icon={<u className="font-serif">U</u>} label="下划线" />
        
        <div className="w-px h-4 bg-slate-300 mx-1"></div>
        
        {/* Colors */}
        <ToolbarButton cmd="foreColor" arg="#DE2910" icon={<div className="w-4 h-4 bg-[#DE2910] rounded-full border border-black/10"></div>} label="中国红" />
        <ToolbarButton cmd="foreColor" arg="#000000" icon={<div className="w-4 h-4 bg-black rounded-full border border-black/10"></div>} label="黑色" />
        <ToolbarButton cmd="foreColor" arg="#d4af37" icon={<div className="w-4 h-4 bg-[#d4af37] rounded-full border border-black/10"></div>} label="金色" />
        
        {/* Redact / Block out text */}
        <ToolbarButton cmd="redact" icon={<div className="w-4 h-4 bg-black border border-slate-400 flex items-center justify-center" title="遮挡/涂黑"><div className="w-2 h-0.5 bg-white/30"></div></div>} label="遮挡" />

        <div className="w-px h-4 bg-slate-300 mx-1"></div>

        {/* Alignment */}
        <ToolbarButton cmd="justifyLeft" icon={
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="17" y1="10" x2="3" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="17" y1="18" x2="3" y2="18"></line></svg>
        } label="左对齐" />
        <ToolbarButton cmd="justifyCenter" icon={
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="21" y1="10" x2="3" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="21" y1="18" x2="3" y2="18"></line></svg>
        } label="居中" />

        <div className="w-px h-4 bg-slate-300 mx-1"></div>

        {/* Font Size Hack (using fontSize 1-7) */}
        <ToolbarButton cmd="fontSize" arg="5" icon={<span className="text-lg font-bold">A+</span>} label="大字" />
        <ToolbarButton cmd="fontSize" arg="3" icon={<span className="text-sm font-bold">A</span>} label="正常" />
      </div>

      {/* Editable Area */}
      <div className="relative flex-1 overflow-hidden">
        <div
            ref={contentRef}
            contentEditable
            onInput={handleInput}
            className="w-full h-full p-4 text-slate-900 font-serif-sc focus:outline-none overflow-y-auto leading-relaxed"
            style={{ minHeight: '200px' }}
        />
        {/* Placeholder overlay */}
        {value === '' && (
            <div className="absolute top-4 left-4 pointer-events-none text-slate-400 italic">
                {placeholder}
            </div>
        )}
      </div>
    </div>
  );
};