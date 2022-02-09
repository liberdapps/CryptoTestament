import { createApp } from 'vue';
import App from './App.vue';
import wallet from './wallet.js';


async function load() {
    await wallet.connect();

    let s = 0;
    if(s==0)
    {
        createApp(App).mount('#app');

    }

}

load();
