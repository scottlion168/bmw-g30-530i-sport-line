import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  // 自動取得「台灣/台北時間 (UTC+8)」格式化字串 (YYYY-MM-DD HH:mm)
  const now = new Date();
  const taiwanTimeStr = now.toLocaleString('sv-SE', { 
    timeZone: 'Asia/Taipei' 
  }).slice(0, 16); // 產出格式如: "2025-02-23 16:30"

  return {
    base: '/bmw-g30-530i-sport-line/', // 👈 關鍵！一定要有這行！
    define: {
      __BUILD_TIMESTAMP__: JSON.stringify(taiwanTimeStr),
    },
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    build: {
      chunkSizeWarningLimit: 1500,
    },
  };
});
