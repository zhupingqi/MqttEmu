import { IClientOptions } from 'mqtt';

export interface MqttOptions extends IClientOptions {
    name: '';
    clientId: '';
    ssl: false;
    certType: 'server' | 'self';
    mqttVersion: '3.1.1' | '5.0';
    clientIdWithTime: false
};