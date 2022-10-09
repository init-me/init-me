import { InitMeSeedObj } from '../lib/localConfig';
import { YylCmdLogger, LogLevel } from 'yyl-cmd-logger';
import { NpmSearchLogItem } from '../lib/search';
export interface Env {
    silent?: boolean;
    logLevel?: LogLevel;
    seed?: string;
    force?: boolean;
}
export declare const task: {
    clear(op: {
        env: Env;
        logger: YylCmdLogger;
    }): Promise<void>;
    version(op: {
        env: Env;
        logger: YylCmdLogger;
    }): Promise<any>;
    path(op: {
        env: Env;
    }): Promise<{
        app: string;
        config: string;
    }>;
    init(targetPath: string, op: {
        env: Env;
        inset?: boolean;
        logger: YylCmdLogger;
    }): Promise<void>;
    install(names: string[], op: {
        env: Env;
        silent?: boolean;
        logger: YylCmdLogger;
    }): Promise<void>;
    uninstall(names: string[], op: {
        env: Env;
        logger: YylCmdLogger;
    }): Promise<void>;
    list(op: {
        env: Env;
        logger: YylCmdLogger;
    }): Promise<{
        [pkgName: string]: InitMeSeedObj;
    }>;
    reset(op: {
        env: Env;
        logger: YylCmdLogger;
        silent?: boolean;
    }): Promise<void>;
    link(op: {
        targetPath: string;
        env: Env;
        logger: YylCmdLogger;
    }): Promise<void>;
    unlink(op: {
        targetPath: string;
        env: Env;
        logger: YylCmdLogger;
    }): Promise<void>;
    recommend(op: {
        env: Env;
        logger: YylCmdLogger;
    }): Promise<NpmSearchLogItem[]>;
    fn: {};
};
