import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
const here = fileURLToPath(new URL('.', import.meta.url));
export default defineConfig({
  root: fileURLToPath(new URL('../NgaNgo.Web/wwwroot/', import.meta.url)),
  base: './',
  publicDir: false,
  build: { outDir: here + 'dist', emptyOutDir: true, target: 'es2022' },
  plugins: [{
    name: 'installed-app-entry',
    transformIndexHtml: { order: 'pre', handler: html => html
      .replace('<script type="module" src="/js/app.js"></script>', '<script type="module" src="/native-entry.js"></script>')
      .replace(/\s*<link rel="manifest"[^>]*>/, '') },
    resolveId(id) { if (id === '/native-entry.js') return here + 'src/native-entry.js'; }
  }]
});
