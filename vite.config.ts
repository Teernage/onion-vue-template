import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { crx } from '@crxjs/vite-plugin'
import json from '@rollup/plugin-json'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import updateVersion from './vite-plugin-update-version'

const filename = fileURLToPath(import.meta.url)
const _dirname = path.dirname(filename)

const manifest = JSON.parse(fs.readFileSync('./src/manifest.json', 'utf-8'))

export default defineConfig(({ command, mode }) => {
  const isProduction = command === 'build'
  const updateType = ['patch', 'minor', 'major'].includes(mode) ? mode : 'patch'

  return {
    plugins: [
      vue(),
      ...(isProduction ? [updateVersion(updateType)] : []),
      json(),
      AutoImport({
        resolvers: [ElementPlusResolver()]
      }),
      Components({
        resolvers: [ElementPlusResolver()]
      }),
      crx({
        manifest
      }),
      {
        name: 'inject-css',
        transformIndexHtml(html) {
          return html.replace(
            /<\/head>/,
            `<style>  
              body {  
                margin: 0;  
                padding: 0;  
               background-color: rgb(222, 227, 233);  
              }  
            </style>  
            </head>`
          )
        }
      }
    ],
    define: {
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false
    },
    resolve: {
      alias: {
        '@': path.resolve(_dirname, './src')
      }
    },
    server: {
      port: 8888,
      watch: {
        usePolling: true,
        interval: 3000
      },
      hmr: {
        overlay: false
      }
    },
    build: {
      sourcemap: false,
      minify: 'esbuild',
      rollupOptions: {
        output: {
          manualChunks: {
            'vue-vendor': ['vue', 'vue-router', 'pinia', 'pinia-plugin-persistedstate'],
            'element-plus': ['element-plus'],
            axios: ['axios'],
            driver: ['driver.js'],
            'vue-draggable': ['vue-draggable-plus'],
            utils: ['fs-extra', 'yauzl']
          }
        }
      }
    },
    optimizeDeps: {
      include: ['vue', 'vue-router', 'pinia']
    },
    esbuild: {
      drop: ['debugger'],
      pure: ['console.log', 'console.info', 'console.trace', 'console.warn'],
      legalComments: 'none'
    }
  }
})
