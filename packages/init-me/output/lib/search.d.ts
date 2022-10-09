export declare const REG_IS_YY_PKG: RegExp;
export declare const REGISTRY_OPTION = "--registry=https://npm-registry.yy.com";
export declare function inYY(): Promise<boolean>;
export declare function getPkgLatestVersion(pkgName: string): Promise<string>;
export declare type NpmSearchLogKeys = 'date' | 'version';
export interface NpmSearchLogItem {
    date: string;
    version: string;
    name: string;
    install?: string;
    [key: string]: string | undefined;
}
export declare function searchNpm(key: string): Promise<NpmSearchLogItem[]>;
export declare function searchYyNpm(key: string): Promise<NpmSearchLogItem[]>;
export declare function listSeed(): Promise<string[]>;
