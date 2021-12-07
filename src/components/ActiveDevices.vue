<template>
    <template v-if="devices.length > 0">
        <a-tabs v-model="device_id" type="card" hide-add>
            <a-tab-pane v-for="device in devices" :key="device.device_id" :closable="false">
                <span slot="tab">
                    <a-icon type="mobile" :rotate="90" />
                    {{ device.device.name }}
                </span>
                <Debug v-bind:device_id="device.device_id" v-bind:connected="device.connected"></Debug>
            </a-tab-pane>
            <a-space :size="12" slot="tabBarExtraContent" v-if="devices.length > 0 && current">
                <a-icon type="api" @click="switchOnDevice" v-if="!current.connected && !current.connecting" />
                <a-icon type="loading" @click="cancelSwitchOn" v-if="current.connecting"/>
                <a-icon type="poweroff" @click="switchOffDevice" v-if="current.connected && !current.connecting" />
                <a-icon type="delete" @click="deleteLog" />
                <a-icon type="close" @click="removeDevice" v-if="!current.connected" />
            </a-space>
        </a-tabs>
    </template>
    <template v-else>
        no data
    </template>
</template>

<script lang="ts">
    import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
    import bus from '@/core/utils';
    import { State, Getter, Action, Mutation, namespace } from "vuex-class";
    import Debug from '@/components/Debug.vue';
    import { PoweredOnDevice } from "@/store/modules/poweredOnDevice";
    import { respository } from "@/core/respository";

    const someModule = namespace("desk_store");

    @Component({
        components: {
            Debug
        }
    })
    export default class ActiveDevices extends Vue {
        @someModule.State(s => s.devices) devices: PoweredOnDevice[];
        @someModule.State(s => s.current) current: PoweredOnDevice;

        @someModule.Mutation("switchOn") switchOn: any;
        @someModule.Mutation("cancelOn") cancelOn: any;
        @someModule.Mutation("switchOff") switchOff: any;        
        @someModule.Mutation("setCurrentIndex") setCurrentIndex: any;
        @someModule.Mutation("select") select: any;
        @someModule.Getter("getCurrentIndex") getCurrentIndex: any;
        @someModule.Getter("find") findDevice: any;

        @someModule.Action("updateDevice") updateDevice: any;
        @someModule.Action("init") deskInit: any;
        @someModule.Action("remove") remove: any;

        device_id: number = 0;

        @Watch("device_id")
        onTabChange(newVal: number, oldVal: number) {
            if (newVal)
                this.select(newVal);
        }

        created() {
            this.deskInit().then(() => {
                if (this.current)
                    this.device_id = this.current.device_id;
            });
        }

        enable(enable: boolean, e: any) {

        }

        switchOnDevice() {
            this.switchOn(this.current);
        }

        switchOffDevice() {
            this.switchOff(this.current);
        }

        cancelSwitchOn() {
            this.cancelOn(this.current);
        }

        removeDevice() {
            let _this = this;

            this.$confirm({
                title: 'Remove device',
                content: 'Are you sure remove this device?',
                okText: 'Yes',
                okType: 'danger',
                cancelText: 'No',
                onOk() {
                    _this.remove(_this.current.device_id);
                },
                onCancel() {

                }
            });
        }

        deleteLog() {
            let _this = this;

            this.$confirm({
                title: 'Clear history',
                content: 'Are you sure clear this history?',
                okText: 'Yes',
                okType: 'danger',
                cancelText: 'No',
                onOk() {
                    _this.current.clear().then(() => {
                        bus.$emit("clearLog", _this.current.device_id);
                    });
                },
                onCancel() {

                }
            });           
        }

        mounted() {
            let _this = this;

            bus.$on('publishTopic', (id: number) => {
                respository.topic.get(id).then(t => {
                    if (t)
                        _this.current.publish(t);
                });
            });

            bus.$on('subscribeTopic', (e: any) => {
                respository.topic.update(e.id, { enable: e.enable }).then(() => {
                    return respository.topic.get(e.id).then(t => {
                        if (t)
                            _this.current.subscribe(t);
                    });
                });
            });

            bus.$on('selectDevice', (id: number) => {
                this.device_id = id;
            });

            bus.$on('updateDevice', (id: number) => {
                this.updateDevice(id);
            });
        }
    }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
    #device_list li {
        top: 10px;
    }
</style>
