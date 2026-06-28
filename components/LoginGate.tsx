import React, { useState } from 'react';

/**
 * 纯前端登录门槛
 *
 * 说明：本项目为纯静态站点（Netlify），无后端。
 * 这里的"登录"只是一个客户端门槛，用于避免无关人员随意进入。
 * 校验逻辑在前端运行，任何有前端经验的人都可以绕过——
 * 它不是真正的服务端鉴权，请勿用于保护敏感数据。
 *
 * 默认凭据：用户名 srsw / 密码 srsw（见 LOGIN_CREDENTIALS）。
 * 登录通过后写入 sessionStorage，刷新当前会话内不再要求重新登录。
 */

// 默认凭据（纯前端校验，非安全边界）
const LOGIN_CREDENTIALS = {
  username: 'srsw',
  password: 'srsw',
};

const STORAGE_KEY = 'srsw_auth_v1';

export function isAuthed(): boolean {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === 'ok';
  } catch {
    return false;
  }
}

export function logout(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export const LoginGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authed, setAuthed] = useState<boolean>(() => isAuthed());

  if (authed) return <>{children}</>;

  return <LoginForm onSuccess={() => setAuthed(true)} />;
};

const LoginForm: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    // 模拟一点延迟，给登录反馈
    setTimeout(() => {
      const ok =
        username.trim() === LOGIN_CREDENTIALS.username && password === LOGIN_CREDENTIALS.password;
      setSubmitting(false);
      if (!ok) {
        setError('用户名或密码错误');
        return;
      }
      try {
        sessionStorage.setItem(STORAGE_KEY, 'ok');
      } catch {
        /* ignore */
      }
      onSuccess();
    }, 200);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#17130e] px-4 relative overflow-hidden">
      {/* 背景纹理：与主应用一致的暖灰点阵 */}
      <div
        className="absolute inset-0 opacity-[0.07] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(rgba(180,150,90,0.5) 1px, transparent 1px)', backgroundSize: '24px 24px' }}
      />
      {/* 顶部朱红装饰条 */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#b3261e] to-[#8c1a14]" />

      <div className="relative w-full max-w-sm">
        {/* 标题区 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-[#b3261e] rounded-xl shadow-lg shadow-black/40 mb-4">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white font-serif-sc tracking-wide">警示海报生成</h1>
          <p className="text-[#a89e8c] text-xs mt-1.5">请登录后使用</p>
        </div>

        {/* 登录卡片 */}
        <form
          onSubmit={handleSubmit}
          className="bg-[#241d14]/90 backdrop-blur border border-[#3d3220] rounded-xl p-6 space-y-4 shadow-2xl"
        >
          <div>
            <label className="block text-xs font-semibold text-[#c4b79e] mb-1.5">用户名</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              placeholder="请输入用户名"
              className="w-full bg-[#2a2218] border border-[#3d3220] rounded-lg p-3 text-white focus:ring-2 focus:ring-[#b3261e] focus:border-transparent focus:outline-none placeholder-[#6f6657] min-h-[44px]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#c4b79e] mb-1.5">密码</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                placeholder="请输入密码"
                className="w-full bg-[#2a2218] border border-[#3d3220] rounded-lg p-3 pr-12 text-white focus:ring-2 focus:ring-[#b3261e] focus:border-transparent focus:outline-none placeholder-[#6f6657] min-h-[44px]"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-[#a89e8c] hover:text-[#c4b79e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b3261e] rounded"
                title={showPassword ? '隐藏密码' : '显示密码'}
                aria-label={showPassword ? '隐藏密码' : '显示密码'}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                    />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div role="alert" className="flex items-center gap-2 text-[#f0bcb6] text-sm bg-[#5a1a16]/60 border border-[#7a2a22] rounded-lg px-3 py-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 bg-gradient-to-r from-[#b3261e] to-[#8c1a14] hover:from-[#c92a20] hover:to-[#a01e16] disabled:opacity-60 text-white font-bold rounded-lg shadow-lg shadow-black/40 transition-all min-h-[48px] flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#17130e] focus-visible:ring-[#b3261e]"
          >
            {submitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                登录中...
              </>
            ) : (
              '登录'
            )}
          </button>
        </form>

        <p className="text-center text-[#6f6657] text-xs mt-6 leading-relaxed">
          请输入访问口令
        </p>
      </div>
    </div>
  );
};
