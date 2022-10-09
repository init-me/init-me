# init-me
## 安装
```
npm install init-me -g
```

## usage

### seed 包安装
```
init install init-me-seed-initialize
```

### seed 包卸载
```
init uninstall init-me-seed-initialize
```

### seed 包列表
```
init list
```

### 运行
```
init
init path/to/dir
```

### 重置配置
```
init reset
```

### 显示工具路径
```
init --path
init -p
```

### 显示版本
```
init --version
init -v
```

### 显示帮助
```
init --help
init -h
```

### 安装本地 seed 包 (用于开发)
```
init link
```

### 卸载本地 seed 包 (用于开发)
```
init unlink
```

## seed 包开发
* 参考例子 [init-me-seed-hellowrold](http://www.github.com/jackness1208/init-me-seed-helloworld)
* seed包初始化 [init-me-seed-initialize](http://www.github.com/jackness1208/init-me-seed-initialize)


## node 模式
### 引入
```js
const initMe = require('init-me');
```
```typescript
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
```