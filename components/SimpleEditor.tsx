import React, { useRef, useEffect } from 'react';

interface SimpleEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  fontFamily?: string;
}

// 保存/恢复选区，避免点击工具栏后丢失光标（移动端尤其重要）
let savedRange: Range | null = null;

function saveSelection() {
  const sel = window.getSelection();
  if (sel && sel.rangeCount > 0) {
    savedRange = sel.getRangeAt(0).cloneRange();
  }
}

function restoreSelection(el: HTMLElement) {
  if (savedRange && el) {
    el.focus();
    const sel = window.getSelection();
    if (sel) {
      sel.removeAllRanges();
      sel.addRange(savedRange);
    }
  } else {
    el.focus();
  }
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
    // 移动端：恢复之前保存的选区，再执行命令
    if (contentRef.current) {
      restoreSelection(contentRef.current);
    }
    document.execCommand('styleWithCSS', false, 'true');
    document.execCommand(command, false, value);

    if (contentRef.current) {
      onChange(contentRef.current.innerHTML);
      // 执行后重新保存选区，便于连续操作
      saveSelection();
    }
    contentRef.current?.focus();
  };

  const handleInput = () => {
    if (contentRef.current) {
      onChange(contentRef.current.innerHTML);
    }
  };

  // 编辑器获得焦点时保存选区
  const handleMouseUp = () => {
    saveSelection();
  };
  const handleKeyUp = () => {
    saveSelection();
  };

  const ToolbarButton: React.FC<{ cmd?: string; arg?: string; icon: React.ReactNode; label: string; wide?: boolean; onCustom?: () => void }> = ({
    cmd,
    arg,
    icon,
    label,
    wide,
    onCustom,
  }) => (
    <button
      type="button"
      // 用 onMouseDown + preventDefault 避免失焦；touchstart 适配移动端
      onMouseDown={(e) => {
        e.preventDefault();
      }}
      onTouchStart={(e) => {
        e.preventDefault();
        saveSelection();
      }}
      onClick={() => {
        if (onCustom) onCustom();
        else if (cmd) exec(cmd, arg);
      }}
      className={`flex items-center justify-center rounded text-slate-700 transition-colors hover:bg-slate-200 active:bg-slate-300 flex-shrink-0 ${
        wide ? 'px-2 min-h-[40px]' : 'w-10 h-10'
      }`}
      title={label}
    >
      {icon}
    </button>
  );

  const Divider = () => <div className="w-px h-7 bg-slate-300 mx-1 flex-shrink-0" />;

  return (
    <div className={`flex flex-col border border-blue-800 rounded-lg overflow-hidden bg-[#FFFBF0] shadow-inner ${className}`}>
      {/* 工具栏：移动端可横滑 */}
      <div className="bg-slate-100 border-b border-slate-300">
        {/* 第一行：可横滑 */}
        <div className="flex items-center gap-1 p-2 overflow-x-auto" style={{ scrollbarWidth: 'thin' }}>
          <ToolbarButton cmd="bold" icon={<b className="font-serif text-lg">B</b>} label="加粗" />
          <ToolbarButton cmd="italic" icon={<i className="font-serif text-lg">I</i>} label="斜体" />
          <ToolbarButton cmd="underline" icon={<u className="font-serif text-lg">U</u>} label="下划线" />
          <Divider />
          <ToolbarButton
            cmd="justifyLeft"
            icon={
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="17" y1="10" x2="3" y2="10" />
                <line x1="21" y1="6" x2="3" y2="6" />
                <line x1="21" y1="14" x2="3" y2="14" />
                <line x1="17" y1="18" x2="3" y2="18" />
              </svg>
            }
            label="左对齐"
          />
          <ToolbarButton
            cmd="justifyCenter"
            icon={
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="21" y1="10" x2="3" y2="10" />
                <line x1="21" y1="6" x2="3" y2="6" />
                <line x1="21" y1="14" x2="3" y2="14" />
                <line x1="21" y1="18" x2="3" y2="18" />
              </svg>
            }
            label="居中"
          />
          <Divider />
          <ToolbarButton cmd="formatBlock" arg="H2" wide icon={<span className="font-bold text-sm whitespace-nowrap">大标题</span>} label="大标题" />
          <ToolbarButton cmd="formatBlock" arg="H3" wide icon={<span className="font-bold text-xs whitespace-nowrap">小标题</span>} label="小标题" />
          <ToolbarButton cmd="formatBlock" arg="P" wide icon={<span className="text-xs whitespace-nowrap">正文</span>} label="普通正文" />
          <Divider />
          {/* 颜色快选 */}
          <ToolbarButton cmd="foreColor" arg="#DE2910" icon={<div className="w-6 h-6 bg-[#DE2910] rounded shadow-sm border border-slate-300" />} label="中国红" />
          <ToolbarButton cmd="foreColor" arg="#000000" icon={<div className="w-6 h-6 bg-black rounded shadow-sm border border-slate-300" />} label="黑色" />
          <ToolbarButton cmd="foreColor" arg="#D4AF37" icon={<div className="w-6 h-6 bg-[#D4AF37] rounded shadow-sm border border-slate-300" />} label="金色" />
          <ToolbarButton cmd="foreColor" arg="#125227" icon={<div className="w-6 h-6 bg-[#125227] rounded shadow-sm border border-slate-300" />} label="森林绿" />
          {/* 自定义颜色 */}
          <ToolbarButton
            label="自定义颜色"
            icon={
              <input
                type="color"
                className="w-6 h-6 p-0 border-0 rounded overflow-hidden cursor-pointer"
                onChange={(e) => exec('foreColor', e.target.value)}
                onClick={(e) => {
                  e.stopPropagation();
                  saveSelection();
                }}
              />
            }
          />
          <Divider />
          <ToolbarButton
            cmd="removeFormat"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            }
            label="清除格式"
          />
          <ToolbarButton
            cmd="backColor"
            arg="black"
            wide
            icon={
              <div className="flex items-center gap-1 whitespace-nowrap">
                <div className="w-3 h-3 bg-black border border-slate-400" />
                <span className="text-[10px]">遮挡</span>
              </div>
            }
            label="重点遮挡（黑底）"
          />
        </div>
      </div>

      {/* Editable Area */}
      <div className="relative group">
        <div
          ref={contentRef}
          contentEditable
          onInput={handleInput}
          onMouseUp={handleMouseUp}
          onKeyUp={handleKeyUp}
          className="w-full p-4 text-slate-900 focus:outline-none leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:my-2 [&_h2]:text-[#DE2910] [&_h3]:text-xl [&_h3]:font-bold [&_h3]:my-1"
          style={{
            minHeight: '180px',
            fontFamily: fontFamily || '"Noto Serif SC", serif',
            // 移动端：放大触摸字号，避免 iOS 自动缩放
            WebkitTextSizeAdjust: '100%',
          }}
        />
        {value === '' && (
          <div className="absolute top-4 left-4 pointer-events-none text-slate-400 italic">{placeholder}</div>
        )}
      </div>
    </div>
  );
};
