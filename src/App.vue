<template>
    <a-layout id="app">
        <a-layout-sider v-model="collapsed" collapsible :trigger="null">
            <div class="logo" :style="{ 'background-image': getLogoImg()}"></div>
            <a-menu theme="dark" mode="inline" :default-selected-keys="['1']">
                <a-menu-item key="1" @click="newDevice()">
                    <a-icon type="plus" />
                    <span>{{$t('lang.newDevice')}}</span>
                </a-menu-item>
                <a-menu-item key="2" @click="showDeviceList()">
                    <a-icon type="mobile" :rotate="90" />
                    <span>{{$t('lang.diviceList')}}</span>
                </a-menu-item>
                <a-menu-item key="3" @click="showSensors()">
                    <a-icon type="alert" />
                    <span>{{$t('lang.sensor')}}</span>
                </a-menu-item>
                <a-menu-item key="4" @click="showScript()">
                    <a-icon type="file" />
                    <span>{{$t('lang.script')}}</span>
                </a-menu-item>
            </a-menu>
        </a-layout-sider>
        <a-layout>
            <a-layout-header style="background: #fff; padding: 0">
                <a-icon class="trigger" :type="collapsed ? 'menu-unfold' : 'menu-fold'" @click="() => (collapsed = !collapsed)" />
                <a-space style="float:right;margin-right:24px" :size="12">
                    <a-tooltip placement="bottom" mouseEnterDelay="1">
                        <template slot="title">
                            <img :src="getWechatImg()" width="150" />
                        </template>
                        <a-icon type="wechat" />
                    </a-tooltip>
                    <a-tooltip :title="$t('lang.source')" mouseEnterDelay="1">
                        <a-icon type="github" @click="showGithub" />
                    </a-tooltip>
                    <a-tooltip :title="$t('lang.home')" mouseEnterDelay="1">
                        <a-icon type="home" @click="showHome" />
                    </a-tooltip>
                    <a-select style="width: 120px" v-model="locale" @change="onI18nChange" default-value="zh">
                        <a-select-option value="zh">
                            简体中文
                        </a-select-option>
                        <a-select-option value="en">
                            English
                        </a-select-option>
                    </a-select>
                </a-space>
            </a-layout-header>
            <a-layout-content :style="{ margin: '24px 16px', padding: '24px', background: '#fff', minHeight: '280px' }">
                <ActiveDevices></ActiveDevices>
            </a-layout-content>
        </a-layout>
        <DeviceEdit></DeviceEdit>
        <Devices></Devices>
        <Sensors></Sensors>
        <SensorEdit></SensorEdit>
        <ScriptEdit></ScriptEdit>
        <Pub></Pub>
        <Sub></Sub>
    </a-layout>
</template>

<script lang="ts">
    import { Component, Vue } from 'vue-property-decorator';
    import ActiveDevices from './components/ActiveDevices.vue';
    import Devices from './components/Devices.vue';
    import Sensors from './components/Sensors.vue';
    import ScriptEdit from './components/ScriptEdit.vue';
    import SensorEdit from './components/SensorEdit.vue';
    import Pub from './components/Pub.vue';
    import Sub from './components/Sub.vue';
    import DeviceEdit from './components/DeviceEdit.vue';
    import bus from '@/core/utils';
    import { respository } from './core/respository';

    const shell = require('electron').shell;

    @Component({
        components: {
            Devices,
            ActiveDevices,
            DeviceEdit,
            Sensors,
            SensorEdit,
            ScriptEdit,
            Pub,
            Sub
        }
    })
    export default class App extends Vue {
        collapsed: boolean = false;
        locale: string = "zh";

        newDevice() {
            bus.$emit("eidtDevice", null);
        }

        showDeviceList() {
            bus.$emit("showDeviceList", null);
        }

        showScript() {
            bus.$emit("eidtScript", null);
        }

        showSensors() {
            bus.$emit("showSensors", null);
        }

        showGithub() {
            shell.openExternal("https://github.com/zhupingqi/MqttEmu");
        }

        showHome() {
            shell.openExternal("http://www.imqtt.net");
        }

        getResPath() {
            let p = ".";
            if (__filename.endsWith("\\resources\\app/index.html"))
                p = "resources/app";

            return p;
        }

        getWechatImg() {
            let p = this.getResPath();

            let n = (new Date()).getTime() % 2;

            return `app://${p}/img/wechat${n}.png`;
        }

        getLogoImg() {
            let p = this.getResPath();

            return `url(app://${p}/img/logo200.png)`;
        }

        onI18nChange() {
            let _this = this;

            respository.options.addOrUpdate("locale", this.locale).then(() => {
                this.$i18n.locale = _this.locale;
                bus.$emit("i18nChange");
            });
        }

        mounted() {
            let _this = this;

            respository.options.get("locale").then((locale) => {
                if (locale)
                    _this.locale = locale;
            });
        }
    }
</script>

<style>
    #app {
        height:100%;
    }

        #app .trigger {
            margin: 24px;
            float:left;
        }

    .anticon {
        font-size: 18px;
    }

    .logo {
        height: 48px;
        background: rgba(255, 255, 255, 0.1);
        margin: 8px 6px 3px 6px;
        text-align: center;
        overflow: hidden;
        background-repeat: no-repeat;
        background-size: contain;
        background-position: center;
    }

    .logo img{
        height:48px;
    }

    #device_content {
        margin: 24px 16px;
        padding: 0;
        background: #fff;
        min-height: 280px;
    }

    .ant-layout-sider-collapsed .logo{

    }

    .ace_editor{
        margin-left:15px;
    }
</style>
