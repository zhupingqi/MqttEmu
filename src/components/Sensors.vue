<template>
    <a-drawer :title="$t('lang.sensor')"
              placement="right"
              :closable="true"
              :maskClosable="false"
              :visible="visible"
              :keyboard="false"
              :destroyOnClose="true"
              :width="600"
              @close="onClose">
        <div style="right:20px;position:absolute;z-index:2">
            <a-affix>
                <a-button type="primary" shape="circle" icon="plus" @click="eidtSensor" />
            </a-affix>
        </div>
        <template v-if="scripts.length > 0">
            <a-list :grid="{ gutter: 16, column: 2 }" :data-source="scripts" id="scripts_list">
                <a-list-item slot="renderItem" slot-scope="item, index">
                    <a-card :title="item.name">
                        <p>{{ item.comment }}</p>
                        <a-space slot="actions">
                            <a-icon type="edit" @click="itemClick(item.id)"></a-icon>
                            <a-icon type="close" @click="remove(item.id)"></a-icon>
                        </a-space>
                    </a-card>
                </a-list-item>
            </a-list>
            <a-pagination show-size-changer :current="current" :total="total" :pageSize="pageSize" @showSizeChange="onShowSizeChange" @change="onPageChange" style="float:right" class="debug_page" />
        </template>
        <template v-else>

        </template>
    </a-drawer>
</template>

<script lang="ts">
    import { Component, Prop, Vue } from 'vue-property-decorator';
    import bus from '@/core/utils';
    import { db } from "@/core/db";
    import { respository } from "@/core/respository";

    @Component
    export default class Sensors extends Vue {
        visible: boolean = false;
        scripts: any[] = [];
        loading: boolean = false;
        current: number = 1;
        pageSize: number = 20;
        total: number = 0;

        onShowSizeChange(current: number, pageSize: number) {
            this.pageSize = pageSize;
            this.loadPage(current);
        }

        onPageChange(current: number, pageSize: number) {
            this.loadPage(current);
        }

        loadPage(page: number) {
            var _this = this;
            this.loading = true;

            respository.sensor.getList(page, this.pageSize).then(r => {
                _this.scripts = r.data;
                _this.total = r.count;
                _this.current = r.page;
                _this.loading = false;
            });
        }

        onClose() {
            this.visible = false;
        }

        mounted() {
            bus.$on('showSensors', () => {
                this.loadPage(1);
                this.visible = true;
            });

            bus.$on("reload_sensors", () => {                
                this.visible = true;
                this.loadPage(1);
            })
        }

        itemClick(id: number) {
            bus.$emit("eidtSensor", id);
            this.visible = false;
        }

        remove(id: number) {
            let _this = this;

            this.$confirm({
                title: this.$t('lang.removeSensor').toString(),
                content: this.$t('lang.removeSensorContent').toString(),
                okText: 'Yes',
                okType: 'danger',
                cancelText: 'No',
                onOk() {
                    respository.sensor.remove(id).then(() => {
                        _this.loadPage(1);
                    });
                },
                onCancel() {

                }
            });
        }

        eidtSensor() {
            bus.$emit("eidtSensor");
            this.visible = false;
        }
    }
</script>

<style>
    .debug_page .ant-select-arrow {
        right: 5px !important;
    }
</style>