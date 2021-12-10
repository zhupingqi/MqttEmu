import Vue from 'vue';
import App from './App.vue';

import Antd, { message } from 'ant-design-vue';
import 'ant-design-vue/dist/antd.css'
Vue.use(Antd);

Vue.config.productionTip = true;

import VueI18n from 'vue-i18n';
Vue.use(VueI18n);

import store from "./store/index";
import { respository } from './core/respository';

respository.options.get("locale").then((locale) => {
    if (!locale) {
        locale = "zh";
    }

    const i18n = new VueI18n({
        locale: locale,
        messages: {
            'zh': require('./lang/zh.js'),
            'en': require('./lang/en.js')
        }
    });

    new Vue({
        i18n,
        store,
        render: h => h(App)
    }).$mount('#app');
});


