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
        <a-form-model :model="form" :rules="rules" :label-col="{span:8}" :wrapper-col="{span:16}" id="form_device_edit" ref="ruleForm">
            <div style="padding-top: 8px"><b>{{$t('lang.general')}}</b></div>
            <a-card>
                <a-form-model-item :label="$t('lang.name')">
                    <a-input v-model="form.name" />
                </a-form-model-item>
                <a-form-model-item :label="$t('lang.mode')">
                    <a-radio-group v-model="deviceType">
                        <a-radio value="normal">
                            标准
                        </a-radio>
                        <a-radio value="pass-through">
                            透传
                        </a-radio>
                    </a-radio-group>
                </a-form-model-item>
                <a-form-model-item :label="$t('lang.generator')">
                    <a-select style="width: 120px" v-model="alg_name" option-label-prop="label" @change="onAlgChange" default-value="null">
                        <a-select-option v-for="a in algs" :label="a" :value="a">
                            {{ a }}
                        </a-select-option>
                        <a-select-option label="无" value="null">
                            无
                        </a-select-option>
                    </a-select>
                    <component :is="clientOptComponent" v-bind:extra="extra" v-on:setOption="setOption" v-if="alg_name !== null"></component>
                </a-form-model-item>
                <a-form-model-item :label="$t('lang.clientId')">
                    <a-input v-model="form.clientId" />
                </a-form-model-item>
                <a-form-model-item :label="$t('lang.protocol')">
                    <a-select default-value="mqtt" v-model="form.protocol" style="width: 100px">
                        <a-select-option value="mqtt">
                            mqtt://
                        </a-select-option>
                        <a-select-option value="mqtts">
                            mqtts://
                        </a-select-option>
                    </a-select>
                </a-form-model-item>
                <a-form-model-item :label="$t('lang.host')">
                    <a-input v-model="form.host" />
                </a-form-model-item>
                <a-form-model-item label="Port">
                    <a-input v-model="form.port" />
                </a-form-model-item>
                <a-form-model-item :label="$t('lang.username')">
                    <a-input v-model="form.username" />
                </a-form-model-item>
                <a-form-model-item :label="$t('lang.password')">
                    <a-input v-model="form.password" />
                </a-form-model-item>
                <a-form-model-item label="SSL/TLS">
                    <a-switch v-model="form.ssl" />
                </a-form-model-item>
                <template v-if="form.ssl">
                    <a-form-model-item :label="$t('lang.certType')">
                        <a-radio-group v-model="form.certType">
                            <a-radio value="server">
                                server
                            </a-radio>
                            <a-radio value="self">
                                self
                            </a-radio>
                        </a-radio-group>
                    </a-form-model-item>
                    <template v-if="form.certType === 'self'">
                        <a-form-model-item :label="$t('lang.caCertificate')">
                            <a-textarea placeholder="CA certificates in PEM format" v-model="form.ca" :rows="4" />
                        </a-form-model-item>
                        <a-form-model-item :label="$t('lang.certCertificate')">
                            <a-textarea placeholder="Cert chains in PEM format" v-model="form.cert" :rows="4" />
                        </a-form-model-item>
                        <a-form-model-item label="Keys">
                            <a-textarea placeholder="Keys in PEM format" v-model="form.key" :rows="4" />
                        </a-form-model-item>
                    </template>
                    <a-form-model-item :label="$t('lang.sslSecure')">
                        <a-switch v-model="form.tls_certificate_secure" />
                    </a-form-model-item>
                </template>
            </a-card>
            <div style="padding-top: 8px"><b>{{$t('lang.advance')}}</b></div>
            <a-card>
                <a-form-model-item :label="[$t('lang.connectTimeout')+'(ms)']">
                    <a-input-number :default-value="10000" v-model="form.connectTimeout" />
                </a-form-model-item>
                <a-form-model-item :label="[$t('lang.keepalive')+'(s)']">
                    <a-input-number :default-value="30" v-model="form.keepalive" />
                </a-form-model-item>
                <a-form-model-item :label="$t('lang.cleanSession')">
                    <a-switch v-model="form.clean" />
                </a-form-model-item>
                <a-form-model-item :label="$t('lang.reconnect')">
                    <a-input-number :default-value="5000" v-model="form.reconnectPeriod" />
                    <span>&nbsp;&nbsp;{{$t('lang.reconnect_tips')}}</span>
                </a-form-model-item>
                <a-form-model-item :label="['Mqtt ' + $t('lang.version')]">
                    <a-radio-group v-model="form.mqttVersion">
                        <a-radio value="5.0">5.0</a-radio>
                        <a-radio value="3.1.1">3.1.1</a-radio>
                    </a-radio-group>
                </a-form-model-item>
                <template v-if="form.mqttVersion === '5.0'">
                    <a-form-model-item :label="$t('lang.sessionExpiryInterval')">
                        <a-input-number v-model="form.properties.sessionExpiryInterval" />
                    </a-form-model-item>
                    <a-form-model-item :label="$t('lang.receiveMaximum')">
                        <a-input-number v-model="form.properties.receiveMaximum" />
                    </a-form-model-item>
                    <a-form-model-item :label="$t('lang.topicAliasMaximum')">
                        <a-input-number v-model="form.properties.topicAliasMaximum" />
                    </a-form-model-item>
                </template>
            </a-card>
            <div style="padding-top: 8px"><b>{{$t('lang.lastWill')}}</b></div>
            <a-card>
                <a-form-model-item :label="$t('lang.topic')">
                    <a-input v-model="form.will.topic" />
                </a-form-model-item>
                <a-form-model-item label="QoS">
                    <a-radio-group v-model="form.will.qos">
                        <a-radio :value="0">0</a-radio>
                        <a-radio :value="1">1</a-radio>
                        <a-radio :value="2">2</a-radio>
                    </a-radio-group>
                </a-form-model-item>
                <a-form-model-item :label="$t('lang.retain')">
                    <a-switch v-model="form.will.retain" />
                </a-form-model-item>
                <a-form-model-item :label="$t('lang.payload')">
                    <a-textarea v-model="form.will.payload" />
                </a-form-model-item>
            </a-card>
            <div><br /><br /><br /></div>
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
          zIndex: 1,
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
    import { db } from "@/core/db";
    import { Component, Prop, Vue } from 'vue-property-decorator';
    import bus from '@/core/utils';
    import { respository } from "@/core/respository";
    import { MqttClient, IClientOptions } from 'mqtt';
    import { MqttOptions } from '@/core/mqtt-options';
    import ClientOpt_Aliyun from "@/components/clientopt/Aliyun.vue";

    @Component({
        components: {
            ClientOpt_Aliyun
        }
    })
    export default class DeviceEdit extends Vue {
        visible: boolean = false;
        id?: number = undefined;
        title: string = "";
        algs: any = ["Aliyun"];
        alg_name: string | null = null;
        extra: any | null = null;
        clientOptComponent: string = "ClientOpt_Aliyun";
        deviceType: db.DeviceType = "normal";

        defaultOpts: MqttOptions = {
            name: '',
            clientId: "",
            certType:"server",
            clean: true,
            protocol: 'mqtts',
            host: '',
            keepalive: 60,
            connectTimeout: 10000,
            reconnectPeriod: 5000,
            clientIdWithTime: false,
            username: '',
            password: '',
            path: '/mqtt',
            port: 1883,
            ssl: false,
            rejectUnauthorized: true,
            ca: '',
            cert: '',
            key: '',
            protocolVersion: 4,
            mqttVersion:'5.0',
            will: {
                topic: '',
                payload: '',
                qos: 0,
                retain: false,
                properties: {
                    willDelayInterval: undefined,
                    payloadFormatIndicator: undefined,
                    messageExpiryInterval: undefined,
                    contentType: '',
                    responseTopic: '',
                    correlationData: undefined,
                    userProperties: undefined,
                },
            },
            properties: {
                sessionExpiryInterval: undefined,
                receiveMaximum: undefined,
                maximumPacketSize: undefined,
                topicAliasMaximum: undefined,
                requestResponseInformation: undefined,
                requestProblemInformation: undefined,
                userProperties: undefined,
                authenticationMethod: undefined,
                authenticationData: undefined,
            }
        };

        form: any = {};

        rules: any = {
            name: [
                { required: true, message: 'Please input Activity name', trigger: 'blur' },
                { min: 3, max: 30, message: 'Length should be 3 to 30', trigger: 'blur' },
            ],
            clientId: [{ required: true, message: 'Please input ClientId', trigger: 'blur' }],
            server: [{ required: true, message: 'Please input server host', trigger: 'blur' }],
            tls_type: [
                {
                    type: 'array',
                    required: true,
                    message: 'Please select at least one activity type',
                    trigger: 'change',
                },
            ],
            resource: [
                { required: true, message: 'Please select activity resource', trigger: 'change' },
            ],
            desc: [{ required: true, message: 'Please input activity form', trigger: 'blur' }]
        };

        onClose() {
            this.visible = false;
        }

        onAlgChange() {
            if (this.alg_name != null)
                this.clientOptComponent = "ClientOpt_" + this.alg_name;
        }

        setOption(opt: any) {
            for (let p in opt) {
                if (this.form[p] !== undefined) {
                    this.form[p] = opt[p];
                }
            }
        }

        submit() {
            (this.$refs.ruleForm as any).validate((valid: any) => {
                if (valid) {
                    if (this.id) {
                        respository.device.update(this.id, this.form.name, this.form, this.deviceType, this.alg_name, this.extra).then(() => {
                            bus.$emit("updateDevice", this.id);

                        });
                    }
                    else
                        respository.device.add(this.form.name, this.form, this.deviceType, this.alg_name, this.extra);

                    this.onClose();
                }
            });
        }

        created() {
            this.form = $.extend({}, this.defaultOpts);
        }

        mounted() {
            bus.$on('eidtDevice', (e: any) => {
                this.visible = true;
                this.id = undefined;
                this.form = $.extend({}, this.defaultOpts);
                this.alg_name = null;
                this.extra = {};
                this.deviceType = "normal";
                this.title = this.$t('lang.newDevice').toString();

                if (e != null) {
                    respository.device.get(e).then(d => {
                        if (d) {
                            this.id = e;
                            this.title = this.$t('lang.editDevice').toString();
                            this.form = $.extend({}, this.defaultOpts, d.options);
                            this.alg_name = d.alg_name ? d.alg_name : null;
                            this.extra = d.extra ? d.extra : {};
                            this.deviceType = d.type;
                        }
                    });
                }
            });
        }
    }
</script>

<style scoped>
    .ant-form-item {
        margin-bottom: 5px !important;
    }

    #form_device_edit {
    }
</style>