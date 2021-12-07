import Vue from 'vue';
import Help from './Help.vue';

Vue.config.productionTip = true;

new Vue({
    render: h => h(Help)
}).$mount('#app');
