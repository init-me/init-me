interface ITask {
  /**
   * 打印版本信息
   * @param param0 选项
   */
  version({ env: IEnv }): Promise<string>
  /**
   * 获取工具所在目录
   * @param param0 选项
   */
  path({ env: IEnv }): Promise<{app: string, config: string}>
  /**
   * 项目初始化
   * @param targetPath 初始化路径
   * @param param1 选项
   */
  init(targetPath: string, { env: IEnv }): Promise<any>
  /**
   * 安装 seed 包
   * @param names 插件名称列表
   * @param param1 选项
   */
  install(names: string[], { env: IEnv }): Promise<any>
  /**
   * 卸载 seed 包
   * @param names 插件名称列表
   * @param param1 选项
   */
  uninstall(names: string[], { env: IEnv }): Promise<any>
  /**
   * 显示已安装插件列表
   * @param param0 选项
   */
  list({ env: IEnv }): Promise<ISeedMap>
  /**
   * 重置工具
   * @param param0 选项
   */
  reset({ env: IEnv }): Promise<any>

  /**
   * 安装本地 seed 包（用于开发）
   * @param param0 选项
   */
  link({ env: IEnv, targetPath: string}): Promise<any>
  /**
   * 卸载本地 seed 包（用于开发）
   * @param param0 选项
   */
  unlink({ env: IEnv, targetPath: string}): Promise<any>
  /**
   * 显示推荐列表（未安装）
   * @param param0 选项
   */
  recommend({ env: IEnv }): Promise<string[]>
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