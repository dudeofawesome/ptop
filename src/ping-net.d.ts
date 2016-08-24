declare module 'ping-net' {
    export function ping (callback: (res: PingNetResults) => any);
    export function ping (options: PingNetOptions, callback?: (res: PingNetResults) => any);

    export interface PingNetOptions {
        address?: string;
        port?: number;
        timeout?: number;
        attempts?: number;
    }

    export interface PingNetResults {
        address: string;
        port: number;
        attempts: number;
        avg: number;
        max: number;
        min: number;
        results: {
            seq: number;
            time: number;
        }[];
    }
}
