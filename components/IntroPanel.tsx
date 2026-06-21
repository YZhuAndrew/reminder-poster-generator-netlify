import React from 'react';

/**
 * 右栏空状态介绍面板
 *
 * 当尚未生成/加载海报时，在预览区展示项目介绍、核心功能、
 * 以及线上部署地址 https://hsjj.netlify.app（含二维码，方便手机扫码访问）。
 */

const SITE_URL = 'https://hsjj.netlify.app';

const FEATURES: { icon: string; title: string; desc: string }[] = [
  { icon: '🎨', title: '暖纸编辑风', desc: '左对齐巨字标题 · 强调色短线 · 编号要点，4 种版式可选' },
  { icon: '🌈', title: '强调色 + 底色', desc: '6 种强调色 × 6 种底色自由搭配，适配不同主题' },
  { icon: '🔤', title: '真实中文字体', desc: '宋体巨字 / 小薇刊头 / 思源黑体 / 青铜黄油，4 款可加载' },
  { icon: '✍️', title: '富文本编辑', desc: '气泡工具条 · 分组工具栏 · 字数统计，所见即所得' },
];

// 使用公共二维码服务生成当前部署地址的二维码（图片，便于扫码）
const QR_URL = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&margin=8&data=${encodeURIComponent(SITE_URL)}`;

export const IntroPanel: React.FC = () => {
  return (
    <div className="h-full w-full overflow-y-auto custom-scrollbar p-5 lg:p-6 relative z-10">
      <div className="max-w-md mx-auto space-y-5">
        {/* 标题 */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-red-600 rounded-xl shadow-lg shadow-red-900/50 mb-3">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white font-serif-sc tracking-wide">警示海报生成器</h2>
          <p className="text-blue-300/70 text-xs mt-1.5 leading-relaxed">
            面向党建、纪检、安全生产、节日廉洁提醒等场景的中文海报生成工具
          </p>
        </div>

        {/* 线上地址卡片 */}
        <div className="bg-gradient-to-br from-blue-900/40 to-blue-900/10 border border-blue-700/50 rounded-xl p-4">
          <div className="flex items-start gap-4">
            <img
              src={QR_URL}
              alt="线上访问二维码"
              width={80}
              height={80}
              className="w-20 h-20 rounded-lg bg-white p-1.5 flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-emerald-400 text-sm">🌐</span>
                <span className="text-xs font-semibold text-blue-200 uppercase tracking-wider">线上访问</span>
              </div>
              <p className="text-blue-300/60 text-[11px] mb-2">已部署，可随时访问使用</p>
              <a
                href={SITE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-sm text-emerald-300 hover:text-emerald-200 break-all transition-colors"
              >
                {SITE_URL}
              </a>
              <p className="text-blue-400/50 text-[10px] mt-1.5">📱 手机扫码可直达</p>
            </div>
          </div>
        </div>

        {/* 核心功能 */}
        <div>
          <h3 className="text-xs font-bold text-blue-200 uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="w-1 h-3 bg-red-600 rounded-full" />
            核心功能
          </h3>
          <div className="grid grid-cols-1 gap-2">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="flex items-start gap-3 bg-[#0a1628]/60 border border-blue-800/40 rounded-lg p-3"
              >
                <span className="text-xl flex-shrink-0 mt-0.5">{f.icon}</span>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-blue-100">{f.title}</div>
                  <div className="text-[11px] text-blue-400/80 leading-snug mt-0.5">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 使用步骤 */}
        <div className="bg-[#0a1628]/40 border border-blue-800/30 rounded-xl p-4">
          <h3 className="text-xs font-bold text-blue-200 uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="w-1 h-3 bg-red-600 rounded-full" />
            三步生成海报
          </h3>
          <ol className="space-y-2.5">
            {[
              { n: '1', t: '输入内容', d: '填写标题，在编辑器撰写正文' },
              { n: '2', t: '选配色版式', d: '挑强调色、底色、字体、版式' },
              { n: '3', t: '下载海报', d: '调整样式后一键导出 PNG' },
            ].map((s) => (
              <li key={s.n} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-red-600 text-white text-[11px] font-bold flex items-center justify-center mt-0.5">
                  {s.n}
                </span>
                <div className="min-w-0">
                  <span className="text-sm text-blue-100 font-medium">{s.t}</span>
                  <span className="text-blue-400/70 text-[11px] ml-1.5">— {s.d}</span>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* 隐私说明 */}
        <div className="flex items-start gap-2 text-blue-500/50 text-[11px] px-1">
          <svg className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
          <span>纯客户端运行，内容不经过任何服务器，历史记录仅保存在本地浏览器。</span>
        </div>

        {/* 引导提示 */}
        <div className="text-center pt-1">
          <p className="text-blue-200 font-serif-sc text-sm">← 在左侧开始你的创作</p>
          <p className="text-blue-400/50 text-xs mt-1">或从"历史记录"加载已有海报</p>
        </div>
      </div>
    </div>
  );
};
