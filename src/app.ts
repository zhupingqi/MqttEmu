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

    const clickoutsideContext = '@@clickoutsideContext';

    Vue.directive("clickOut", {
        bind(el: any, binding: any, vnode: any) {
            const documentHandler = function (e: any) {
                if (!vnode.context || el.contains(e.target)) {
                    return false;
                }
                if (binding.expression) {
                    vnode.context[el[clickoutsideContext].methodName](e)
                } else {
                    el[clickoutsideContext].bindingFn(e);
                }
            };

            el[clickoutsideContext] = {
                documentHandler,
                methodName: binding.expression,
                bindingFn: binding.value
            };

            setTimeout(() => {
                document.addEventListener('click', documentHandler);
            }, 0);
        },
        update(el: any, binding: any) {
            el[clickoutsideContext].methodName = binding.expression;
            el[clickoutsideContext].bindingFn = binding.value;
        },
        unbind(el: any) {
            document.removeEventListener('click', el[clickoutsideContext].documentHandler);
        }
    });

    new Vue({
        i18n,
        store,
        render: h => h(App)
    }).$mount('#app');
});


