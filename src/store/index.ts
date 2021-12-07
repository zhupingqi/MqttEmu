import Vue from 'vue';
import Vuex from 'vuex';
Vue.use(Vuex);

import desk_store from '@/store/modules/poweredOnDevice';

export default new Vuex.Store({
    modules: {
        desk_store
    }
});