import { createApp } from 'vue'
import './style/reset.css'
import './style/index.css'
import App from './App.vue'
import { createPinia } from 'pinia'
import persistedState from 'pinia-plugin-persistedstate'
import router from './router'
import { clickOutside } from '@/directives/clickOutside'
import 'element-plus/dist/index.css'

const app = createApp(App)

const pinia = createPinia()
pinia.use(persistedState)
app.directive('clickoutside', clickOutside)

app.use(pinia).use(router).mount('#app')
