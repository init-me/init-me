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
  path({ env: IEnv }): Promise<string>
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
```