import { YylCmdLogger, LogLevel } from 'yyl-cmd-logger';
export interface Env {
    silent?: boolean;
    logLevel?: LogLevel;
}
export interface TaskOption {
    env: Env;
    logger: YylCmdLogger;
}
export declare const task: {
    init(targetPath: string, op: TaskOption): Promise<void>;
    version(op: TaskOption): Promise<any>;
    path(op: Omit<TaskOption, 'logger'>): Promise<{
        app: string;
    }>;
};
