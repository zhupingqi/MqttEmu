<template>
    <a-layout style="height:100%">
        <a-layout-sider style="border-right: 1px solid #e8e8e8;padding: 5px;background-color: white;">
            <!--<a-affix :offset="top" @change="affix_change" :target="() => this.$root.$children[0].$refs.mainLayout.$el">-->
                <div class="debug_btn">
                    <a-tooltip :title="$t('lang.newPublish')" mouseEnterDelay="1">
                        <a-button icon="upload" @click="newPub()" size="small" />
                    </a-tooltip>
                    <a-tooltip :title="$t('lang.newSubscription')" mouseEnterDelay="1">
                        <a-button icon="download" @click="newSub()" size="small" />
                    </a-tooltip>
                    <!--<a-button icon="check-circle" @click="" size="small" title="enable all publish" />
            <a-button icon="stop" @click="" size="small" title="disable all publish" />-->
                </div>
                <a-tree show-icon default-expand-all :tree-data="treeData" class="topic_tree">
                    <template #title="{ key: treeKey, title, topic,color, enable,type}">
                        <a-dropdown :trigger="['contextmenu']" v-if="treeKey !== ''">
                            <a-tooltip :title="topic" mouseEnterDelay="1">
                                <a-button type="link" :icon="!enable?'stop':'check'" :style="getTopicStyle(treeKey,topic,color) ">{{ title }}</a-button>
                            </a-tooltip>
                            <template #overlay>
                                <a-menu @click="({ key: menuKey }) => onContextMenuClick(treeKey, menuKey, type)">
                                    <a-menu-item key="publish" :disabled="!connected" v-if="type === 'pub'">{{$t('lang.publish')}}</a-menu-item>
                                    <a-menu-divider v-if="type === 'pub'" />
                                    <template v-if="type==='pub'">
                                        <a-menu-item key="disable" v-if="enable === true">{{$t('lang.disable')}}</a-menu-item>
                                        <a-menu-item key="enable" v-if="enable === false">{{$t('lang.enable')}}</a-menu-item>
                                    </template>
                                    <template v-else>
                                        <a-menu-item key="disable" v-if="enable === true" :disabled="!connected">{{$t('lang.disable')}}</a-menu-item>
                                        <a-menu-item key="enable" v-if="enable === false" :disabled="!connected">{{$t('lang.enable')}}</a-menu-item>
                                    </template>
                                    <a-menu-item key="edit">{{$t('lang.edit')}}</a-menu-item>
                                    <a-menu-divider />
                                    <a-menu-item key="remove">{{$t('lang.remove')}}</a-menu-item>
                                </a-menu>
                            </template>
                        </a-dropdown>
                        <a-dropdown :trigger="['contextmenu']" v-else>
                            <span>{{ title }}</span>
                        </a-dropdown>
                    </template>
                </a-tree>
            <!--</a-affix>-->
        </a-layout-sider>
        <a-layout-content style="background-color: white;padding: 5px">
            <div class="ant-table ant-table-default" style="margin-bottom:10px">
                <div class="ant-table-content">
                    <div class="ant-table-body" style="overflow-y: scroll; overflow-x: hidden ;max-height: calc(100vh - 200px) ">
                        <table>
                            <thead class="ant-table-thead">
                                <tr>
                                    <th key="name" width="200">
                                        <span class="ant-table-header-column"><div><span class="ant-table-column-title"><span>{{$t('lang.action')}}</span></div></span>
                                    </th>
                                    <th key="age">
                                        <span class="ant-table-header-column"><div><span class="ant-table-column-title">{{$t('lang.content')}}</span></div></span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody class="ant-table-tbody">
                                <template v-if="loading">
                                    <tr>
                                        <td colspan="2" style="text-align:center;padding:50px">
                                            <a-spin tip="Loading..."></a-spin>
                                        </td>
                                    </tr>
                                </template>
                                <template v-else>
                                    <template v-if="logs.length > 0">
                                        <tr class="ant-table-row ant-table-row-level-0" :data-row-key="item.id" v-for="item in logs">
                                            <td style="vertical-align:top">
                                                <a-row>
                                                    {{ item.action }} <a-icon :rotate="90" :type="getActionIcon(item.action)" style="font-size:12px;float:right;padding-top:4px" />
                                                </a-row>
                                                <a-row>
                                                    {{ dateFormat(item.create) }}
                                                </a-row>
                                            </td>
                                            <td style="word-break:break-all;vertical-align:top">
                                                <a-row v-if="item.topic && item.topic !== ''"><a-tag @click="tagClick(item)" :style="getTagStyle(item)">{{ item.topic }}</a-tag></a-row>
                                                <a-row>{{item.content}}</a-row>
                                            </td>
                                        </tr>
                                    </template>
                                    <template v-else>
                                        <tr>
                                            <td colspan="2">
                                                <a-empty />
                                            </td>
                                        </tr>
                                    </template>
                                </template>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <a-pagination show-size-changer :current="current" :total="total" :pageSize="pageSize" @showSizeChange="onShowSizeChange" @change="onPageChange" style="float:right;margin-bottom: 10px;margin-right:20px" class="debug_page" />
        </a-layout-content>
    </a-layout>
