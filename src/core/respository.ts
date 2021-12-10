import Dexie from "dexie";
import { db } from "@/core/db";
import { MqttOptions } from '@/core/mqtt-options';

export namespace respository {

    class Device {
        getList(page: number, rows: number) {
            let start = (page - 1) * rows;

            var p1 = db.context.device.count(c => {
                return c;
            });

            var p2 = db.context.device.reverse().offset(start).limit(rows).toArray().then(ds => {
                return ds;
            });

            return Promise.all([p1, p2]).then(r => {
                let pages = Math.floor((r[0] + rows - 1) / rows);

                return {
                    pages: pages,
                    count: r[0],
                    page: page,
                    data: r[1]
                }
            });
        }

        get(id: number) {
            return db.context.device.where("id").equals(id).first();
        }

        add(name: string, options: MqttOptions, type: db.DeviceType = "normal", alg_name: string | null = null, extra: any | null = null) {
            var d = new db.Device(name, options);
            d.create = new Date();
            d.alg_name = alg_name;
            d.extra = extra;
            d.type = type;

            db.context.device.put(d).then(id => {
                d.id = id;
                return d;
            });
        }

        update(id: number, name: string, options: object, type: db.DeviceType = "normal", alg_name: string | null = null, extra: any | null = null) {
            return db.context.device.update(id, {
                name: name,
                type:type,
                update: new Date(),
                alg_name : alg_name,
                extra: extra,
                options: options
            });
        }

        remove(id: number) {
            return db.context.device.where("id").equals(id).delete();
        }
    };

    class Desk {
        getList() {
            return db.context.desk.orderBy("create").reverse().toArray();
        }

        add(device_id: number) {
            var d = new db.DeskDevice(device_id);
            d.create = new Date();
            return db.context.desk.put(d).then(id => {
                d.id = id;
                return d;
            });
        }

        remove(device_id: number) {
            return db.context.desk.filter(d => {
                return d.device_id == device_id;
            }).delete();
        }
    };

    class Log {
        getList(id: number, page: number, rows: number) {
            let start = (page - 1) * rows;

            var p1 = db.context.log.where("device_id").equals(id).count(c => {
                return c;
            });

            var p2 = db.context.log.where("device_id").equals(id).reverse().offset(start).limit(rows).toArray().then(ds => {
                return ds;
            });

            return Promise.all([p1, p2]).then(r => {
                let pages = Math.floor((r[0] + rows - 1) / rows);

                return {
                    pages: pages,
                    count: r[0],
                    page: page,
                    data: r[1]
                }
            });
        }

        add(device_id: number, action: db.DeviceAction, topic: string, content: string) {
            var d = new db.Log(device_id, action, topic, content);
            d.create = new Date();
            return db.context.log.put(d).then(id => {
                d.id = id;
                return d;
            });
        }

        clear(device_id: number) {
            return db.context.log.where("device_id").equals(device_id).delete();
        }
    }

    class Topic {
        getList(device_id: number) {
            return db.context.topic.where("device_id").equals(device_id).reverse().toArray();
        }

        add(device_id: number, type: db.TopicType, opt: any) {
            var d: any = new db.Topic(device_id, type);
            d.create = new Date();

            for (let p in opt) {
                (d as any)[p] = opt[p];
            }

            return db.context.topic.put(d).then(id => {
                d.id = id;
                return d;
            });
        }

        update(id: number, opt: any) {
            var d: any = {
                update: new Date()
            };

            for (let p in opt) {
                (d as any)[p] = opt[p];
            }

            return db.context.topic.update(id, d);
        }

        remove(id: number) {
            return db.context.topic.where("id").equals(id).delete();
        }

        get(id: number) {
            return db.context.topic.where("id").equals(id).first();
        }

        find(device_id: number, topic: string) {
            return db.context.topic.where("device_id").equals(device_id).and((item) => {
                return item.topic === topic
            }).first();
        }

        clear(device_id: number) {
            return db.context.topic.where("device_id").equals(device_id).delete();
        }
    }

    class Sensor {
        getList(page: number, rows: number) {
            let start = (page - 1) * rows;

            var p1 = db.context.sensor.count(c => {
                return c;
            });

            var p2 = db.context.sensor.reverse().offset(start).limit(rows).toArray().then(ds => {
                return ds;
            });

            return Promise.all([p1, p2]).then(r => {
                let pages = Math.floor((r[0] + rows - 1) / rows);

                return {
                    pages: pages,
                    count: r[0],
                    page: page,
                    data: r[1]
                }
            });
        }

        getAll() {
            return db.context.sensor.reverse().toArray();
        }

        getWithId(ids: number[]) {
            return db.context.sensor.where("id").anyOf(ids).toArray();
        }

        add(name: string, comment: string, code: string) {
            var d = new db.Sensor(name, comment, code);
            d.create = new Date();
            return db.context.sensor.put(d).then(id => {
                d.id = id;
                return d;
            });
        }

        update(id: number, name: string, comment: string, code: string) {
            db.context.sensor.update(id, {
                update: new Date(),
                name: name,
                comment: comment,
                code: code
            });
        }

        remove(id: number) {
            return db.context.sensor.where("id").equals(id).delete();
        }

        get(id: number) {
            return db.context.sensor.where("id").equals(id).first();
        }
    }

    class Options {
        cache: any = {};

        addOrUpdate(key: string, value: string) {
            let _this = this;

            return db.context.options.where("key").equals(key).first().then(d => {
                if (d) {
                    d.value = value;
                    return db.context.options.update(d.id!, {
                        value: d.value
                    }).then(() => {
                        _this.cache[key] = value;
                        return d;
                    });
                } else {
                    d = new db.Options(key, value);
                    return db.context.options.put(d).then(id => {
                        d!.id = id;
                        _this.cache[key] = value;
                        return d;
                    });
                }
            });
        }

        get(key: string): Promise<string|null> {
            if (this.cache[key])
                return Promise.resolve(this.cache[key] as string);
            else
                return db.context.options.where("key").equals(key).first().then(d => { return d ? d.value : null });
        }
    }

    export const device = new Device();
    export const desk = new Desk();
    export const topic = new Topic();
    export const sensor = new Sensor();
    export const log = new Log();
    export const options = new Options();
}