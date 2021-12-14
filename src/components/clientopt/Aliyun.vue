<template>
    <a-card class="aliyun_opt_card">
        <a-row>
            <a-input addon-before="ProductKey" v-model="extra.productKey" />
        </a-row>
        <a-row>
            <a-input addon-before="DeviceName" v-model="extra.deviceName" />
        </a-row>
        <a-row>
            <a-input addon-before="DeviceSecret" v-model="extra.deviceSecret" />
        </a-row>
        <a-row>
            <a-col span="8">Securemode</a-col>
            <a-col span="16">
                <a-select style="width: 120px" v-model="extra.securemode">
                    <a-select-option value="2">
                        TLS{{$t('lang.directMode')}}
                    </a-select-option>
                    <a-select-option value="3">
                        TCP{{$t('lang.directMode')}}
                    </a-select-option>
                </a-select>
            </a-col>
        </a-row>
        <a-row>
            <a-col span="8">Signmethod</a-col>
            <a-col span="16">
                <a-select style="width: 120px" v-model="extra.signmethod" >
                    <a-select-option value="hmacsha1">
                        hmacsha1
                    </a-select-option>
                    <a-select-option value="hmacmd5">
                        hmacmd5
                    </a-select-option>
                    <a-select-option value="hmacsha256">
                        hmacsha256
                    </a-select-option>
                </a-select>
            </a-col>
        </a-row>
        <a-row>
            <a-col span="8">Timestamp</a-col>
            <a-col span="16">
                <a-input-number v-model="extra.timestamp" />
            </a-col>
        </a-row>
        <a-row>
            <a-button type="primary" @click="submit">
                {{$t('lang.fill')}}
            </a-button>
        </a-row>
    </a-card>
</template>

<script lang="ts">
    import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
    import cryptoJS from 'crypto-js';

    @Component
    export default class ClientOpt_Aliyun extends Vue {
        @Prop() extra!: any;

        submit() {
            let cid = `${this.extra.productKey}.${this.extra.deviceName}`;
            let clientId = `${cid}|securemode=${this.extra.securemode},signmethod=${this.extra.signmethod},timestamp=${this.extra.timestamp}|`;
            let host = `${this.extra.productKey}.iot-as-mqtt.cn-shanghai.aliyuncs.com`;
            let username = `${this.extra.deviceName}&${this.extra.productKey}`;
            let password = "";
            let hex = `clientId${cid}deviceName${this.extra.deviceName}productKey${this.extra.productKey}timestamp${this.extra.timestamp}`;
            if (this.extra.signmethod == "hmacsha1")
                password = cryptoJS.HmacSHA1(hex, this.extra.deviceSecret).toString();
            if (this.extra.signmethod == "hmacmd5")
                password = cryptoJS.HmacMD5(hex, this.extra.deviceSecret).toString();
            if (this.extra.signmethod == "hmacsha256")
                password = cryptoJS.HmacSHA256(hex, this.extra.deviceSecret).toString();

            this.$emit("setOption", {
                clientId: clientId,
                host: host,
                username: username,
                password: password
            });
        }

        created() {
            //if (!this.extra.signmethod)
            //    this.extra.signmethod = "hmacmd5";
            //if (!this.extra.securemode)
            //    this.extra.securemode = 2;
            //if (!this.extra.timestamp)
                //this.extra.timestamp = 123456;
        }

        mounted() {

        }
    }
</script>

<style>
    .aliyun_opt_card .ant-card-body {
        padding: 4px;
    }

    .aliyun_opt_card .ant-row {
        margin: 4px !important;
    }
</style>