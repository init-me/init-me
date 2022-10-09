export declare const USERPROFILE: string;
export declare const CONFIG_PATH: string;
export interface AnyObj {
    [key: string]: any;
}
export declare class LocalStorage<D extends AnyObj = AnyObj> {
    private name;
    savePath: string;
    private defaultData;
    private data;
    constructor(name: string, data: D);
    get(): Promise<D>;
    set<ID extends D>(data: ID): Promise<D>;
}
