<template>
    <div class="m-colorPicker" ref="colorPicker" v-clickOut="closePanel" v-on:click="event => { event.stopPropagation() }">
        <!-- 颜色显示小方块 -->
        <div class="colorBtn"
             v-bind:style="`background-color: ${showColor}`"
             v-on:click="openPanel"
             v-bind:class="{ disabled: disabled }"></div>
        <!-- 颜色色盘 -->
        <div class="box" v-bind:class="{ open: openStatus }">
            <div class="hd">
                <div class="colorView" v-bind:style="`background-color: ${showPanelColor}`"></div>
                <div class="defaultColor"
                     v-on:click="handleDefaultColor"
                     v-on:mouseover="hoveColor = defaultColor"
                     v-on:mouseout="hoveColor = null">默认颜色</div>
            </div>
            <div class="bd">
                <h3>主题颜色</h3>
                <ul class="tColor">
                    <li v-for="(color, index) of tColor"
                        :key="index"
                        v-bind:style="{ backgroundColor: color }"
                        v-on:mouseover="hoveColor = color"
                        v-on:mouseout="hoveColor = null"
                        v-on:click="updataValue(color)"></li>
                </ul>
                <ul class="bColor">
                    <li v-for="(item, index) of colorPanel" :key="index">
                        <ul>
                            <li v-for="(color, cindex) of item"
                                :key="cindex"
                                v-bind:style="{ backgroundColor: color }"
                                v-on:mouseover="hoveColor = color"
                                v-on:mouseout="hoveColor = null"
                                v-on:click="updataValue(color)"></li>
                        </ul>
                    </li>
                </ul>
                <h3>标准颜色</h3>
                <ul class="tColor">
                    <li v-for="(color, index) of bColor"
                        :key="index"
                        v-bind:style="{ backgroundColor: color }"
                        v-on:mouseover="hoveColor = color"
                        v-on:mouseout="hoveColor = null"
                        v-on:click="updataValue(color)"></li>
                </ul>
                <h3 v-on:click="triggerHtml5Color">更多颜色...</h3>
                <!-- 用以激活HTML5颜色面板 -->
                <input type="color"
                       ref="html5Color"
                       v-model="value"
                       v-on:change="updataValue(value)">
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

    @Component
    export default class ColorPicker extends Vue {
        name: string = 'ColorPicker';
        // 面板打开状态
        openStatus: boolean = false;
        // 鼠标经过的颜色块
        hoveColor: string | null = null;
        // 主题颜色
        tColor: string[] = ['#000000', '#ffffff', '#eeece1', '#1e497b', '#4e81bb', '#e2534d', '#9aba60', '#8165a0', '#47acc5', '#f9974c'];
        // 颜色面板
        colorConfig: string[][] = [
            ['#7f7f7f', '#f2f2f2'],
            ['#0d0d0d', '#808080'],
            ['#1c1a10', '#ddd8c3'],
            ['#0e243d', '#c6d9f0'],
            ['#233f5e', '#dae5f0'],
            ['#632623', '#f2dbdb'],
            ['#4d602c', '#eaf1de'],
            ['#3f3150', '#e6e0ec'],
            ['#1e5867', '#d9eef3'],
            ['#99490f', '#fee9da']
        ];
        // 标准颜色
        bColor: any[] = ['#c21401', '#ff1e02', '#ffc12a', '#ffff3a', '#90cf5b', '#00af57', '#00afee', '#0071be', '#00215f', '#72349d'];
        //html5Color: any = this.value!;

        @Prop({ required: true }) value: string;
        @Prop({ default: "#000000" }) defaultColor!: string;
        @Prop({ default: false }) disabled!: boolean;

        openPanel() {
            this.openStatus = true;
        }

        closePanel() {
            this.openStatus = false;
        }

        triggerHtml5Color() {
            (this.$refs!.html5Color! as any).click()
        }

        // 更新组件的值 value
        updataValue(value: string) {
            this.$emit('input', value);
            this.$emit('change', value);
            this.openStatus = false;
        }

        // 设置默认颜色
        handleDefaultColor() {
            this.updataValue(this.defaultColor)
        }

        // 格式化 hex 颜色值
        parseColor(hexStr: string) {
            if (hexStr.length === 4) {
                return '#' + hexStr[1] + hexStr[1] + hexStr[2] + hexStr[2] + hexStr[3] + hexStr[3]
            } else {
                return hexStr
            }
        }

        // RGB 颜色 转 HEX 颜色
        rgbToHex(r: number, g: number, b: number) {
            let hex = ((r << 16) | (g << 8) | b).toString(16)
            return '#' + new Array(Math.abs(hex.length - 7)).join('0') + hex
        }

        // HEX 转 RGB 颜色
        hexToRgb(hex:string) {
            hex = this.parseColor(hex);
            let rgb = []
            for (let i = 1; i < 7; i += 2) {
                rgb.push(parseInt('0x' + hex.slice(i, i + 2)))
            }
            return rgb
        }

        // 计算渐变过渡颜色
        gradient(startColor: string, endColor: string, step: number) {
            // 讲 hex 转换为 rgb
            let sColor = this.hexToRgb(startColor)
            let eColor = this.hexToRgb(endColor)

            // 计算R\G\B每一步的差值
            let rStep = (eColor[0] - sColor[0]) / step
            let gStep = (eColor[1] - sColor[1]) / step
            let bStep = (eColor[2] - sColor[2]) / step

            let gradientColorArr = []
            // 计算每一步的hex值
            for (let i = 0; i < step; i++) {
                gradientColorArr.push(this.rgbToHex(rStep * i + sColor[0], gStep * i + sColor[1], bStep * i + sColor[2]));
            }
            return gradientColorArr
        }

        get showColor() {
            if (this.value) {
                return this.value
            } else {
                return this.defaultColor
            }
        }

        get showPanelColor() {
            if (this.hoveColor) {
                return this.hoveColor
            } else {
                return this.showColor
            }
        }

        get colorPanel() {
            let colorArr = []
            for (let color of this.colorConfig) {
                colorArr.push(this.gradient(color[1], color[0], 5))
            }
            return colorArr
        }

        created() {
            
        }

        mounted() {
                       
        }
    }
