/* app.jsx —— 应用主壳：侧栏编辑 + 预览舞台 + 历史 */

const { useState, useMemo, useRef, useEffect } = React;
const { Editor, Poster, DIRECTIONS, FONT_PRESETS, TEMPLATES } = window;

// 默认内容
const initialContent = {
  title: window.DEFAULT_TITLE,
  body: window.DEFAULT_BODY,
  footer: window.DEFAULT_FOOTER,
  issue: window.DEFAULT_ISSUE,
  date: window.DEFAULT_DATE,
  sealText: window.SAL_TEXT.party,
  kicker: '廉洁提醒',
};

// ---------- 小组件 ----------
const Card = ({ title, open, onToggle, children, right }) => (
  <div className={`card ${open ? 'card--open' : ''}`}>
    <div className="card__head" onClick={onToggle}>
      <span className="card__title">{title}</span>
      {right || (
        <svg className="card__caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      )}
    </div>
    {open && <div className="card__body">{children}</div>}
  </div>
);

const SliderRow = ({ label, value, min, max, step, unit, onChange }) => (
  <div className="slider-row">
    <div className="slider-row__top">
      <span className="slider-row__label">{label}</span>
      <span className="slider-row__val">
        <input
          className="num-input"
          type="number"
          value={value}
          min={min}
          max={max}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (!isNaN(v)) onChange(Math.max(min, Math.min(max, v)));
          }}
        />
        {unit}
      </span>
    </div>
    <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
  </div>
);

