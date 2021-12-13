import Dexie from "dexie";
import { MqttOptions } from '@/core/mqtt-options';
import { Option } from "ant-design-vue/types/mentions/option";

export namespace db {
    export class MqttEmu extends Dexie {
        device: Dexie.Table<Device, number>;
        desk: Dexie.Table<DeskDevice, number>;
        topic: Dexie.Table<Topic, number>;
        sensor: Dexie.Table<Sensor, number>;
        log: Dexie.Table<Log, number>;
        options: Dexie.Table<Options, number>;

        constructor() {
            super("MqttEmu");

            this.version(24).stores({
                device: '++id,name,type,options,create,update,alg_name,extra',
                desk: '++id,&device_id,create',
                topic: '++id,*device_id,create,update,type,enable,name,topic,qos,interval,map,code,pubId',
                sensor: '++id,create,update,&name,comment,code',
                log: '++id,*device_id,create,action,topic,content',
                options:'++id,&key,value'
            });

            this.device = this.table("device");
            this.desk = this.table("desk");
            this.topic = this.table("topic");
            this.sensor = this.table("sensor");
            this.log = this.table("log");
        }
    }

    export type DeviceType = "normal" | "pass-through";

    export class Device {
        id?: number = undefined;
        name: string = "";
        type: DeviceType = "normal";
        create: Date;
        update: Date;
        options: MqttOptions = {
            name: "",
            clientId: "",
            ssl: false,
            certType: "server",
            mqttVersion: "3.1.1",
            clientIdWithTime: false
        };
        alg_name: string = "";
        extra: any = {};

        constructor();
        constructor(name: string, options: MqttOptions);
        constructor(name: string, options: MqttOptions, id?: number);
        constructor(name?: string, options?: MqttOptions, id?: number) {
            if (id)
                this.id = id;
            if (name)
                this.name = name;
            if (options)
                this.options = options;
        }
    }

    export class DeskDevice {
        id?: number = undefined;
        device_id: number = 0;
        create: Date;
        type: TopicType = "pub";
        options: {} = {};

        constructor();
        constructor(device_id?: number);
        constructor(device_id?: number) {
            if (device_id)
                this.device_id = device_id;
        }
    }

    export type TopicType = "pub" | "sub";

    export class Topic {
        id?: number = undefined;
        device_id: number = 0;
        create: Date;
        type: TopicType = "pub";
        enable: boolean = true;
        name: string = "";
        topic: string = "";
        qos: number = 0;
        interval: number = 60;
        map: string[] = [];
        pubId: number | null = null;
        code: string = "";

        constructor();
        constructor(device_id: number, type?: TopicType);
        constructor(device_id?: number,type?: TopicType, id?: number) {
            if (device_id)
                this.device_id = device_id;
            if (type)
                this.type = type;
            if (id)
                this.id = id;
        }
    }

    export class Sensor {
        id?: number = undefined;
        create: Date;
        name: string = "";
        comment: string = "";
        code: string = "";

        constructor();
        constructor(name: string, comment?: string, code?: string)
        constructor(name?: string, comment?: string, code?: string) {
            if(name)
                this.name = name;
            if (comment)
                this.comment = comment;
            if (code)
                this.code = code;
        }
    }

    export type DeviceAction = "online" | "offline" | "publish" | "subscribe" | "unsubscribed" | "suback" | "unsuback";

    export class Log {
        id?: number = undefined;
        device_id: number = 0;
        action: DeviceAction = "online";
        topic: string = "";
        content: string = "";
        create: Date;

        constructor();
        constructor(device_id?: number, action?: string, topic?: string, content?: string);
        constructor(device_id?: number, action?: DeviceAction, topic?: string, content?: string) {
            if (device_id)
                this.device_id = device_id;
            if (action)
                this.action = action;
            if (topic)
                this.topic = topic;
            if (content)
                this.content = content;
        }
    }

    export class Options {
        id?: number = undefined;
        key: string = "";
        value: string = "";

        constructor();
        constructor(key?: string, value?: string);
        constructor(key?: string, value?: string) {
            if (key)
                this.key = key;
            if (value)
                this.value = value;
        }
    }

    export const context = new MqttEmu();
};
