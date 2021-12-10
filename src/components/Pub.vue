<template>
    <a-drawer :title="title"
              placement="right"
              :closable="true"
              :maskClosable="false"
              :visible="visible"
              :keyboard="false"
              :destroyOnClose="true"
              :width="600"
              :bodyStyle="{ padding: '0 24px' }"
              @close="onClose">
        <a-form-model :model="form" :rules="rules" :label-col="{span:4}" :wrapper-col="{span:20}" id="form_pub_edit" ref="ruleForm">
            <a-form-model-item :label="$t('lang.name')">
                <a-input v-model="form.name" />
            </a-form-model-item>
            <a-form-model-item :label="$t('lang.topic')">
                <a-input v-model="form.topic" />
            </a-form-model-item>
            <a-form-model-item label="QoS">
                <a-radio-group v-model="form.qos">
                    <a-radio :value="0">0</a-radio>
                    <a-radio :value="1">1</a-radio>
                    <a-radio :value="2">2</a-radio>
                </a-radio-group>
            </a-form-model-item>
            <a-form-model-item :label="$t('lang.enable')">
                <a-switch v-model="form.enable" />
            </a-form-model-item>
            <a-form-model-item :label="$t('lang.interval')">
                <a-input-number :default-value="60" v-model="form.interval" />
            </a-form-model-item>
            <a-form-model-item :label="$t('lang.sensor')">
                <a-transfer :data-source="sensors"
                            :titles="[$t('lang.sensor'), $t('lang.variable')]"
                            :target-keys="targetKeys"
                            :render="item => item.title"
                            :show-select-all="false"
                            @change="onChange"
                            @selectChange="onSelectChange">
                    <template slot="children" slot-scope="{props: { direction, filteredItems, selectedKeys, disabled: listDisabled },on: { itemSelectAll, itemSelect }}">
                        <a-tree v-if="direction === 'left'"
                                defaultExpandAll
                                default-expand-all
                                checkStrictly
                                blockNode
                                checkable
                                :checkedKeys="[...selectedKeys, ...targetKeys]"
                                :treeData="treeData"
                                @check="(_, props)=>{onItemSelect(_, props, [...selectedKeys, ...targetKeys], itemSelect);}"
                                @select="(_, props) => {onItemSelect(_, props, [...selectedKeys, ...targetKeys], itemSelect);}" />
                        <!--<a-tree v-if="direction === 'right'"
                                defaultExpandAll
                                default-expand-all
                                checkStrictly
                                blockNode
                                checkable
                                :treeData="filteredItems"
                                @check="(_, props)=>{onItemSelect(_, props, [...selectedKeys, ...targetKeys], itemSelect);}"
                                @select="(_, props) => {onItemSelect(_, props, [...selectedKeys, ...targetKeys], itemSelect);}" />-->
                    </template>
                    <template slot="footer" slot-scope="props">
                        <a-space style="float:right;padding:2px" v-if="props.direction === 'right'">
                            <a-tooltip :title="$t('lang.moveUp')" mouseEnterDelay="1">
                                <a-button size="small" @click="moveUp" :disabled="moveUpDisabled" icon="arrow-up" />
                            </a-tooltip>
                            <a-tooltip :title="$t('lang.moveDown')" mouseEnterDelay="1">
                                <a-button size="small" @click="moveDown" :disabled="moveDownDisabled" icon="arrow-down" />
                            </a-tooltip>
                        </a-space>
                    </template>
                </a-transfer>
            </a-form-model-item>
            <template>
                <a-textarea v-model="form.code" id="ace-editor-pub-script" style="visibility:hidden;display:none" />
            </template>
        </a-form-model>
        <div :style="{
          position: 'absolute',
          right: 0,
          bottom: 0,
          width: '100%',
          borderTop: '1px solid #e9e9e9',
          padding: '10px 16px',
          background: '#fff',
          textAlign: 'right',
          zIndex: 999,
        }">
            <a-button :style="{ marginRight: '8px' }" @click="onClose">
                {{$t('lang.cancel')}}
            </a-button>
            <a-button type="primary" @click="submit">
                {{$t('lang.submit')}}
            </a-button>
        </div>
    </a-drawer>
</template>

