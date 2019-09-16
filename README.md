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

## seed 包开发
* 参考例子 [init-me-seed-hellowrold](http://www.github.com/jackness1208/init-me-seed-helloworld)
* seed包初始化 [init-me-seed-initialize](http://www.github.com/jackness1208/init-me-seed-initialize)


## node 模式
### 引入
```typescript
const initme: ITask = require('init-me')
interface ITask {
  version({ env: IEnv }): Promise<string>
  path({ env: IEnv }): Promise<string>
  init(targetPath: string, { env: IEnv }): Promise<any>
  install(names: string[], { env: IEnv }): Promise<any>
  uninstall(names: string[], { env: IEnv }): Promise<any>
  list({ env: IEnv }): Promise<ISeedMap>
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
```