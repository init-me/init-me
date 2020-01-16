interface InitMe {
  /** 打印版本信息 */
  version({ env: Env }): Promise<string>
  /** 获取工具所在目录 */
  path({ env: Env }): Promise<{app: string, config: string}>
  /**
   * 项目初始化
   * @param targetPath 初始化路径
   * @param op.env 参数; op.inset 是否内嵌 
   */
  init(targetPath: string, { env: Env, inset: boolean }): Promise<any>
  /**
   * 安装 seed 包
   * @param names 插件名称列表
   * @param param1 选项
   */
  install(names: string[], { env: Env }): Promise<any>
  /**
   * 卸载 seed 包
   * @param names 插件名称列表
   * @param param1 选项
   */
  uninstall(names: string[], { env: Env }): Promise<any>
  /**
   * 显示已安装插件列表
   * @param param0 选项
   */
  list({ env: Env }): Promise<SeedMap>
  /**
   * 重置工具
   * @param param0 选项
   */
  reset({ env: Env }): Promise<any>

  /**
   * 安装本地 seed 包（用于开发）
   * @param param0 选项
   */
  link({ env: Env, targetPath: string}): Promise<any>
  /**
   * 卸载本地 seed 包（用于开发）
   * @param param0 选项
   */
  unlink({ env: Env, targetPath: string}): Promise<any>
  /**
   * 显示推荐列表（未安装）
   * @param param0 选项
   */
  recommend({ env: Env }): Promise<string[]>
}
interface SeedConfig {
  seeds: string[]
  seedMap: SeedMap
}
interface SeedMap {
  [seedName: string]: {
    version: string,
    main: string
  }
}
interface Env {
  silent?: boolean;
  logLevel?: number;
}
declare const initMe: InitMe
export= initMe