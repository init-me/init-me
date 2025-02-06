import type { YylCmdLogger } from 'yyl-cmd-logger'
export namespace InitMeSeed {
  export interface Logger extends YylCmdLogger {}
  export interface InitData {
    [key: string]: any
  }
  /** cmd 参数 */
  export interface Env {
    /** 类型 */
    type?: string
    [key: string]: any
  }
  /** seed 配置 */
  export interface Config<E extends Env = Env> {
    /** 复制路径 */
    path: string
    /** 钩子 */
    hooks?: Hooks<E>
  }
  /** 钩子 */
  export interface HookStartOption<E extends Env> {
    /** cmd 参数 */
    env: E
    /** 初始化路径 */
    targetPath: string
    initData: InitData
  }
  /**
   * 复制钩子配置
   * */
  export interface HookCopyOption<E extends Env> {
    /** 文件 map */
    fileMap: FileMap
    /** 初始化路径 */
    targetPath: string
    /** cmd 参数 */
    env: E
    /** logger */
    logger: Logger
    /** initData */
    initData: InitData
  }
  /** 文件map */
  export interface FileMap {
    /** 拷贝map */
    [orgPath: string]: string[]
  }
  /** 钩子 */
  export interface Hooks<E extends Env> {
    /**
     * seed 包启动时回调函数
     * @param op.env - cmd 参数;
     * @param op.targetPath 初始化路径;
     */
    beforeStart?(op: HookStartOption<E>): Promise<InitData | undefined>
    /**
     * seed 包复制前回调函数
     * @param op.env - cmd 参数;
     * @param op.targetPath 初始化路径;
     * @param op.fileMap 复制 map;
     */
    beforeCopy?(op: HookCopyOption<E>): Promise<FileMap>
    /**
     * seed 包复制后回调函数
     * @param op.env - cmd 参数;
     * @param op.targetPath 初始化路径;
     * @param op.fileMap 复制 map;
     */
    afterCopy?(op: HookCopyOption<E>): Promise<any>
  }
}
