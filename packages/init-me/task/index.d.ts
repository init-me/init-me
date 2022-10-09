import { YylCmdLogger } from 'yyl-cmd-logger'
export interface InitMe {
  /** 打印版本信息 */
  version({ env: Env, logger: YylCmdLogger }): Promise<string>
  /** 获取工具所在目录 */
  path({ env: Env }): Promise<{app: string, config: string}>
  /**
   * 项目初始化
   * @param targetPath 初始化路径
   * @param op.env 参数; op.inset 是否内嵌 
   */
  init(targetPath: string, { env: Env, inset: boolean, logger: YylCmdLogger }): Promise<any>
  /**
   * 安装 seed 包
   * @param names 插件名称列表
   * @param param1 选项
   */
  install(names: string[], { env: Env, logger: YylCmdLogger }): Promise<any>
  /**
   * 卸载 seed 包
   * @param names 插件名称列表
   * @param param1 选项
   */
  uninstall(names: string[], { env: Env, logger: YylCmdLogger }): Promise<any>
  /**
   * 显示已安装插件列表
   * @param param0 选项
   */
  list({ env: Env, logger: YylCmdLogger }): Promise<SeedMap>
  /**
   * 重置工具
   * @param param0 选项
   */
  reset({ env: Env, logger: YylCmdLogger }): Promise<any>

  /**
   * 安装本地 seed 包（用于开发）
   * @param param0 选项
   */
  link({ env: Env, targetPath: string, logger: YylCmdLogger }): Promise<any>
  /**
   * 卸载本地 seed 包（用于开发）
   * @param param0 选项
   */
  unlink({ env: Env, targetPath: string, logger: YylCmdLogger }): Promise<any>
  /**
   * 显示推荐列表（未安装）
   * @param param0 选项
   */
  recommend({ env: Env, logger: YylCmdLogger }): Promise<string[]>
}
export interface SeedConfig {
  seeds: string[]
  seedMap: SeedMap
}
export interface SeedMap {
  [seedName: string]: {
    version: string,
    main: string
  }
}
export interface Env {
  silent?: boolean;
  logLevel?: number;
}
declare const initMe: InitMe
export= initMe