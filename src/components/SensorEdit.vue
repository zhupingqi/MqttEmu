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
        <a-form-model :model="form" :rules="rules" :label-col="{span:4}" :wrapper-col="{span:20}" id="form_sensor_edit" ref="ruleForm">
            <a-form-model-item :label="$t('lang.name')" ref="name" prop="name">
                <a-input v-model="form.name" />
            </a-form-model-item>
            <a-form-model-item label="Comment">
                <a-textarea v-model="form.comment" />
            </a-form-model-item>
            <a-textarea v-model="form.code" id="ace-editor-sensor-script" style="visibility:hidden;display:none" />
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
          zIndex: 3,
        }">
            <a-button :style="{ marginRight: '8px' }" @click="testScript">
                {{$t('lang.test')}}
            </a-button>
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
    import bus from '@/core/utils';
    import { respository } from "@/core/respository";

    import * as ace from 'brace';
    import 'brace/mode/javascript';
    import 'brace/theme/monokai';
    import { ExceptionSet } from 'dexie';

    @Component
    export default class SensorEdit extends Vue {
        visible: boolean = false;
        id?: number = undefined;
        editor: ace.Editor;
        title: string = "New Sensor";
        defaultOpts: any = {
            name: '',
            comment:"",
            code: `/**
* 将设备raw数据转换为json格式数据
* 入参：$ JQuery对象
* 出参：jsonObj JSON对象 不能为空
*/
function readSensor($,data) {
    var jsonObj = {};
    return jsonObj;
}`
        };

        form: any = {};

        rules: any = {
            name: [
                { required: true, message: 'Please input name', trigger: 'blur' },
                { min: 3, max: 30, message: 'Length should be 3 to 30', trigger: 'blur' },
            ],
            comment: [
                { required: true, message: 'Please input comment', trigger: 'blur' }
            ]
        };

        @Watch("visible")
        getVisible(newVal: boolean, oldVal: boolean) {
            if (newVal) {
                this.$nextTick(() => {
                    this.editor = ace.edit('ace-editor-sensor-script');
                    this.editor.getSession().setMode('ace/mode/javascript');
                    this.editor.setTheme('ace/theme/monokai');
                });
            }
        }

        submit() {
            (this.$refs.ruleForm as any).validate((valid:any) => {
                if (valid) {
                    this.form.code = this.editor.getValue();

                    if (this.id)
                        respository.sensor.update(this.id, this.form.name, this.form.comment, this.form.code);
                    else
                        respository.sensor.add(this.form.name, this.form.comment, this.form.code);

                    this.onClose();
                } else {
                    console.log('error submit!!');
                    return false;
                }
            });
        }

        testScript() {
            this.form.code = this.editor.getValue();
            let raw: [] = [];
            let msg: any = "";

            respository.options.get("script").then(v => {
                if (v) {
                    try {
                        let func = new Function("content", `let c = content; let f = ${this.form.code};return f(c);${v}`);
                        msg = JSON.stringify(func($, raw));
                    }
                    catch (e) {
                        msg = e;
                    }

                    const h = this.$createElement;
                    this.$info({
                        title: 'Sensor test result',
                        content: h('div', {}, [
                            h('p', msg.toString())
                        ]),
                        onOk() { },
                    });
                }
            });
        }

        onClose() {
            this.visible = false;
            bus.$emit("reload_sensors");
        }

        mounted() {
            bus.$on('eidtSensor', (id: any) => {
                this.visible = true;
                this.id = id;
                this.title = "New Sensor";
                this.form = $.extend({}, this.defaultOpts);

                if (id != null) {
                    respository.sensor.get(id).then(d => {
                        if (d) {
                            this.title = "Edit Sensor";
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
    .debug_page .ant-select-arrow {
        right: 5px !important;
    }

    #form_sensor_edit .ace_editor {
        height: 400px;
    }
</style>