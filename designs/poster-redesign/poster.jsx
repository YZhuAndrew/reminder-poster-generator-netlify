/* poster.jsx —— 海报渲染（极简编辑设计 / 暖纸调）
   构图：顶部元信息行 → 左对齐巨字标题 → 朱红短线 → 正文（编号要点）→ 印章
   强调色由 direction 控制；底色由 background(data-bg) 控制，二者独立。 */

const { useState, useLayoutEffect, useRef } = React;

// ---------- 印章 ----------
// 朱印作为构图唯一的强调锚点，小而克制，文字可配（2-6 字自适应单/双行）。
const Seal = ({ text, fill }) => {
  const chars = (text || '').trim().split('');
  const isLong = chars.length > 3;
  const half = Math.ceil(chars.length / 2);
  const line1 = chars.slice(0, half).join('');
  const line2 = chars.slice(half).join('');

  return (
    <div className="seal">
      <svg className="seal__svg" viewBox="0 0 100 100">
        <rect className="seal__rect" x="6" y="6" width="88" height="88" rx="6" fill={fill || '#b3261e'} />
        <rect
          x="11" y="11" width="78" height="78" rx="3"
          fill="none" stroke="#fff" strokeOpacity="0.6" strokeWidth="2"
        />
        {isLong ? (
          <>
            <text x="50" y="45" textAnchor="middle" fill="#fff"
              fontFamily="'Noto Serif SC', serif" fontWeight="900" fontSize="24" letterSpacing="2">{line1}</text>
            <text x="50" y="75" textAnchor="middle" fill="#fff"
              fontFamily="'Noto Serif SC', serif" fontWeight="900" fontSize="24" letterSpacing="2">{line2}</text>
          </>
        ) : (
          <text x="50" y="50" textAnchor="middle" dominantBaseline="central"
            fill="#fff" fontFamily="'Noto Serif SC', serif" fontWeight="900"
            fontSize={chars.length <= 2 ? 34 : 27} letterSpacing={chars.length <= 2 ? 4 : 2}>{text}</text>
        )}
      </svg>
    </div>
  );
};

// ---------- 海报主体 ----------
const Poster = ({
  direction = 'party',
  background = 'paper',
  content,
  font,
  showSeal = true,
  kicker,
  sealFill,
}) => {
  const { title, body, sealText } = content;

  const titleStyle = { fontFamily: font.title, fontWeight: font.weight };

  return (
    <div className="poster" data-direction={direction} data-bg={background}>
      <div className="poster__bg" />
      <div className="poster__frame">
        {/* 报头元信息：kicker · 期号 */}
        <div className="poster__meta">
          <span><b>●</b> {kicker || '廉洁提醒'}</span>
          <span>{content.issue || '第 001 期'}</span>
        </div>

        {/* 左对齐巨字标题 + 强调色短线 */}
        <h1 className="poster__title" style={titleStyle}>{title}</h1>
        <hr className="poster__rule" />

        {/* 正文：不套卡片，直接纸面排布 */}
        <div className="paper">
          <div
            className="paper__body rich"
            style={{ fontFamily: font.body }}
            dangerouslySetInnerHTML={{ __html: body }}
          />
        </div>
      </div>

      {showSeal && <Seal text={sealText} fill={sealFill} />}
    </div>
  );
};

Object.assign(window, { Poster, Seal });
