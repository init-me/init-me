interface ITask {
  version({ env: IEnv }): Promise<string>
  path({ env: IEnv }): Promise<string>
  init(targetPath: string, { env: IEnv }): Promise<any>
  install(names: string[], { env: IEnv }): Promise<any>
  uninstall(names: string[], { env: IEnv }): Promise<any>
  list({ env: IEnv }): Promise<ISeedMap>
  reset({ env: IEnv }): Promise<any>
  preRun({ env: IEnv }): void
  config: {
    init(): Promise<any>
    updateSeedInfo(): void
    read(): void
    rewrite(obj: ISeedConfig): void
    reset(): Promise<any>
  }
}
interface ISeedConfig {
  seeds: string[]
  seedMap: ISeedMap
}
interface ISeedMap {
  [seedName: string]: {
    version: string,
    main: string
  }
}
interface IEnv {
  silent?: boolean;
  logLevel?: number;
}
declare const task: ITask
export= task