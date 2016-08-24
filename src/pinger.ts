import * as PingNet from 'ping';
import { PingResult } from 'ping';

export function Ping (host: string = '8.8.8.8'): Promise<PingResult> {
    return new Promise<PingResult>((resolve, reject) => {
        PingNet.promise.probe(host).then((res) => {
            if (res.time) {
                resolve(res);
            } else {
                reject(res);
            }
        });
    });
}

// Ping().then((res) => { console.log(res); });
