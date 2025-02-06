# init-me

项目初始化 `seed` 管理脚手架，会读取 `init-me-seed-` 开头的所有 npm 包, 根据协定内容对项目进行初始化

## 安装

```bash
yarn global add init-me
```

## usage

###

### seed 包安装

```bash
init install init-me-seed-initialize
```

### seed 包卸载

```bash
init uninstall init-me-seed-initialize
```

### seed 包列表

```bash
init list
```

### 运行

```bash
init
init path/to/dir
```

### 重置配置

```bash
init reset
```

### 显示工具路径

```bash
init --path
init -p
```

### 显示版本

```bash
init --version
init -v
```

### 显示帮助

```bash
init --help
init -h
```

### 安装本地 seed 包 (用于开发)

```bash
init link
```

### 卸载本地 seed 包 (用于开发)

```bash
init unlink
```

## seed 包开发

seed 包初始化

```bash
yarn create init-me-seed
```
