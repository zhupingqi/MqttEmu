import $ from 'jquery';
import { db } from "@/core/db";
import { respository } from "@/core/respository";
import mqtt, { IClientOptions, IClientSubscribeOptions, MqttClient, OnCloseCallback, OnConnectCallback, OnErrorCallback, OnPacketCallback, Packet, QoS } from 'mqtt';
import { MqttOptions } from "@/core/mqtt-options";
import { message } from 'ant-design-vue';
import _ from 'lodash';
import bus from '@/core/utils';
import Vue from 'vue';
import Vuex, { StoreOptions } from 'vuex';
Vue.use(Vuex);

const mqttVersionDict = {
    '3.1.1': 4,
    '5.0': 5
};

export class PoweredOnDevice {
    device_id: number;
    date: Date = new Date();
    connected: boolean = false;
    connecting: boolean = false;
    device: db.Device | undefined = undefined;
    client: MqttClient | null = null;
    intervalId: NodeJS.Timer | null = null;
    counter: number = 0;
    context: any = {};

    constructor() { }

    load(device_id: number) {
        let _this = this;
        this.device_id = device_id;

        return respository.device.get(device_id).then(d => {
            _this.device = d;
            return d;
        });
    }

    getMQTTProtocol(): string {
        let opts = this.device!.options;

        if (!opts.protocol) {
            return opts.ssl ? 'mqtts' : 'mqtt';
        }
        return opts.protocol;
    }

    getUrl(): string {
        let protocol = this.getMQTTProtocol();
        let opts = this.device!.options;

        let url = `${opts.protocol}://${opts.host}:${opts.port}`
        if (protocol === 'ws' || protocol === 'wss') {
            url = `${url}${opts.path!.startsWith('/') ? '' : '/'}${opts.path}`
        }
        return url
    }

    setMQTT5Properties(option: IClientOptions['properties']): IClientOptions['properties'] | undefined {
        if (option === undefined) {
            return undefined;
        }
        const properties: IClientOptions['properties'] = _.cloneDeep(option);
        return Object.fromEntries(Object.entries(properties!).filter(([_, v]) => v !== null && v !== undefined && v !== ''));
    }

    setWillMQTT5Properties(option: any): any | undefined {
        if (option === undefined) {
            return undefined
        }
        const properties: any = _.cloneDeep(option)
        return Object.fromEntries(Object.entries(properties).filter(([_, v]) => v !== null && v !== undefined))
    }

    getClientOptions(opts: MqttOptions): IClientOptions {
        let protocolVersion = mqttVersionDict[opts.mqttVersion as '3.1.1' | '5.0']

        let options: IClientOptions = {
            clientId: opts.clientId,
            keepalive: opts.keepalive,
            clean: opts.clean,
            reconnectPeriod: opts.reconnectPeriod,
            protocolVersion,
            connectTimeout: opts.connectTimeout
        }
        // Append timestamp to MQTT client id
        options.clientId = opts.clientId;
        if (opts.clientIdWithTime) {
            let clickIconTime = Date.parse(new Date().toString());
            options.clientId = `${options.clientId}_${clickIconTime}`;
        }

        // Auth
        if (opts.username !== '') {
            options.username = opts.username;
        }
        if (opts.password !== '') {
            options.password = opts.password
        }
        // MQTT Version
        if (protocolVersion === 5 && opts.properties) {
            let properties = this.setMQTT5Properties(opts.properties);
            if (properties && Object.keys(properties).length > 0) {
                options.properties = properties;
            }
        }
        // SSL
        if (opts.ssl) {
            options.rejectUnauthorized = opts.rejectUnauthorized === undefined ? true : opts.rejectUnauthorized;
            if (opts.certType === 'self') {
                options.ca = opts.ca;
                options.cert = opts.cert;
                options.key = opts.key;
            }
        }
        // Will Message
        if (opts.will) {
            if (opts.will.topic) {
                options.will = {
                    topic: opts.will.topic,
                    payload: opts.will.payload,
                    qos: opts.will.qos as QoS,
                    retain: opts.will.retain
                };
                if (protocolVersion === 5) {
                    if (opts.will.properties) {
                        let willProperties = this.setWillMQTT5Properties(opts.will.properties);
                        if (willProperties && Object.keys(willProperties).length > 0) {
                            options.will.properties = willProperties;
                        }
                    }
                }
            }
        }
        // Auto Resubscribe
        if (opts.resubscribe) {
            options.resubscribe = opts.resubscribe;
        }

        return options
    }

    runCommonScript(code: string, funs: string = "") {
        let msg: any = {};

        try {
            let func = new Function("content", `let c = content; let f = ${code};return f(c);${funs}`);
            return func($);
        }
        catch (e) {
            msg = e;
        }
    }

    readData(v: any, raw: any[]) {
        if ($.isNumeric(v))
            raw.push(v);
        else if (typeof (v) === "object") {
            for (let p in v) {
                this.readData(v[p], raw);
            }
        }
    }

    isJSON(d: any) {
        if (typeof (d) == "object" &&
            Object.prototype.toString.call(d).toLowerCase() == "[object object]" && !d.length) {
            return true;
        }
        return false;
    }

