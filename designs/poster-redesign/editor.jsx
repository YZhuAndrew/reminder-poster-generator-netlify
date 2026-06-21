/* editor.jsx —— 重构的富文本编辑器
   核心改进：
   1. 分组、浅色、清晰的固定工具栏（移动端可横滑）
   2. 选中文本时弹出「气泡工具条」（加粗/颜色/对齐），操作更顺手，
      规避旧版「点工具栏就丢光标」的通病
   3. 选区保存恢复：始终基于编辑器内部 Range，更稳
   4. 字数统计底栏
   说明：仍基于 contentEditable（务实、零依赖），但封装得更可控。 */

const { useRef, useEffect, useState, useCallback } = React;

// 图标（内联 SVG，轻量）
const I = {
  bold: (
    <svg className="ico-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 4h7a4 4 0 0 1 0 8H6zM6 12h8a4 4 0 0 1 0 8H6z" />
    </svg>
  ),
  italic: (
    <svg className="ico-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="4" x2="10" y2="4" /><line x1="14" y1="20" x2="5" y2="20" /><line x1="15" y1="4" x2="9" y2="20" />
    </svg>
  ),
  underline: (
    <svg className="ico-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3v7a6 6 0 0 0 12 0V3" /><line x1="4" y1="21" x2="20" y2="21" />
    </svg>
  ),
  h2: <span className="tbtn__label">大标题</span>,
  h3: <span className="tbtn__label">小标题</span>,
  body: <span className="tbtn__label">正文</span>,
  left: (
    <svg className="ico-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="17" y1="6" x2="3" y2="6" /><line x1="21" y1="12" x2="3" y2="12" /><line x1="17" y1="18" x2="3" y2="18" />
    </svg>
  ),
  center: (
    <svg className="ico-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="6" /><line x1="21" y1="12" x2="3" y2="12" /><line x1="18" y1="18" x2="6" y2="18" />
    </svg>
  ),
  right: (
    <svg className="ico-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="21" y1="6" x2="7" y2="6" /><line x1="21" y1="12" x2="3" y2="12" /><line x1="21" y1="18" x2="7" y2="18" />
    </svg>
  ),
  clear: (
    <svg className="ico-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 7h16M9 7l1 13M15 7l-1 13M5 7l1 13a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-13" />
      <line x1="9" y1="3" x2="15" y2="3" />
    </svg>
  ),
  black: (
    <svg className="ico-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a7 7 0 0 0-4 12.7V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.3A7 7 0 0 0 12 2z" /><line x1="9" y1="21" x2="15" y2="21" />
    </svg>
  ),
};

// 状态查询：判断当前选区是否已应用某格式（用于按钮高亮）
function isFmt(cmd) {
  try {
    return document.queryCommandState(cmd);
  } catch {
    return false;
  }
}

