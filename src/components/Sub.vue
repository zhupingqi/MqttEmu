﻿<template>
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
        <a-form-model :model="form" :rules="rules" :label-col="{span:4}" :wrapper-col="{span:20}" id="form_sub_edit" ref="ruleForm">
            <a-form-model-item :label="$t('lang.name')">
                <a-input v-model="form.name" />
            </a-form-model-item>
            <a-form-model-item :label="$t('lang.topic')">
                <a-input v-model="form.topic">
                    <template slot="addonAfter">
                        <ColorPicker v-model="form.color"></ColorPicker>
                    </template>
                </a-input>
            </a-form-model-item>
            <a-form-model-item label="QoS">
                <a-radio-group v-model="form.qos">
                    <a-radio :value="0">0</a-radio>
                    <a-radio :value="1">1</a-radio>
                    <a-radio :value="2">2</a-radio>
                </a-radio-group>
            </a-form-model-item>
            <a-form-model-item :label="$t('lang.publish')">
                <a-select style="width: 120px" @change="pubChange" v-model="form.pubId" option-label-prop="label">
                    <a-select-option v-for="d in pubs" :label="d.label" :value="d.value">
                        {{ d.label }}
                    </a-select-option>
                </a-select>
                <a-button type="link" @click="()=>{ form.pubId = null }">
                    {{$t('lang.remove')}}
                </a-button>
            </a-form-model-item>
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
    import ColorPicker from '@/components/ColorPicker.vue';

    @Component({
        components: {
            ColorPicker
        }
    })
    export default class SubEdit extends Vue {
        visible: boolean = false;
        id?: number = undefined;
        device_id: number = 0;
        title: string = "";
        form: any = {};
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
        pubs: any[] = [];

        @Watch("visible")
        getVisible(newVal: boolean, oldVal: boolean) {
            if (newVal) {
                let _this = this;
                _this.pubs = [];

                respository.topic.getList(this.device_id).then(ds => {
                    ds.forEach(d => {
                        if (d.type == "pub") {
                            _this.pubs.push({
                                key:d.id,
                                value: d.id,
                                label: d.name
                            });
                        }
                    });
                });
            }
        }

        defaultOpts: {} = {
            name: '',
            topic: "",
            color: "#0000FF",
            qos: 0,
            enable: true,
            sub:0
        };

        submit() {
            (this.$refs.ruleForm as any).validate((valid: any) => {
                if (valid) {
                    if (this.id)
                        respository.topic.update(this.id, this.form);
                    else
                        respository.topic.add(this.device_id, "sub", this.form);

                    bus.$emit("reload_topic");
                    this.onClose();
                }
            });
        }

        onClose() {
            this.visible = false;
        }

        created() {
            
        }

        mounted() {
            bus.$on('eidtSub', (e: any) => {
                this.visible = true;
                this.id = e.id;
                this.device_id = e.device_id;
                this.title = this.$t('lang.newSubscription').toString();
                this.form = $.extend({}, this.defaultOpts);

                if (e.id != null) {
                    respository.topic.get(e.id).then(d => {
                        if (d) {
                            this.title = this.$t('lang.editSubscription').toString();
                            this.form = $.extend({}, this.defaultOpts, d);
                        }
                    });
                }
            });            
        }
    }
</script>

<style>
    #form_sub_edit{
        padding-bottom:55px;
    }

        #form_sub_edit .ace_editor {
            height: 400px;
        }

    .ant-transfer-list-body-customize-wrapper{
        padding:0!important;
    }

</style>