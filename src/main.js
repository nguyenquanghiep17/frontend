import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import InboxView from './views/InboxView.vue'
import SentView from './views/SentView.vue'

const routes = [
  { path: '/', redirect: '/inbox' },
  { path: '/inbox', component: InboxView },
  { path: '/sent', component: SentView }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

const app = createApp(App)
app.use(router)
app.mount('#app')

