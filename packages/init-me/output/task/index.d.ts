import { InitMeSeedObj } from '../lib/localConfig';
import { YylCmdLogger, LogLevel } from 'yyl-cmd-logger';
import { NpmSearchLogItem } from '../lib/search';
export interface Env {
    silent?: boolean;
    logLevel?: LogLevel;
    seed?: string;
    force?: boolean;
    [key: string]: any;
}
interface TaskOption {
    env: Env;
    logger?: YylCmdLogger;
}
export declare const task: {
    clear(op: TaskOption): Promise<void>;
    version(op: TaskOption): Promise<string>;
    path(op: Omit<TaskOption, 'logger'>): Promise<{
        app: string;
        config: string;
    }>;
    init(targetPath: string, op: TaskOption & {
        inset?: boolean;
    }): Promise<void>;
    install(names: string[], op: TaskOption & {
        silent?: boolean;
    }): Promise<void>;
    uninstall(names: string[], op: TaskOption): Promise<void>;
    list(op: TaskOption): Promise<{
        [pkgName: string]: InitMeSeedObj;
    }>;
    reset(op: TaskOption & {
        silent?: boolean;
    }): Promise<void>;
    link(op: TaskOption & {
        targetPath: string;
    }): Promise<void>;
    unlink(op: TaskOption & {
        targetPath: string;
    }): Promise<void>;
    recommend(op: TaskOption): Promise<NpmSearchLogItem[]>;
    fn: {};
};
export {};
