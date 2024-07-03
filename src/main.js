import { createApp } from 'vue';
import './styles/style.css';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import { createRouter, createWebHistory } from 'vue-router';
import routes from '~pages';
import VueCookies from 'vue-cookies';
import Axios from 'axios';
import App from './App.vue';

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});
export const cookies = VueCookies;
export const axios = Axios;

const pinia = createPinia();
const app = createApp(App);

app.use(ElementPlus);
app.use(router);
app.use(pinia);
pinia.use(piniaPluginPersistedstate);

app.mount('#app');
