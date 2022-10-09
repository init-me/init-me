export declare const pkg: PkgConfig;
export interface InitMeSeedConfig {
    seeds: string[];
    seedMap: {
        [pkgName: string]: InitMeSeedObj;
    };
}
export interface InitMeSeedObj {
    name: string;
    version: string;
    main: string;
    dev: boolean;
}
export declare type InitMeLocalSeedConfig = InitMeSeedConfig['seedMap'];
export interface PkgConfig {
    name: string;
    version: string;
    description: string;
    license: string;
    repository: {
        [name: string]: string;
    };
    dependencies: {
        [name: string]: string;
    };
    devDependencies: {
        [name: string]: string;
    };
}
export declare class LocalConfig {
    private handle;
    private pkgHandle;
    private seedHandle;
    constructor();
    get(): Promise<InitMeSeedConfig>;
    updateSeedInfo(): Promise<InitMeSeedConfig>;
    addlocalSeed(name: string, seedObj: InitMeSeedObj): Promise<InitMeSeedConfig>;
    removeLocalSeed(name: string): Promise<InitMeSeedConfig>;
    reset(): Promise<InitMeSeedConfig>;
}
