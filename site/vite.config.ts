import { sites } from '@openai/sites-vite-plugin';
import tailwindcss from '@tailwindcss/postcss';
import vinext from 'vinext';
import { defineConfig } from 'vite';

// This landing page exports static HTML and needs no Worker runtime.
export default defineConfig({
  css: { postcss: { plugins: [tailwindcss()] } },
  server: { host: '127.0.0.1', port: 3000, strictPort: true },
  plugins: [vinext(), ...(process.env.GITHUB_ACTIONS ? [] : [sites()])],
});