    async publish(t: db.Topic, subPayload: any = null) {
        let funs = "";

        await respository.options.get("script").then(v => {
            if(v)
                funs = v;
        });

        try {
            let map = t.map as string[];
            let s: any = {};
            let ids: number[] = [0];

            map.forEach(m => {
                let sp = m.split('-', 2);
                let id = Number(sp[0]);
                let prop = sp[1];

                if (!s[id]) {
                    s[id] = {};
                    ids.push(id);
                }
                s[id][prop] = {};
            });

            respository.sensor.getWithId(ids).then(ds => {
                ds.forEach(ss => {
                    let r = this.runCommonScript(ss.code);
                    for (let p in r) {
                        s[ss.id!][p] = r[p];
                    }
                });

                let raw: any[] = [];
                map.forEach(m => {
                    let v: any = {};
                    let sp = m.split('-', 2);
                    let id = Number(sp[0]);
                    let prop = sp[1];
                    let val = s[id][prop];

                    this.readData(val, raw);
                });

                var params = {
                    sensor:raw,
                    context: this.context,
                    subPayload: subPayload,
                    $:$
                };

                let func = new Function("content", `let c = content; let f = ${t.code};return f(c);${funs}`);
                let result = func(params);
                if (this.device!.type === "normal") {
                    if (this.isJSON(result))
                        result = JSON.stringify(result);
                    if (typeof (result) === "string")
                        this.client!.publish($.trim(t.topic), result);
                    else
                        this.log("publish","", "error:Unexpected type of publish message");
                }
                else {
                    if (result.toJSON && result.toJSON().type === "Buffer")
                        this.client!.publish($.trim(t.topic), result);
                    else
                        this.log("publish","", "error:Unexpected type of publish message");
                }
            });
        } catch (e) {
            console.log(e);
        }
    }

    autoPub() {
        let _this = this;
        this.intervalId = setInterval(() => {
            respository.topic.getList(this.device_id).then(ts => {
                ts.forEach((t) => {
                    if (t.enable && t.interval > 0 && _this.counter % t.interval == 0)
                        _this.publish(t);
                });
                _this.counter++;
            });
        }, 1000);
    }

    subscribe(t: db.Topic) {
        let opts: IClientSubscribeOptions = {
            qos: t.qos as QoS
        };

        if (t.enable) {
            this.client!.subscribe(t.topic, opts);
        } else {
            this.client!.unsubscribe(t.topic, opts);
        }

        bus.$emit("reload_topic");
    }

    toHex(data: number[]) {
        return "0x" + data.map((d: number) => { let n = d.toString(16).toUpperCase(); return n.length > 1 ? n : "0" + n; }).join("");
    }

    onSubMessage(topic: string, payload: any, packet: Packet) {
        let _this = this;
        respository.topic.find(this.device_id, topic).then(t => {
            if (t && t.enable && payload) {
                if (this.device!.type === "pass-through") {
                    let hex = this.toHex(payload.toJSON().data);
                    this.log("subscribe", topic, hex);
                }
                else
                    this.log("subscribe",topic, payload.toString());

                if (t.pubId) {
                    respository.topic.get(t.pubId).then(t => {
                        if (t) {
                            if (this.device!.type === "normal") {
                                if (payload.toJSON && payload.toJSON().type === "Buffer")
                                    _this.publish(t, JSON.parse(payload.toString()));
                                else
                                    _this.publish(t, payload.toString());
                            }
                            else
                                _this.publish(t, this.toHex(payload));
                        }
                    });
                }
            } else {
                this.log("unsubscribed", topic, payload.toString());
            }
        });
    }

    connect() {
        this.connecting = true;
        var _this = this;
        let url = this.getUrl();
        let options: IClientOptions = this.getClientOptions(this.device!.options);
        this.client = mqtt.connect(url, options);

        if (this.client.on) {
            this.client.on("connect", (cb: OnConnectCallback) => {
                this.connecting = false;
                _this.connected = _this.client!.connected;
                _this.log("online","", JSON.stringify(cb));

                this.autoPub();
            });

            this.client.on('offline', (cb: OnErrorCallback) => {
                _this.connected = _this.client!.connected;
                this.client!.end();
            });

            this.client.on('reconnect', () => {
                console.log("reconnect");
            });

            this.client.on('message', function (topic, message, packet) {
                _this.onSubMessage(topic, message, packet);
            });

            this.client.on('error', (cb: OnErrorCallback) => {
                console.log(cb.toString());
                let e = cb as any;

                this.client!.end();
                this.connecting = false;
                _this.connected = _this.client!.connected;
                message.error(e.message);
            });

            this.client.on('close', (cb: OnCloseCallback) => {
                _this.connected = _this.client!.connected;
                console.log("mqtt close");

                if (_this.intervalId)
                    clearInterval(Number(_this.intervalId));
            });

            this.client.on("packetsend", (cb: any) => {
                let cmd = cb.cmd;
                if (cmd && cmd === "publish") {
                    if (this.device!.type === "pass-through") {
                        let hex = this.toHex(cb.payload.toJSON().data);
                        _this.log("publish", cb.topic, hex);
                    }
                    else {
                        _this.log("publish", cb.topic, cb.payload);
                    }
                }                    
            });

            this.client.on("packetreceive", (cb: any) => {
                if (cb.cmd === "suback" || cb.cmd === "unsuback") {
                    _this.log(cb.cmd, "", cb);
                }

                console.log("receive " + JSON.stringify(cb));
            });
        }
    }