</script>

<style>
    .m-colorPicker {
        position: relative;
        text-align: left;
        font-size: 14px;
        display: inline-block;
        outline: none;
    }

    .m-colorPicker li, .m-colorPicker ol, .m-colorPicker ul {
        list-style: none;
        margin: 0;
        padding: 0;
    }

    .m-colorPicker input {
        display: none;
    }

        .m-colorPicker .colorBtn {
            width: 15px;
            height: 15px;
            margin-top: 4px;
        }

    .m-colorPicker .colorBtn.disabled {
        cursor: no-drop;
    }

    .m-colorPicker .box {
        position: absolute;
        width: 210px;
        background: #fff;
        border: 1px solid #ddd;
        visibility: hidden;
        border-radius: 2px;
        margin-top: 2px;
        padding: 10px;
        padding-bottom: 5px;
        -webkit-box-shadow: 0 0 5px rgba(0,0,0,.15);
        box-shadow: 0 0 5px rgba(0,0,0,.15);
        opacity: 0;
        -webkit-transition: all .3s ease;
        transition: all .3s ease;
    }

    .m-colorPicker .box h3 {
        margin: 0;
        font-size: 14px;
        font-weight: 400;
        margin-top: 10px;
        margin-bottom: 5px;
        line-height: 1;
        color: #333;
    }

    .m-colorPicker .box.open {
        visibility: visible;
        opacity: 1;
        z-index: 1;
        right:0;
    }

    .m-colorPicker .hd {
        overflow: hidden;
        line-height: 29px;
    }

    .m-colorPicker .hd .colorView {
        width: 100px;
        height: 30px;
        float: left;
        -webkit-transition: background-color .3s ease;
        transition: background-color .3s ease;
    }

    .m-colorPicker .hd .defaultColor {
        text-align: right;
        cursor: pointer;
        color: #333;
    }

    .m-colorPicker .tColor li {
        width: 15px;
        height: 15px;
        display: inline-block;
        margin: 0 2px;
        -webkit-transition: all .3s ease;
        transition: all .3s ease;
    }

        .m-colorPicker .tColor li:hover {
            -webkit-box-shadow: 0 0 5px rgba(0,0,0,.4);
            box-shadow: 0 0 5px rgba(0,0,0,.4);
            -webkit-transform: scale(1.3);
            transform: scale(1.3);
        }

    .m-colorPicker .bColor li {
        width: 15px;
        display: inline-block;
        margin: 0 2px;
    }

    .m-colorPicker .bColor li li {
        display: block;
        width: 15px;
        height: 15px;
        -webkit-transition: all .3s ease;
        transition: all .3s ease;
        margin: 0;
    }

        .m-colorPicker .bColor li li:hover {
            -webkit-box-shadow: 0 0 5px rgba(0,0,0,.4);
            box-shadow: 0 0 5px rgba(0,0,0,.4);
            -webkit-transform: scale(1.3);
            transform: scale(1.3);
        }
</style>