// ---------- 主应用 ----------
function App() {
  const [content, setContent] = useState(initialContent);
  const [direction, setDirection] = useState('party');
  const [background, setBackground] = useState('paper');
  const [fontId, setFontId] = useState('serif');
  const [titleSize, setTitleSize] = useState(56);
  const [bodySize, setBodySize] = useState(18);
  const [showSeal, setShowSeal] = useState(true);
  const [kicker, setKicker] = useState('廉洁提醒');
  const [mode, setMode] = useState('single'); // single | compare
  const [tab, setTab] = useState('editor'); // editor | history
  const [openCards, setOpenCards] = useState({ content: true, meta: false, dir: false, bg: false, font: false, style: false, tmpl: false });

  // 预览缩放（用户可控放大缩小），1 = 适配舞台
  const [zoom, setZoom] = useState(1);

  const [history, setHistory] = useState([]);
  const [titleInput, setTitleInput] = useState(window.DEFAULT_TITLE);
  const [bodyInput, setBodyInput] = useState(window.DEFAULT_BODY);

  const font = useMemo(() => FONT_PRESETS.find((f) => f.id === fontId) || FONT_PRESETS[0], [fontId]);
  const dirObj = useMemo(() => DIRECTIONS.find((d) => d.id === direction) || DIRECTIONS[0], [direction]);
  const sealFill = dirObj.sealFill;

  // 同步标题输入到海报内容
  const onTitleChange = (v) => {
    setTitleInput(v);
    setContent((c) => ({ ...c, title: v }));
  };
  const onBodyChange = (v) => {
    setBodyInput(v);
    setContent((c) => ({ ...c, body: v }));
  };

  // 切换强调色方向：同时更新印章推荐文字
  const onPickDir = (id) => {
    setDirection(id);
    setContent((c) => ({ ...c, sealText: window.SAL_TEXT[id] }));
  };

  // 套用模板
  const applyTemplate = (tpl) => {
    setTitleInput(tpl.title);
    setBodyInput(tpl.body);
    setKicker(tpl.kicker || kicker);
    setContent((c) => ({ ...c, title: tpl.title, body: tpl.body, footer: tpl.footer }));
  };

  // 保存到历史（演示：截取标题+方向作为缩略记录）
  const saveToHistory = () => {
    const item = {
      id: Date.now().toString(),
      title: titleInput || '未命名',
      dir: direction,
      fontId,
      time: Date.now(),
      content: { ...content },
    };
    setHistory((h) => [item, ...h].slice(0, 8));
  };

  const loadHistory = (item) => {
    setTitleInput(item.title);
    setBodyInput(item.content.body);
    setContent(item.content);
    setDirection(item.dir);
    setFontId(item.fontId);
    setTab('editor');
  };

  const toggle = (k) => setOpenCards((o) => ({ ...o, [k]: !o[k] }));

  // 给海报注入实时字号（覆盖 CSS 默认）
  const posterStyleVars = {
    // 通过 style 传入字号给 Poster：这里简单用 wrapper 变量
  };

  const livePosterContent = {
    ...content,
    sealText: content.sealText || window.SAL_TEXT[direction],
  };

  // 缩略色：对比模式标签
  const dirColor = (id) => (DIRECTIONS.find((d) => d.id === id) || {}).accent;

  return (
    <div className="app">
      {/* ============ 侧栏 ============ */}
      <aside className="app__sidebar">
        <div className="sidebar__head">
          <div className="brand">
            <div className="brand__mark">警</div>
            <div>
              <div className="brand__title">警示海报生成器</div>
              <div className="brand__sub">重新设计方案 · 高保真稿</div>
            </div>
          </div>
        </div>

        <div className="tabs">
          <button className={`tab ${tab === 'editor' ? 'tab--active' : ''}`} onClick={() => setTab('editor')}>
            编辑设计
          </button>
          <button className={`tab ${tab === 'history' ? 'tab--active' : ''}`} onClick={() => setTab('history')}>
            历史记录 {history.length > 0 && `(${history.length})`}
          </button>
        </div>

        <div className="sidebar__body">
          {tab === 'history' ? (
            history.length === 0 ? (
              <div className="empty">
                暂无历史记录
                <br />
                点击下方「保存当前」即可记录
              </div>
            ) : (
              <div className="hist">
                {history.map((h) => (
                  <div className="hist__item" key={h.id} onClick={() => loadHistory(h)}>
                    <div className="hist__thumb" style={{ background: dirColor(h.dir) }} />
                    <div className="hist__main">
                      <div className="hist__t">{h.title}</div>
                      <div className="hist__d">{new Date(h.time).toLocaleString()} · {DIRECTIONS.find((d) => d.id === h.dir).name}</div>
                    </div>
                    <button
                      className="hist__x"
                      onClick={(e) => {
                        e.stopPropagation();
                        setHistory((prev) => prev.filter((x) => x.id !== h.id));
                      }}
                      title="删除"
                    >
                      <svg className="ico-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )
          ) : (
            <>
              {/* 内容输入 */}
              <Card title="内容编辑" open={openCards.content} onToggle={() => toggle('content')}>
                <div>
                  <div className="field-label">标题</div>
                  <input
                    className="text-input"
                    value={titleInput}
                    onChange={(e) => onTitleChange(e.target.value)}
                    placeholder="例如：节日廉洁提醒"
                  />
                </div>
                <div>
                  <div className="field-label">正文（富文本，支持大标题/小标题）</div>
                  <Editor value={bodyInput} onChange={onBodyChange} fontFamily={font.body} />
                </div>
              </Card>

              {/* 报头信息 */}
              <Card title="报头信息" open={openCards.meta} onToggle={() => toggle('meta')}>
                <div>
                  <div className="field-label">顶部标签（页眉左）</div>
                  <input className="text-input" value={kicker} onChange={(e) => setKicker(e.target.value)} placeholder="如：廉洁提醒" style={{ fontWeight: 600 }} />
                </div>
                <div>
                  <div className="field-label">期号（页眉右）</div>
                  <input className="text-input" value={content.issue || ''} onChange={(e) => setContent((c) => ({ ...c, issue: e.target.value }))} placeholder="第 001 期" style={{ fontWeight: 600 }} />
                </div>
              </Card>

              {/* 文案模板 */}
              <Card title="文案模板" open={openCards.tmpl} onToggle={() => toggle('tmpl')}>
                <div className="opt-grid opt-grid--3">
                  {TEMPLATES.map((t) => (
                    <button key={t.id} className="opt" onClick={() => applyTemplate(t)} style={{ justifyContent: 'center', textAlign: 'center' }}>
                      <span className="opt__name">{t.title}</span>
                    </button>
                  ))}
                </div>
              </Card>

              {/* 强调色方案 */}
              <Card title="强调色方案" open={openCards.dir} onToggle={() => toggle('dir')}>
                <div className="opt-grid opt-grid--3">
                  {DIRECTIONS.map((d) => (
                    <button
                      key={d.id}
                      className={`opt ${direction === d.id ? 'opt--active' : ''}`}
                      onClick={() => onPickDir(d.id)}
                      title={d.hint}
                    >
                      <span className="opt__swatch" style={{ background: d.accent }} />
                      <span className="opt__main">
                        <span className="opt__name">{d.name}</span>
                        <span className="opt__desc">{d.hint}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </Card>

              {/* 底色 */}
              <Card title="底色" open={openCards.bg} onToggle={() => toggle('bg')}>
                <div className="opt-grid opt-grid--3">
                  {window.BACKGROUNDS.map((bg) => (
                    <button
                      key={bg.id}
                      className={`opt ${background === bg.id ? 'opt--active' : ''}`}
                      onClick={() => setBackground(bg.id)}
                    >
                      <span className="opt__swatch" style={{ background: bg.swatch }} />
                      <span className="opt__main">
                        <span className="opt__name">{bg.name}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </Card>

              {/* 字体方案 */}
              <Card title="字体方案" open={openCards.font} onToggle={() => toggle('font')}>
                <div className="opt-grid opt-grid--2">
                  {FONT_PRESETS.map((f) => (
                    <button
                      key={f.id}
                      className={`opt ${fontId === f.id ? 'opt--active' : ''}`}
                      onClick={() => setFontId(f.id)}
                    >
                      <div className="opt__main">
                        <div className="opt__name" style={{ fontFamily: f.title }}>{f.name}</div>
                        <div className="opt__desc" style={{ fontFamily: f.body }}>{f.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </Card>

              {/* 样式微调 */}
              <Card title="样式微调" open={openCards.style} onToggle={() => toggle('style')}>
                <SliderRow label="标题字号" value={titleSize} min={36} max={88} step={1} unit="px" onChange={setTitleSize} />
                <SliderRow label="正文字号" value={bodySize} min={13} max={28} step={1} unit="px" onChange={setBodySize} />
                <div className="slider-row">
                  <div className="slider-row__top">
                    <span className="slider-row__label">显示印章</span>
                    <button
                      onClick={() => setShowSeal((s) => !s)}
                      style={{
                        width: 40, height: 22, borderRadius: 999, border: 0, cursor: 'pointer',
                        background: showSeal ? 'var(--accent)' : 'rgba(255,255,255,0.14)',
                        position: 'relative', transition: 'background .15s',
                      }}
                    >
                      <span style={{
                        position: 'absolute', top: 3, width: 16, height: 16, borderRadius: '50%', background: '#fff',
                        left: showSeal ? 21 : 3, transition: 'left .15s',
                      }} />
                    </button>
                  </div>
                </div>
                <div>
                  <div className="field-label">印章文字</div>
                  <input
                    className="text-input"
                    value={content.sealText || ''}
                    onChange={(e) => setContent((c) => ({ ...c, sealText: e.target.value }))}
                    placeholder="2-6 字"
                    maxLength={6}
                    style={{ fontWeight: 600 }}
                  />
                </div>
              </Card>

              {/* 保存 */}
              <button className="btn btn--ghost" onClick={saveToHistory}>
                <svg className="ico-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" />
                </svg>
                保存当前到历史
              </button>
            </>
          )}
        </div>
      </aside>

      <Splitter />

      {/* ============ 预览舞台 ============ */}
      <main className="app__stage">
        <div className="stage__toolbar">
          <div className="stage__title">
            <span className={`pill`}>预览</span>
            {mode === 'single'
              ? DIRECTIONS.find((d) => d.id === direction).name + ' · ' + font.name
              : '三方向对比'}
          </div>
          <div className="stage__actions">
            <div className="segment">
              <button className={`segment__btn ${mode === 'single' ? 'segment__btn--active' : ''}`} onClick={() => setMode('single')}>
                单张
              </button>
              <button className={`segment__btn ${mode === 'compare' ? 'segment__btn--active' : ''}`} onClick={() => setMode('compare')}>
                对比
              </button>
            </div>
            {mode === 'single' && (
              <div className="zoom" title="预览缩放">
                <button className="zoom__btn" onClick={() => setZoom((z) => Math.max(0.3, +(z - 0.1).toFixed(2)))} aria-label="缩小">−</button>
                <span className="zoom__val">{Math.round(zoom * 100)}%</span>
                <button className="zoom__btn" onClick={() => setZoom((z) => Math.min(3, +(z + 0.1).toFixed(2)))} aria-label="放大">+</button>
                <button className="zoom__btn" onClick={() => setZoom(1)} title="重置" style={{ fontSize: 12 }}>↺</button>
              </div>
            )}
          </div>
        </div>

        <div className="stage__scroll" style={mode === 'single' ? { padding: '30px 30px 40px' } : undefined}>
          {mode === 'single' ? (
            <PosterScaler
              direction={direction}
              background={background}
              content={livePosterContent}
              font={font}
              showSeal={showSeal}
              titleSize={titleSize}
              bodySize={bodySize}
              kicker={kicker}
              sealFill={sealFill}
              zoom={zoom}
            />
          ) : (
            <div className="compare">
              {DIRECTIONS.map((d) => (
                <div className="compare__item" key={d.id}>
                  <div className="compare__cap">
                    <span className="compare__dot" style={{ background: d.accent }} />
                    {d.name}
                  </div>
                  <ScaledPoster
                    direction={d.id}
                    background={background}
                    content={{ ...livePosterContent, sealText: window.SAL_TEXT[d.id] }}
                    font={font}
                    showSeal={showSeal}
                    maxW={340}
                    titleSize={titleSize}
                    bodySize={bodySize}
                    kicker={kicker}
                    sealFill={d.sealFill}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// ---------- 编辑/预览 分栏拖拽条 ----------
// 桌面拖宽度，移动端拖高度。直接操作 DOM（避免每次拖动重渲染整棵树）。
function Splitter() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const sidebar = el.parentElement.querySelector('.app__sidebar');
    const isVertical = () => window.matchMedia('(max-width: 860px)').matches;

    let dragging = false;

    const onDown = (e) => {
      dragging = true;
      el.classList.add('app__splitter--dragging');
      document.body.style.cursor = isVertical() ? 'row-resize' : 'col-resize';
      document.body.style.userSelect = 'none';
      e.preventDefault();
    };
    const onMove = (e) => {
      if (!dragging || !sidebar) return;
      const point = e.touches ? e.touches[0] : e;
      if (isVertical()) {
        // 移动端：从底部上拖，调整侧栏高度
        const winH = window.innerHeight;
        const newH = winH - point.clientY;
        sidebar.style.height = Math.max(160, Math.min(winH - 120, newH)) + 'px';
      } else {
        const newW = point.clientX;
        sidebar.style.width = Math.max(320, Math.min(window.innerWidth - 320, newW)) + 'px';
      }
    };
    const onUp = () => {
      dragging = false;
      el.classList.remove('app__splitter--dragging');
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    el.addEventListener('mousedown', onDown);
    el.addEventListener('touchstart', onDown, { passive: false });
    window.addEventListener('mousemove', onMove);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchend', onUp);
    return () => {
      el.removeEventListener('mousedown', onDown);
      el.removeEventListener('touchstart', onDown);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchend', onUp);
    };
  }, []);

  return <div className="app__splitter" ref={ref} />;
}

// 单张预览：自适应缩放到舞台高度，再叠加用户缩放 zoom
function PosterScaler({ direction, background, content, font, showSeal, titleSize, bodySize, kicker, sealFill, zoom }) {
  return (
    <div style={{ height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <PosterScaleInner direction={direction} background={background} content={content} font={font} showSeal={showSeal} titleSize={titleSize} bodySize={bodySize} kicker={kicker} sealFill={sealFill} zoom={zoom} />
    </div>
  );
}

// 内部：固定缩放逻辑，避免 Poster 自带的 scaleToFit 与对比冲突
function PosterScaleInner({ direction, background, content, font, showSeal, titleSize, bodySize, kicker, sealFill, zoom = 1 }) {
  const wrapRef = React.useRef(null);
  const [fit, setFit] = React.useState(0.5);
  React.useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const calc = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      setFit(Math.min(w / 600, h / 960));
    };
    calc();
    const ro = new ResizeObserver(calc);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const scale = fit * zoom;
  return (
    <div ref={wrapRef} style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 600, height: 960, transform: `scale(${scale})`, transformOrigin: 'center center', flexShrink: 0 }}>
        <SizedPoster direction={direction} background={background} content={content} font={font} showSeal={showSeal} titleSize={titleSize} bodySize={bodySize} kicker={kicker} sealFill={sealFill} />
      </div>
    </div>
  );
}

// 对比模式：固定较小缩放
function ScaledPoster({ direction, background, content, font, showSeal, maxW, titleSize, bodySize, kicker, sealFill }) {
  const scale = maxW / 600;
  return (
    <div style={{ width: maxW, height: maxW * (960 / 600) }}>
      <div style={{ width: 600, height: 960, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
        <SizedPoster direction={direction} background={background} content={content} font={font} showSeal={showSeal} titleSize={titleSize} bodySize={bodySize} kicker={kicker} sealFill={sealFill} />
      </div>
    </div>
  );
}

// 带实时字号的 Poster 包装：通过 CSS 变量注入
function SizedPoster({ direction, background, content, font, showSeal, titleSize, bodySize, kicker, sealFill }) {
  return (
    <div style={{ '--ts': titleSize + 'px', '--bs': bodySize + 'px' }}>
      <style>{`
        [data-direction] .poster__title { font-size: ${titleSize}px !important; }
        [data-direction] .paper__body { font-size: ${bodySize}px !important; }
      `}</style>
      <Poster direction={direction} background={background} content={content} font={font} showSeal={showSeal} kicker={kicker} sealFill={sealFill} />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