</template>

<script lang="ts">
    import { Component, Prop, Vue } from 'vue-property-decorator';
    import bus from '@/core/utils';
    import { db } from "@/core/db";
    import { respository } from "@/core/respository";
    import { format } from 'date-fns';

    @Component
    export default class Debug extends Vue {
        logs: db.Log[] = [];
        loading: boolean = false;
        current: number = 1;
        pageSize: number = 20;
        total: number = 0;
        treeData: any = [];
        currentLog: db.Log | null = null;
        top: number = 10;

        @Prop() device_id!: number;

        @Prop() connected!: boolean;

        onShowSizeChange(current: number, pageSize: number) {
            this.pageSize = pageSize;
            this.loadPage(current);
        }

        onPageChange(current: number, pageSize: number) {
            this.loadPage(current);
        }

        dateFormat(date: Date) {
            return format(date,"yyyy/MM/dd HH:mm:ss.SSS");
        }

        loadPage(page: number) {
            var _this = this;
            this.loading = true;

            respository.log.getList(this.device_id, page, this.pageSize).then(r => {
                _this.logs = r.data;
                _this.total = r.count;
                _this.current = r.page;
                _this.loading = false;
            });
        }

        newPub() {
            bus.$emit("eidtPub", { device_id: this.device_id });
        }

        newSub() {
            bus.$emit("eidtSub", { device_id: this.device_id });
        }

        loadTreeData() {
            let _this = this;
            this.treeData = [{
                title: this.$t('lang.publish'),
                key: "",
                selectable: false,
                slots: {
                    icon: 'upload'
                },
                children: []
            }, {
                title: this.$t('lang.subscription'),
                key: "",
                selectable: false,
                slots: {
                    icon: 'download'
                },
                children: []
            }];

            return respository.topic.getList(this.device_id).then(ds => {
                _this.treeData[0].children = [];
                _this.treeData[1].children = [];

                ds.forEach(d => {
                    let index = 0;
                    if (d.type == "sub")
                        index = 1;

                    let title = $.trim(d.name) == '' ? 'no name': d.name;

                    _this.treeData[index].children.push({
                        title: title,
                        key: d.id,
                        topic: d.topic,
                        color: d.color,
                        type: d.type,
                        enable: d.enable,
                        selectable: false
                    });
                });
            });
        }

        onContextMenuClick(treeKey: any, menuKey: any, type: string) {
            let id = treeKey;
            let _this = this;

            if (menuKey == "publish") {
                bus.$emit("publishTopic", id);
            }

            if (menuKey == "disable") {
                if (type == "sub") {
                    bus.$emit("subscribeTopic", {
                        id: id,
                        enable: false
                    });
                }
                else {
                    respository.topic.update(id, {
                        enable: false
                    }).then(() => {
                        _this.loadTreeData();
                    });
                }
            }

            if (menuKey == "enable") {
                if (type == "sub") {
                    bus.$emit("subscribeTopic", {
                        id: id,
                        enable: true
                    });
                }
                else {
                    respository.topic.update(id, {
                        enable: true
                    }).then(() => {
                        _this.loadTreeData();
                    });
                }
            }

            if (menuKey == "edit") {
                if(type == "pub")
                    bus.$emit("eidtPub", { device_id: this.device_id, id: id });
                else
                    bus.$emit("eidtSub", { device_id: this.device_id, id: id });
            }

            if (menuKey == "remove") {
                this.$confirm({
                    title: 'Delete publish',
                    content: 'Are you sure delete this publish?',
                    okText: 'Yes',
                    okType: 'danger',
                    cancelText: 'No',
                    onOk() {
                        respository.topic.remove(id).then(d => {
                            _this.loadTreeData();
                        });
                    },
                    onCancel() {
                        
                    }
                });               
            }
        }

        created() {
            this.loadTreeData().then(() => {
                this.loadPage(1);
            });
        }

        mounted() {
            var _this = this;

            bus.$on('log', (log: db.Log) => {
                if (_this.current === 1 && log.device_id === _this.device_id) {
                    if (_this.logs.length > _this.pageSize) {
                        _this.logs = _this.logs.slice(0, _this.pageSize - 1);                        
                    }
                    _this.logs.splice(0, 0, log);
                }
            });

            bus.$on('clearLog', (device_id: number) => {
                if (_this.device_id === device_id)
                    this.loadPage(1);
            });

            bus.$on('reload_topic', (device_id: number) => {
                _this.loadTreeData();
            });

            bus.$on("i18nChange", () => {
                _this.loadTreeData();
            });
        }

        tagClick(log: any) {
            if (this.currentLog == log)
                this.currentLog = null;
            else
                this.currentLog = log;
        }

        getTopicStyle(treeKey: string, topic: string, color: string) {
            let s = {
                color: "rgba(0, 0, 0, .65)"
            };

            if (treeKey && this.currentLog != null && treeKey == this.currentLog.key) {
                let t = (this.treeData[0].children as any[]).find((c: any) => {
                    return c.id == treeKey.toString();
                }) || (this.treeData[1].children as any[]).find((c: any) => {
                    return c.id == treeKey.toString();
                });

                if (color && color!== "") {
                    s = {
                        color: color
                    };
                }
                else {
                    s = {
                        color: "red"
                    };
                }
            }

            return {
                padding: 0,
                width: "170px",
                overflow: "hidden",
                textAlign: "left",
                ...s
            };
        }

        getTagStyle(log: db.Log) {
            let bColor = this.getTagBgColor(log);
            let s = {};

            if (this.currentLog && log.topic === this.currentLog.topic && log.key == this.currentLog.key) {
                s = {
                    boxShadow: '0 2px 8px rgb(0 0 0 / 50%)',
                    backgroundColor: bColor
                };
            } else {
                s = {
                    backgroundColor: bColor
                };

                if (this.currentLog !== null)
                    s = {
                        ...s,
                        opacity: 0.15
                    };
            }

            if (bColor && bColor != "#FAFAFA") {
                s = {
                    ...s,
                    color:"#FFF"
                };
            }

            if (bColor && bColor == "#FAFAFA") {
                s = {
                    ...s,
                    color: "rgba(0, 0, 0, .65)"
                };
            }

            return s;
        }

        getActionIcon(action: string): string {
            switch (action) {
                case "online":
                case "publish":
                case "suback":
                case "unsuback": {
                    return "double-left";
                    break;
                }
                default : {
                    return "double-right";
                    break;
                }
            }
        }

        getTagBgColor(item: any): string {
            let index = item.action === "publish" ? 0 : 1;

            let t = (this.treeData[index].children as any[]).find((c: any) => {
                if (index == 0)
                    return c.topic == item.topic && c.key == item.key;
                else
                    return c.topic == item.topic;
            });

            if (t && t.color) {
                return t.color;
            }

            return "#FAFAFA";
        }

        affix_change(affixed: boolean) {
            console.log(affixed);
        }
    }
</script>

<style>
    .debug_page .ant-select-arrow {
        right: 5px !important;
    }

    .topic_tree span.ant-tree-switcher{
        display:none!important;
    }

    .ant-table-tbody > tr > td, .ant-table-thead > tr > th {
        padding: 6px 16px!important;
    }

    .debug_btn .ant-btn-sm {
        margin-right: 10px!important;
    }
</style>