declare module 'ping' {
    export namespace sys {
        function probe (host: string, callback: (isAlive: boolean, error: any | void) => any, options?: PingOptions);
    }

    export namespace promise {
        function probe (host: string, options?: PingOptions): Promise<PingResult>;
    }

    export interface PingResult {
        host: string;
        alive: boolean;
        output: string;
        time: number;
    }

    export interface PingOptions {
        extra?: string[];
        timeout: boolean | number;
    }
}
