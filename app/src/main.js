import { createApp } from 'vue';
import App from './App.vue';
import wallet from './wallet.js';


async function load() {
    await wallet.connect();
    createApp(App).mount('#app');
}

load();
