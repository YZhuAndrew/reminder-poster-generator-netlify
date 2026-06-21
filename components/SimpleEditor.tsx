import React, { useRef, useEffect, useState } from 'react';

interface SimpleEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  fontFamily?: string;
}

// 状态查询：判断当前选区是否已应用某格式（用于按钮高亮）
function isFmt(cmd: string): boolean {
  try {
    return document.queryCommandState(cmd);
  } catch {
    return false;
  }
}

const COLORS = [
  { c: '#1a1a1a', name: '墨黑' },
  { c: '#b3261e', name: '朱红' },
  { c: '#8a5a2b', name: '赭石' },
  { c: '#1f5f8b', name: '靛蓝' },
  { c: '#2d6a4f', name: '松绿' },
];

export const SimpleEditor: React.FC<SimpleEditorProps> = ({ value, onChange, placeholder, className, fontFamily }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const savedRange = useRef<Range | null>(null);
  const [bubble, setBubble] = useState<{ x: number; y: number } | null>(null);
  const [active, setActive] = useState<Record<string, boolean>>({});
  const [count, setCount] = useState(0);

  // 初次挂载写入内容
  useEffect(() => {
    if (contentRef.current && contentRef.current.innerHTML === '') {
      contentRef.current.innerHTML = value || '';
      syncCount();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 外部 value 变更（套用模板）且编辑器未聚焦时同步
  useEffect(() => {
    if (contentRef.current && document.activeElement !== contentRef.current) {
      if (contentRef.current.innerHTML !== value) {
        contentRef.current.innerHTML = value || '';
        syncCount();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const syncCount = () => {
    const txt = contentRef.current ? contentRef.current.innerText.replace(/\s/g, '') : '';
    setCount(txt.length);
  };

  const emit = () => {
    if (contentRef.current) {
      onChange(contentRef.current.innerHTML);
      syncCount();
    }
  };

  // 选区保存/恢复：始终基于编辑器内部 Range
  const saveSel = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const r = sel.getRangeAt(0);
      if (contentRef.current && contentRef.current.contains(r.commonAncestorContainer)) {
        savedRange.current = r.cloneRange();
      }
    }
  };
  const restoreSel = () => {
    const r = savedRange.current;
    const el = contentRef.current;
    if (!el) return;
    el.focus();
    if (r) {
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(r);
      }
    }
  };

  const exec = (cmd: string, val?: string) => {
    restoreSel();
    try {
      document.execCommand('styleWithCSS', false, 'true');
      document.execCommand(cmd, false, val);
    } catch {
      /* ignore */
    }
    saveSel();
    refreshActive();
    emit();
  };

  const refreshActive = () => {
    setActive({
      bold: isFmt('bold'),
      italic: isFmt('italic'),
      underline: isFmt('underline'),
      justifyLeft: isFmt('justifyLeft'),
      justifyCenter: isFmt('justifyCenter'),
      justifyRight: isFmt('justifyRight'),
    });
  };

  // 选区变化 → 决定是否显示气泡工具条
  const handleSelChange = () => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
      setBubble(null);
      refreshActive();
      return;
    }
    const r = sel.getRangeAt(0);
    if (!contentRef.current || !contentRef.current.contains(r.commonAncestorContainer)) {
      setBubble(null);
      return;
    }
    const txt = sel.toString();
    if (!txt || !txt.trim()) {
      setBubble(null);
      return;
    }
    const rect = r.getBoundingClientRect();
    const wrapRect = wrapRef.current ? wrapRef.current.getBoundingClientRect() : { left: 0, top: 0 };
    setBubble({
      x: rect.left + rect.width / 2 - wrapRect.left,
      y: rect.top - wrapRect.top,
    });
    refreshActive();
  };

  useEffect(() => {
    document.addEventListener('selectionchange', handleSelChange);
    return () => document.removeEventListener('selectionchange', handleSelChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 工具栏按钮：用 onMouseDown preventDefault 避免失焦
  const TBtn: React.FC<{
    cmd?: string;
    val?: string;
    label: string;
    wide?: boolean;
    fmtKey?: string;
    children: React.ReactNode;
  }> = ({ cmd, val, label, wide, fmtKey, children }) => (
    <button
      type="button"
      title={label}
      className={`flex items-center justify-center rounded-md text-[#5b4f3d] transition-colors hover:bg-[#e4dcc8] flex-shrink-0 ${
        wide ? 'px-2.5 min-h-[36px] text-xs font-bold gap-1' : 'w-8 h-8'
      } ${fmtKey && active[fmtKey] ? 'bg-[#b3261e] text-white hover:bg-[#b3261e]' : ''}`}
      onMouseDown={(e) => e.preventDefault()}
      onTouchStart={(e) => {
        e.preventDefault();
        saveSel();
      }}
      onClick={() => {
        if (cmd) exec(cmd, val);
      }}
    >
      {children}
    </button>
  );

  const Divider = () => <div className="w-px h-5 bg-[#d8cfb8] mx-1 flex-shrink-0" />;

  return (
    <div ref={wrapRef} className={`relative flex flex-col border border-slate-300 rounded-lg overflow-hidden bg-[#fbf8f1] ${className}`}>
      {/* 固定工具栏（分组、浅色、可横滑） */}
      <div className="flex items-center gap-0.5 p-1.5 bg-[#f1ece2] border-b border-[#e3dcca] overflow-x-auto" style={{ scrollbarWidth: 'thin' }}>
        <TBtn cmd="bold" fmtKey="bold" label="加粗 (Ctrl+B)">
          <b className="font-serif text-base">B</b>
        </TBtn>
        <TBtn cmd="italic" fmtKey="italic" label="斜体">
          <i className="font-serif text-base">I</i>
        </TBtn>
        <TBtn cmd="underline" fmtKey="underline" label="下划线">
          <u className="font-serif text-base">U</u>
        </TBtn>
        <Divider />
        <TBtn cmd="justifyLeft" fmtKey="justifyLeft" label="左对齐">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="17" y1="6" x2="3" y2="6" /><line x1="21" y1="12" x2="3" y2="12" /><line x1="17" y1="18" x2="3" y2="18" />
          </svg>
        </TBtn>
        <TBtn cmd="justifyCenter" fmtKey="justifyCenter" label="居中">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="6" /><line x1="21" y1="12" x2="3" y2="12" /><line x1="18" y1="18" x2="6" y2="18" />
          </svg>
        </TBtn>
        <TBtn cmd="justifyRight" fmtKey="justifyRight" label="右对齐">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="21" y1="6" x2="7" y2="6" /><line x1="21" y1="12" x2="3" y2="12" /><line x1="21" y1="18" x2="7" y2="18" />
          </svg>
        </TBtn>
        <Divider />
        <TBtn cmd="formatBlock" val="H2" wide label="大标题"><span>大标题</span></TBtn>
        <TBtn cmd="formatBlock" val="H3" wide label="小标题"><span>小标题</span></TBtn>
        <TBtn cmd="formatBlock" val="P" wide label="正文"><span>正文</span></TBtn>
        <Divider />
        {/* 颜色色板 */}
        <div className="flex gap-0.5">
          {COLORS.map((c) => (
            <button
              key={c.c}
              type="button"
              title={c.name}
              className="flex items-center justify-center rounded-md w-8 h-8 hover:bg-[#e4dcc8] flex-shrink-0"
              onMouseDown={(e) => e.preventDefault()}
              onTouchStart={(e) => {
                e.preventDefault();
                saveSel();
              }}
              onClick={() => exec('foreColor', c.c)}
            >
              <span className="w-4 h-4 rounded" style={{ background: c.c, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.25)' }} />
            </button>
          ))}
          <label className="flex items-center justify-center rounded-md w-8 h-8 hover:bg-[#e4dcc8] cursor-pointer flex-shrink-0 relative" title="自定义颜色">
            <span className="w-4 h-4 rounded" style={{ background: 'conic-gradient(red,orange,yellow,lime,cyan,blue,magenta,red)', boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.25)' }} />
            <input
              type="color"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onMouseDown={(e) => e.preventDefault()}
              onChange={(e) => exec('foreColor', e.target.value)}
            />
          </label>
        </div>
        <Divider />
        <TBtn cmd="removeFormat" label="清除格式">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 7h16M9 7l1 13M15 7l-1 13M5 7l1 13a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-13" />
            <line x1="9" y1="3" x2="15" y2="3" />
          </svg>
        </TBtn>
      </div>

      {/* 编辑区：可滚动 + 可拖拽调整高度 */}
      <div className="relative">
        <div
          ref={contentRef}
          contentEditable
          suppressContentEditableWarning
          onInput={() => {
            emit();
            refreshActive();
          }}
          onMouseUp={() => {
            saveSel();
            handleSelChange();
          }}
          onKeyUp={() => {
            saveSel();
            handleSelChange();
          }}
          onBlur={() => setTimeout(() => setBubble(null), 120)}
          className="w-full px-4 py-3 text-[#2b2622] focus:outline-none text-justify [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_h2]:text-xl [&_h2]:font-black [&_h2]:my-1 [&_h2]:text-[#b3261e] [&_h2]:pl-2 [&_h2]:border-l-4 [&_h2]:border-[#b3261e] [&_h3]:text-lg [&_h3]:font-bold [&_h3]:my-1"
          style={{
            minHeight: '120px',
            maxHeight: '220px',
            overflowY: 'auto',
            resize: 'vertical',
            fontSize: '15px',
            lineHeight: 1.85,
            fontFamily: fontFamily || '"Noto Serif SC", serif',
            WebkitTextSizeAdjust: '100%',
          }}
        />
        {value === '' && (
          <div className="absolute top-3 left-4 pointer-events-none text-[#b3a98f]">{placeholder}</div>
        )}

        {/* 选中文字时的浮动气泡工具条 */}
        {bubble && (
          <div
            className="absolute z-50 flex items-center gap-0.5 bg-[#1f2738] rounded-lg p-1 shadow-xl"
            style={{ left: bubble.x, top: bubble.y, transform: 'translate(-50%, -120%)', whiteSpace: 'nowrap' }}
          >
            <button
              className={`flex items-center justify-center rounded-md w-7 h-7 ${active.bold ? 'bg-[#b3261e]' : 'hover:bg-white/10'} text-white`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => exec('bold')}
              title="加粗"
            >
              <b className="font-serif text-sm">B</b>
            </button>
            <button
              className={`flex items-center justify-center rounded-md w-7 h-7 ${active.italic ? 'bg-[#b3261e]' : 'hover:bg-white/10'} text-white`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => exec('italic')}
              title="斜体"
            >
              <i className="font-serif text-sm">I</i>
            </button>
            <div className="w-px h-4 bg-white/20 mx-0.5" />
            {COLORS.slice(0, 4).map((c) => (
              <button
                key={c.c}
                className="flex items-center justify-center rounded-md w-7 h-7 hover:bg-white/10"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => exec('foreColor', c.c)}
                title={c.name}
              >
                <span className="w-3.5 h-3.5 rounded" style={{ background: c.c, boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.3)' }} />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 底栏：字数统计 */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#f6f1e6] border-t border-[#e8e0cd] text-[11px] text-[#9a8e72]">
        <span>选中文字可弹出快捷格式条</span>
        <span>{count} 字</span>
      </div>
    </div>
  );
};
