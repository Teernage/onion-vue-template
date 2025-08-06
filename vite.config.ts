import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { crx } from '@crxjs/vite-plugin';
import json from '@rollup/plugin-json';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';

const filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(filename);

const manifest = JSON.parse(fs.readFileSync('./src/manifest.json', 'utf-8'));

export default defineConfig(({ command, mode }) => {
  return {
    plugins: [
      vue(),
      json(),
      AutoImport({
        resolvers: [ElementPlusResolver()],
      }),
      Components({
        resolvers: [ElementPlusResolver()],
      }),
      crx({
        manifest: () => {
          return manifest;
        },
      }),
    ],
    test: {
      globals: true,
      environment: 'jsdom',
      include: ['**/*.{test,spec}.{js,ts,jsx,tsx}'],
      exclude: ['node_modules', 'dist', '.idea', '.git', '.cache'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        exclude: ['node_modules/', 'tests/'],
      },
    },
    define: {
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
    },
    resolve: {
      alias: {
        '@': path.resolve(_dirname, './src'),
      },
    },
    server: {
      port: 8888,
      watch: {
        usePolling: true,
        interval: 3000,
      },
      hmr: {
        overlay: false,
      },
    },
    build: {
      sourcemap: false,
      minify: 'esbuild',
    },
    optimizeDeps: {
      include: ['vue', 'vue-router', 'pinia'],
    },
    esbuild: {
      drop: ['debugger'],
      pure: ['console.log', 'console.info', 'console.trace', 'console.warn'],
      legalComments: 'none',
    },
  };
});