    cancel() {
        this.client!.end();
        this.connecting = false;
        this.connected = false;
    }

    disconnect() {
        if (this.client) {
            if (this.intervalId)
                clearInterval(Number(this.intervalId));

            this.client.end();
            this.connected = false;
            this.counter = 0;

            this.log("offline","", "disconnect");
        }
    }

    log(action: db.DeviceAction, topic: string, content: string) {
        respository.log.add(this.device_id, action,topic, content).then(d => {
            bus.$emit("log", d);
        });
    }

    clear() {
        return respository.log.clear(this.device_id);
    }
}

export interface DeskPoweredOnDeviceState {
    devices: PoweredOnDevice[],
    current: PoweredOnDevice | undefined
}

export default {
    namespaced: true,
    state: {
        devices: [],
        current: undefined
    },
    mutations: {
        update(s: DeskPoweredOnDeviceState, d: db.Device) {
            let f = s.devices.find(m => {
                return m.device_id == d.id;
            });

            if (f) {
                f.device = d;
            }
        },
        push(s: DeskPoweredOnDeviceState, d: PoweredOnDevice) {
            let device = s.devices.find(m => {
                return m.device_id == d.device_id;
            });

            if (!device) {
                s.devices.push(d);
            }
        },
        remove(s: DeskPoweredOnDeviceState, d: PoweredOnDevice) {
            if (s.current && s.current!.device_id == d.device_id) {
                s.current = undefined;
            }

            let index = s.devices.indexOf(d);
            if (index != -1)
                s.devices.splice(index, 1);
            return index;
        },
        setCurrentIndex(s: DeskPoweredOnDeviceState, index: number) {
            if (index >= s.devices.length)
                index = s.devices.length - 1;

            if (index != -1)
                s.current = s.devices[index];
            else
                s.current = undefined;
        },
        switchOn(s: DeskPoweredOnDeviceState, d: PoweredOnDevice): boolean {
            let index = s.devices.indexOf(d);
            if (index == -1)
                return false;

            if (!d.connected) {
                d.connect();
            }

            return d.connected;
        },
        cancelOn(s: DeskPoweredOnDeviceState, d: PoweredOnDevice) {
            let index = s.devices.indexOf(d);
            if (index == -1)
                return false;

            if (!d.connected) {
                d.cancel();
            }
        },
        switchOff(s: DeskPoweredOnDeviceState, d: PoweredOnDevice): boolean {
            let index = s.devices.indexOf(d);
            if (index == -1)
                return false;

            if (d.connected) {
                d.disconnect();
            }

            return d.connected;
        },
        select(s: DeskPoweredOnDeviceState, id: number | null) {
            if (id) {
                let d = s.devices.filter(m => {
                    return m.device_id == id;
                })[0];

                if (d)
                    s.current = d;
            } else {
                if (s.devices.length > 0)
                    s.current = s.devices[0];
                else
                    s.current = undefined;
            }
        }
    },
    actions: {
        init(context: any) {
            return respository.desk.getList().then(ds => {
                let ps: Promise<any>[] = [];

                ds.forEach(d => {
                    let device = new PoweredOnDevice();
                    let p = device.load(d.device_id).then(() => {
                        context.commit('push', device);
                    });
                    ps.push(p);
                });

                return Promise.all(ps).then(() => {
                    context.commit('select');
                });
            });
        },
        removeDevice(context: any, device_id: number) {
            
        },
        updateDevice(context: any, id: number) {
            return respository.device.get(id).then(d => {
                context.commit('update', d);
            });
        },
        add(context: any, id: number) {
            respository.desk.add(id).then(() => {
                let device = new PoweredOnDevice();
                device.load(id).then(() => {
                    context.commit('push', device);
                    context.commit('select', id);
                    bus.$emit("selectDevice",id);
                });
            });
        },
        remove(context: any, id: number) {
            respository.desk.remove(id).then(() => {
                let devices = context.state.devices as PoweredOnDevice[];

                let device = devices.find((m: any) => {
                    return m.device_id == id;
                });
                if (device) {
                    let index = devices.indexOf(device);
                    if (index >= devices.length - 1)
                        index--;

                    context.commit("remove", device);
                    let id = devices[index].device_id;
                    context.commit("select", id);
                    bus.$emit("selectDevice", id);
                }
            });
        }
    },
    getters: {
        getDevice(s: DeskPoweredOnDeviceState, id: number): PoweredOnDevice | undefined {
            return s.devices.find(m => {
                return m.device_id == id;
            });
        },
        getCurrentIndex(s: DeskPoweredOnDeviceState): number {
            if (s.current === undefined)
                return -1;
            else
                return s.devices.indexOf(s.current);
        }
    }
};