<template>
    <a-drawer :title="$t('lang.diviceList')"
              placement="right"
              :closable="true"
              :maskClosable="false"
              :visible="visible"
              :keyboard="false"
              :destroyOnClose="true"
              :width="600"
              @close="onClose">
        <template v-if="devices.length > 0">
            <a-list :grid="{ gutter: 16, column: 2 }" :data-source="devices" id="device_list">
                <a-list-item slot="renderItem" slot-scope="item, index">
                    <a-card :title="item.name">
                        <template slot="extra">
                            <a-icon :type="getIcon(item.options)"></a-icon>
                        </template>
                        <a-tag color="geekblue" :title="item.options.protocol + '://' + item.options.host + ':' + item.options.port">{{ item.options.protocol }}://{{ item.options.host }}:{{ item.options.port }}</a-tag>
                        <a-tag color="volcano"  :title="item.options.clientId">{{ item.options.clientId }}</a-tag>
                        <a-tag color="green" :title="item.options.username">{{ item.options.username }}</a-tag>
                        <a-space slot="actions">
                            <a-icon type="upload" @click="toDesk(item,true)" v-if="!item.ondesk && !item.connected"></a-icon>
                            <a-icon type="upload" :rotate="180" @click="toDesk(item,false)" v-if="item.ondesk && !item.connected"></a-icon>
                            <a-icon type="edit" @click="itemClick(item.id)" v-if="!item.connected"></a-icon>
                            <a-icon type="close" @click="removeDevice(item.id)" v-if="!item.connected"></a-icon>
                            <a-icon type="poweroff" v-if="item.connected" @click="disconnect(item)"></a-icon>
                        </a-space>
                    </a-card>
                </a-list-item>
            </a-list>
            <a-pagination show-size-changer :current="current" :total="total" :pageSize="pageSize" @showSizeChange="onShowSizeChange" @change="onPageChange" style="float:right" class="debug_page" />
        </template>
        <template v-else>
            {{$t('lang.noDevice')}}
        </template>
    </a-drawer>
</template>

<script lang="ts">
    import { Component, Prop, Vue } from 'vue-property-decorator';
    import bus from '@/core/utils';
    import { State, Getter,Action, Mutation, namespace } from "vuex-class";
    import { db } from "@/core/db";
    import { respository } from "@/core/respository";
    import { PoweredOnDevice } from "@/store/modules/poweredOnDevice";

    const someModule = namespace("desk_store");

    @Component
    export default class Devices extends Vue {
        visible: boolean = false;
        devices: any[] = [];
        loading: boolean = false;
        current: number = 1;
        pageSize: number = 20;
        total: number = 0;

        @someModule.State(s => s.devices) desk_devices: any;
        @someModule.State(s => s.current) currentDevice: PoweredOnDevice;

        @someModule.Mutation("setCurrentIndex") setCurrentIndex: any;
        @someModule.Mutation("switchOff") switchOff: any;
        @someModule.Mutation("select") select: any;
        @someModule.Getter("getCurrentIndex") getCurrentIndex: any;
        @someModule.Getter("getDevice") getDevice: any;

        @someModule.Action("add") add: any;
        @someModule.Action("remove") remove: any;

        toDesk(item: any, up: boolean) {
            let _this = this;
            if (up) {
                this.add(item.id);
            }
            else {
                this.remove(item.id);
            }

            Vue.set(item,"ondesk",up);
        }

        disconnect(item: any) {
            let r: boolean = this.switchOff(this.currentDevice);
            Vue.set(item, "connected", r);
        }

        removeDevice(id: number) {
            let _this = this;

            this.$confirm({
                title: 'Remove device',
                content: 'Are you sure remove this device?',
                okText: 'Yes',
                okType: 'danger',
                cancelText: 'No',
                onOk() {
                    _this.remove(id);
                    var ps: Promise<any>[] = [];

                    ps.push(respository.log.clear(id));
                    ps.push(respository.topic.clear(id));

                    Promise.all(ps).then(() => {
                        respository.device.remove(id).then(() => {
                            _this.loadPage(1);
                        });
                    });
                },
                onCancel() {

                }
            });
        }

        onClose() {
            this.visible = false;
        }

        itemClick(id: number) {
            this.visible = false;
            bus.$emit("eidtDevice", id);
        }

        getIcon(opt: any) {
            if (!opt.protocol || !opt.host)
                return "file-unknown";

            let u = new URL(opt.protocol + '://' + opt.host);
            console.log(u.host);
            if (opt.host.endsWith("aliyuncs.com"))
                return "aliyun";
            else
                return "file-unknown";
        }

        onShowSizeChange(current: number, pageSize: number) {
            this.pageSize = pageSize;
            this.loadPage(current);
        }

        onPageChange(current: number, pageSize: number) {
            this.loadPage(current);
        }

        loadPage(page: number) {
            let _this = this;

            respository.device.getList(page,20).then(r => {
                _this.devices = r.data;
                _this.total = r.count;
                _this.current = r.page;
                _this.loading = false;

                return r.data;
            }).then(ds => {
                let ps = _this.desk_devices;

                _this.devices.forEach((d: any) => {
                    Vue.set(d, "ondesk", ps.some((p:any) => {
                        return p.device_id == d.id;
                    }));

                    Vue.set(d, "connected", ps.some((p: any) => {
                        return p.connected && p.device_id == d.id;
                    }));
                });
            });
        }

        created() {
            
        }

        mounted() {
            bus.$on('showDeviceList', () => {
                this.loadPage(1);
                this.visible = true;
            });
        }
    }
</script>

<style>
    #device_list .ant-card-body {
        padding: 8px !important;
    }

        #device_list .ant-card-body span.ant-tag {
            text-overflow: ellipsis;
            overflow: hidden;
            width: 100%;
        }

    #device_list .ant-card:hover {
        box-shadow: 0 2px 8px rgba(0,0,0,.15);
    }
</style>
