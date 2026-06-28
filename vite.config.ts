import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// 纯前端静态站点，无后端 API。
// 早期版本的 Google Gemini API_KEY / API_BASE_URL 代理逻辑已随 AI 链路一并移除。
export default defineConfig({
  plugins: [react()],
});
