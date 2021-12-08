<template>
    <a-drawer :title="$t('lang.script')"
              placement="right"
              :closable="true"
              :maskClosable="false"
              :visible="visible"
              :keyboard="false"
              :destroyOnClose="true"
              :width="600"
              @close="onClose">
        <a-form-model :model="form" :rules="rules" :label-col="{span:4}" :wrapper-col="{span:20}" id="form_script_edit">
            <a-textarea id="ace-editor-script" style="visibility:hidden;display:none" />
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
                Test
            </a-button>
            <a-button :style="{ marginRight: '8px' }" @click="onClose">
                Cancel
            </a-button>
            <a-button type="primary" @click="submit">
                Submit
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
    export default class ScriptEdit extends Vue {
        visible: boolean = false;
        editor: ace.Editor;
        title: string = "Edit Script";

        @Watch("visible")
        getVisible(newVal: boolean, oldVal: boolean) {
            if (newVal) {
                this.$nextTick(() => {
                    this.editor = ace.edit('ace-editor-script');
                    this.editor.getSession().setMode('ace/mode/javascript');
                    this.editor.setTheme('ace/theme/monokai');
                });
            }
        }

        submit() {
            let code = this.editor.getValue();
            respository.options.addOrUpdate("script", code);
            this.onClose();
        }

        testScript() {
            let code = this.editor.getValue();
            let raw: [] = [];
            let msg: any = "";

            try {
                let func = new Function("content", "let c = content; let f = " + code + ";return f(c);");
                msg = JSON.stringify(func($,raw));
            }
            catch (e) {
                msg = e;
            }

            const h = this.$createElement;
            this.$info({
                title: 'Script test result',
                content: h('div', {}, [
                    h('p', msg.toString())
                ]),
                onOk() { },
            });
        }

        onClose() {
            this.visible = false;
        }

        mounted() {
            bus.$on('eidtScript', () => {
                this.visible = true;
                this.title = "Edit Script";

                respository.options.get("script").then(d => {
                    if (d) {
                        this.editor.setValue(d);
                        this.editor.selection.clearSelection();
                    }
                });
            });
        }
    }
</script>

<style>
    .debug_page .ant-select-arrow {
        right: 5px !important;
    }

    #form_script_edit .ace_editor{
        height:600px;
    }
</style>