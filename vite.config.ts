import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, (process as any).cwd(), '');

  // CRITICAL: Vercel injects variables into process.env.
  // We check multiple sources to ensure we capture the key regardless of how it was named or loaded.
  // 1. env.API_KEY (Loaded by Vite from .env files)
  // 2. process.env.API_KEY (System env var, e.g. Vercel Settings)
  // 3. VITE_ prefixed versions as fallbacks
  const apiKey = env.API_KEY || process.env.API_KEY || env.VITE_API_KEY || process.env.VITE_API_KEY;
  
  return {
    plugins: [react()],
    define: {
      // Polyfill process.env.API_KEY so the existing code works.
      // If apiKey is undefined, it strings as undefined, causing the runtime check to fail gracefully.
      'process.env.API_KEY': JSON.stringify(apiKey)
    }
  };
});