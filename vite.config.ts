import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import { fileURLToPath } from 'url';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';

const filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(filename);

export default defineConfig(({ command, mode }) => {
  return {
    plugins: [
      vue(),
      AutoImport({
        resolvers: [ElementPlusResolver()],
      }),
      Components({
        resolvers: [ElementPlusResolver()],
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(_dirname, './src'),
      },
      preserveSymlinks: false, // 根据需要适配
    },
    server: {
      port: 8888,
      hmr: {
        overlay: false,
      },
    },
    build: {
      sourcemap: false,
      minify: 'esbuild',
      rollupOptions: {
        output: {
          manualChunks: {
            'vue-vendor': [
              'vue',
              'vue-router',
              'pinia',
              'pinia-plugin-persistedstate',
            ],
            'element-plus': ['element-plus'],
            axios: ['axios'],
          },
        },
      },
    },
    optimizeDeps: {
      include: ['vue', 'vue-router', 'pinia'],
    },
    esbuild: {
      drop: ['debugger'],
      pure: ['console.log', 'console.info'],
      legalComments: 'none', // 确保不保留注释（例如版权声明注释）
    },
  };
});
