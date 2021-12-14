<template>
    <a-card class="tencent_opt_card">
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
            <a-col span="8">Signmethod</a-col>
            <a-col span="16">
                <a-select style="width: 120px" v-model="extra.signmethod" >
                    <a-select-option value="hmacsha1">
                        hmacsha1
                    </a-select-option>
                    <a-select-option value="hmacsha256">
                        hmacsha256
                    </a-select-option>
                </a-select>
            </a-col>
        </a-row>
        <a-row>
            <a-col span="8">Expiry(day)</a-col>
            <a-col span="16">
                <a-input-number v-model="extra.expiry" />
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
    import $ from 'jquery';
    import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
    import { respository } from "@/core/respository";
    import bus from '@/core/utils';
    import cryptoJS from 'crypto-js';

    @Component
    export default class ClientOpt_Tencent extends Vue {
        @Prop() extra!: any;

        randomString(len: number | undefined) {
            len = len || 32;
            var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            var maxPos = chars.length;
            var pwd = '';
            for (let i = 0; i < len; i++) {
                pwd += chars.charAt(Math.floor(Math.random() * maxPos));
            }
            return pwd;
        }

        submit() {
            let connid = this.randomString(5);
            let expiry = Math.round(new Date().getTime() / 1000) + 3600 * 24 * this.extra.expiry;
            let clientId = this.extra.productKey + this.extra.deviceName;
            let username = `${clientId};12010126;${connid};${expiry}`;
            let rawKey = cryptoJS.enc.Base64.parse(this.extra.deviceSecret);
            let token = cryptoJS.HmacSHA256(username, rawKey);
            if (this.extra.signmethod == "hmacsha1")
                token = cryptoJS.HmacSHA1(username, rawKey);
            let password = token.toString(cryptoJS.enc.Hex) + `;${this.extra.signmethod}`;
            let host = `${this.extra.productKey}.iotcloud.tencentdevices.com`;

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
            if (this.extra.expiry === undefined || this.extra.expiry == 0)
                this.extra.expiry = 356;
        }

        mounted() {

        }
    }
</script>

<style>
    .tencent_opt_card .ant-card-body {
        padding: 4px;
    }

    .tencent_opt_card .ant-row {
        margin: 4px !important;
    }
</style>