<script lang="ts">
    import $ from 'jquery';
    import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
    import { respository } from "@/core/respository";
    import bus from '@/core/utils';

    import * as ace from 'brace';
    import 'brace/mode/javascript';
    import 'brace/theme/monokai';

    @Component
    export default class PubEdit extends Vue {
        visible: boolean = false;
        id?: number = undefined;
        device_id: number = 0;
        title: string = "New Pub";
        form: any = {};
        editor: ace.Editor;
        sensors: any[] = [];
        treeData: any[] = [];
        targetKeys: any[] = [];
        targetSelectedKeys: any[] = [];
        moveUpDisabled: boolean = true;
        moveDownDisabled: boolean = true;

        rules: any = {
            name: [
                { required: true, message: 'Please input Pub name', trigger: 'blur' },
                { min: 3, max: 30, message: 'Length should be 3 to 30', trigger: 'blur' },
            ],
            topic: [
                { required: true, message: 'Please input Topic name', trigger: 'blur' },
                { min: 3, max: 250, message: 'Length should be 3 to 250', trigger: 'blur' },
            ]
        };

        @Watch("visible")
        getVisible(newVal: boolean, oldVal: boolean) {
            if (newVal) {
                let _this = this;

                _this.$nextTick(() => {
                    _this.editor = ace.edit('ace-editor-pub-script');
                    _this.editor.getSession().setMode('ace/mode/javascript');
                    _this.editor.setTheme('ace/theme/monokai');
                });

                respository.sensor.getAll().then(ds => {
                    _this.sensors = [];
                    _this.treeData = [];

                    ds.forEach(d => {
                        _this.sensors.push({
                            key: d.id,
                            title: d.name
                        });

                        let cs = _this.getSensorProp(d.code, d.id!);
                        cs.forEach(c => {
                            _this.sensors.push({
                                key: c.key,
                                title: c.title
                            });
                        });

                        _this.treeData.push({
                            key: d.id,
                            title: d.name,
                            checkable: false,
                            selectable: false,
                            children: _this.getSensorProp(d.code,d.id!)
                        });
                    });

                    _this.onChange(_this.form.map);
                });
            }
        }

        @Watch("targetSelectedKeys")
        watch_targetSelectedKeys(newVal: any[], oldVal: any[]) {
            this.targetSelectedKeysChange(newVal);
        }

        targetSelectedKeysChange(newVal: any[]) {
            if (newVal.length > 1 || newVal.length == 0) {
                this.moveUpDisabled = this.moveDownDisabled = true;
            }
            else {
                let v = newVal[0];
                if (this.targetKeys.indexOf(v) > 0)
                    this.moveUpDisabled = false;
                if (this.targetKeys.indexOf(v) < this.targetKeys.length - 1)
                    this.moveDownDisabled = false;
            }
        }

        getSensorProp(code: string, id: number) {
            let rs: any[] = [];

            try {
                let func = new Function("content", "let c = content; let f = " + code + ";return f(c);");
                let result = func($, {});

                for (let p in result) {
                    rs.push({
                        key: `${id}-${p}`,
                        title: p,
                        prop : p
                    });
                }
            }
            catch (e: any) {
                rs.push({
                    key: ``,
                    title: e.toString()
                });
            }

            return rs;
        }

        defaultOpts: {} = {
            name: '',
            topic: "",
            qos: 0,
            enable: true,
            interval: 60,
            protocol: 'script',
            code: `/**
* 将设备raw数据转换为json格式数据
* 入参：rawData 传感器数据对象
* 出参：jsonObj JSON对象 不能为空
*/
function transformPayload(rawData) {
    var jsonObj = {};
    return jsonObj;
}`,
            map:[]
        };

        submit() {
            (this.$refs.ruleForm as any).validate((valid: any) => {
                if (valid) {
                    this.form.code = this.editor.getValue();
                    this.form.map = this.targetKeys;

                    if (this.id)
                        respository.topic.update(this.id, this.form);
                    else
                        respository.topic.add(this.device_id, "pub", this.form);

                    this.onClose();
                }
            });
        }

        onChange(targetKeys: any[]) {
            this.targetKeys = targetKeys;

            this.treeData.forEach(ts => {
                ts.children.forEach((n:any) => {
                    if (this.targetKeys.indexOf(n.key) != -1)
                        n.disabled = true;
                    else
                        n.disabled = false;
                });
            });
        }

        onSelectChange(sourceSelectedKeys: any[], targetSelectedKeys: any[]) {
            this.targetSelectedKeys = targetSelectedKeys;
        }

        onClose() {
            bus.$emit("reload_topic");
            this.visible = false;
        }

        onItemSelect(_: any, e: any, selectedKeys: any, itemSelect: any) {
            console.log(e);

            let checked = selectedKeys.indexOf(e.node.eventKey) >= 0;
            itemSelect(e.node.eventKey, !checked);
        }

        moveUp() {
            let v = this.targetSelectedKeys[0];
            let index = this.targetKeys.indexOf(v);

            let a = this.targetKeys.splice(index, 1)[0];
            this.targetKeys.splice(index - 1, 0, a);

            this.targetSelectedKeysChange(this.targetSelectedKeys);
        }

        moveDown() {
            let v = this.targetSelectedKeys[0];
            let index = this.targetKeys.indexOf(v);

            let a = this.targetKeys.splice(index, 1)[0];
            this.targetKeys.splice(index + 1, 0, a);

            this.targetSelectedKeysChange(this.targetSelectedKeys);
        }

        created() {
            
        }

        mounted() {
            bus.$on('eidtPub', (e: any) => {
                this.visible = true;
                this.id = e.id;
                this.device_id = e.device_id;
                this.title = this.$t('lang.newPublish').toString();
                this.form = $.extend({}, this.defaultOpts);
                this.targetSelectedKeys = [];

                if (e.id != null) {
                    respository.topic.get(e.id).then(d => {
                        if (d) {
                            this.title = this.$t('lang.editPublish').toString();
                            this.form = $.extend({}, this.defaultOpts, d);

                            this.editor.setValue(this.form.code);
                            this.editor.selection.clearSelection();
                        }
                    });
                }
            });            
        }
    }

</script>

<style>
    #form_pub_edit{
        padding-bottom:55px;
    }

        #form_pub_edit .ace_editor {
            height: 400px;
        }

    .ant-transfer-list-body-customize-wrapper{
        padding:0!important;
    }

</style>