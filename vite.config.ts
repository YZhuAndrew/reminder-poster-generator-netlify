import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, (process as any).cwd(), '');

  // 1. Capture API Key
  const apiKey = env.API_KEY || process.env.API_KEY || env.VITE_API_KEY || process.env.VITE_API_KEY;
  
  // 2. Capture Optional Base URL (For Proxying Google API in China)
  // Example: https://my-openai-proxy.com/google/v1beta
  const apiBaseUrl = env.API_BASE_URL || process.env.API_BASE_URL || env.VITE_API_BASE_URL || process.env.VITE_API_BASE_URL;

  return {
    plugins: [react()],
    define: {
      // Polyfill process.env for the client-side code
      'process.env.API_KEY': JSON.stringify(apiKey || ''),
      'process.env.API_BASE_URL': JSON.stringify(apiBaseUrl || '')
    }
  };
});