const Editor = ({ value, onChange, fontFamily }) => {
  const ref = useRef(null);
  const wrapRef = useRef(null);
  const savedRange = useRef(null);
  const [bubble, setBubble] = useState(null); // {x, y} 或 null
  const [active, setActive] = useState({}); // 工具栏激活态
  const [count, setCount] = useState(0);

  // 初次挂载写入内容
  useEffect(() => {
    if (ref.current && ref.current.innerHTML === '') {
      ref.current.innerHTML = value || '';
    }
    // eslint-disable-next-line
  }, []);

  // 外部 value 变更（如套用模板）且编辑器未聚焦时同步
  useEffect(() => {
    if (ref.current && document.activeElement !== ref.current) {
      if (ref.current.innerHTML !== value) {
        ref.current.innerHTML = value || '';
        syncCount();
      }
    }
    // eslint-disable-next-line
  }, [value]);

  const syncCount = () => {
    const txt = ref.current ? ref.current.innerText.replace(/\s/g, '') : '';
    setCount(txt.length);
  };

  const emit = () => {
    if (ref.current) {
      onChange(ref.current.innerHTML);
      syncCount();
    }
  };

  // 保存/恢复选区（始终基于编辑器内 Range）
  const saveSel = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const r = sel.getRangeAt(0);
      if (ref.current && ref.current.contains(r.commonAncestorContainer)) {
        savedRange.current = r.cloneRange();
      }
    }
  };
  const restoreSel = () => {
    const r = savedRange.current;
    const el = ref.current;
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

  // 执行格式命令
  const exec = (cmd, val) => {
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

  // 刷新工具栏激活态
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
    if (!ref.current || !ref.current.contains(r.commonAncestorContainer)) {
      setBubble(null);
      return;
    }
    // 有实际选中文本才弹气泡
    const txt = sel.toString();
    if (!txt || !txt.trim()) {
      setBubble(null);
      return;
    }
    const rect = r.getBoundingClientRect();
    const wrapRect = wrapRef.current.getBoundingClientRect();
    setBubble({
      x: rect.left + rect.width / 2 - wrapRect.left,
      y: rect.top - wrapRect.top,
    });
    refreshActive();
  };

  useEffect(() => {
    document.addEventListener('selectionchange', handleSelChange);
    return () => document.removeEventListener('selectionchange', handleSelChange);
    // eslint-disable-next-line
  }, []);

  // 工具栏按钮：用 onMouseDown preventDefault 避免失焦
  const TBtn = ({ cmd, val, children, wide, onCustom, fmtKey, label }) => (
    <button
      type="button"
      title={label}
      className={`tbtn ${wide ? 'tbtn--wide' : ''} ${fmtKey && active[fmtKey] ? 'tbtn--active' : ''}`}
      onMouseDown={(e) => e.preventDefault()}
      onTouchStart={(e) => {
        e.preventDefault();
        saveSel();
      }}
      onClick={() => {
        if (onCustom) onCustom();
        else if (cmd) exec(cmd, val);
      }}
    >
      {children}
    </button>
  );

  const Divider = () => <span className="tdiv" />;

  // 颜色快选
  const COLORS = [
    { c: '#1a1a1a', name: '墨黑' },
    { c: '#c0271c', name: '朱红' },
    { c: '#b8882f', name: '赭金' },
    { c: '#1f5f8b', name: '靛蓝' },
    { c: '#2d6a4f', name: '松绿' },
  ];

  return (
    <div className="editor" ref={wrapRef}>
      {/* 固定工具栏（分组、浅色、可横滑） */}
      <div className="editor__toolbar">
        <TBtn cmd="bold" fmtKey="bold" label="加粗 (Ctrl+B)">{I.bold}</TBtn>
        <TBtn cmd="italic" fmtKey="italic" label="斜体">{I.italic}</TBtn>
        <TBtn cmd="underline" fmtKey="underline" label="下划线">{I.underline}</TBtn>
        <Divider />
        <TBtn cmd="justifyLeft" fmtKey="justifyLeft" label="左对齐">{I.left}</TBtn>
        <TBtn cmd="justifyCenter" fmtKey="justifyCenter" label="居中">{I.center}</TBtn>
        <TBtn cmd="justifyRight" fmtKey="justifyRight" label="右对齐">{I.right}</TBtn>
        <Divider />
        <TBtn cmd="formatBlock" val="H2" wide label="大标题">{I.h2}</TBtn>
        <TBtn cmd="formatBlock" val="H3" wide label="小标题">{I.h3}</TBtn>
        <TBtn cmd="formatBlock" val="P" wide label="正文">{I.body}</TBtn>
        <Divider />
        {/* 颜色：自定义色板 */}
        <span style={{ display: 'flex', gap: 2 }}>
          {COLORS.map((c) => (
            <button
              key={c.c}
              type="button"
              title={c.name}
              className="tbtn"
              onMouseDown={(e) => e.preventDefault()}
              onTouchStart={(e) => {
                e.preventDefault();
                saveSel();
              }}
              onClick={() => exec('foreColor', c.c)}
            >
              <span className="swatch-dot" style={{ background: c.c }} />
            </button>
          ))}
          <label className="tbtn tcolor" title="自定义颜色">
            <span className="swatch-dot" style={{ background: 'conic-gradient(red,orange,yellow,lime,cyan,blue,magenta,red)' }} />
            <input
              type="color"
              onMouseDown={(e) => e.preventDefault()}
              onChange={(e) => exec('foreColor', e.target.value)}
            />
          </label>
        </span>
        <Divider />
        <TBtn cmd="removeFormat" label="清除格式">{I.clear}</TBtn>
      </div>

      {/* 编辑区 */}
      <div className="editor__field">
        <div
          ref={ref}
          className="editor__area"
          contentEditable
          suppressContentEditableWarning
          data-placeholder="请输入正文内容，可使用上方工具栏或选中文字设置格式…"
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
          style={{ fontFamily: fontFamily || '"Noto Serif SC", serif' }}
        />

        {/* 选中文字时的浮动气泡工具条 */}
        {bubble && (
          <div className="bubble" style={{ left: bubble.x, top: bubble.y }}>
            <button
              className={`bbtn ${active.bold ? 'bbtn--active' : ''}`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => exec('bold')}
              title="加粗"
            >
              <b style={{ fontFamily: 'serif' }}>B</b>
            </button>
            <button
              className={`bbtn ${active.italic ? 'bbtn--active' : ''}`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => exec('italic')}
              title="斜体"
            >
              <i style={{ fontFamily: 'serif' }}>I</i>
            </button>
            <span className="bdiv" />
            {COLORS.slice(0, 4).map((c) => (
              <button
                key={c.c}
                className="bbtn"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => exec('foreColor', c.c)}
                title={c.name}
              >
                <span className="swatch-dot" style={{ background: c.c, width: 14, height: 14 }} />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 底栏：字数统计 */}
      <div className="editor__footer">
        <span>选中文字可弹出快捷格式条</span>
        <span>{count} 字</span>
      </div>
    </div>
  );
};

Object.assign(window, { Editor });
