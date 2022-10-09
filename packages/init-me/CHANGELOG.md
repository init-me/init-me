# 更新日志

## 1.0.0 (2021-05-15)

- feat: task 新增 logger 入参
- feat: seed 文件的 beforeCopy, afterCopy 新增 logger 入参
- feat: 更换 `yyl-request` -> `axios`
- fix: 修复 判断是否处于 yy 环境 超时不返回问题
- feat: 更新 `commander@7.2.0`
- feat: 更新 `chalk@4.1.1`
- feat: 更新 `inquirer@8.0.0`
- feat: 更新 `yyl-os@0.14.0`
- feat: 更新 `yyl-print@0.9.1`
- feat: 更新 `yyl-util@2.3.9`
- feat: 更新 `eslint@7.26.0`
- feat: 更新 `jest@26.6.3`

## 0.4.10 (2020-10-09)

- feat: 完善 prettier、 eslint

## 0.4.9 (2020-10-09)

- feat: 优化 npm 环境错误时的提示文案, 补充链接指引

## 0.4.8 (2020-09-22)

- fix: 修复 lib 内 `seedFull2Short` `seedShort2Full` 错误问题

## 0.4.7 (2020-03-29)

- fix: 去除多余的 log

## 0.4.6 (2020-03-27)

- fix: 修复 init 初始化时出现重复包的问题

## 0.4.5 (2020-02-20)

- fix: 当已经安装远程 a 包， 在本地执行 `init link` 连接本地 a 包时， 执行 init 初始化列表中会存在 2 个 a 包选项的问题

## 0.4.4 (2020-02-19)

- feat: 内部包自动添加 --registry
- feat: 优化 npm 环境错误时的提示文案

## 0.4.3 (2020-02-10)

- feat: 完善 错误 显示逻辑
- feat: 完善 单元测试

## 0.4.2 (2020-01-16)

- feat: node 方法 `initMe.init(targetPath, { env, inset})` 添加 inset 字段

## 0.4.1 (2020-01-15)

- fix: 修复 init 不显示本地包的问题

## 0.4.0 (2019-12-31)

- feat: `init` 执行后直接展示线上可运行的 seed 包，不单单只展示本地 已安装的 seed 包。
- feat: `init recommend` 不再需要输入 `--yy` 来区分是否处在 内网环境
- feat: `init recommend` 为优化速度，内部项目不再显示 版本信息

## 0.3.1 (2019-12-04)

- fix: 修复新环境安装 `init-me` 后 执行 init 会报错问题

## 0.3.0 (2019-11-08)

- feat: 新增 运行 `seed 包` 之前会对 seed 包版本进行校验是否最新，若不是 会自动下载最新版 (不影响本地开发)
- feat: 新增 `--force` 参数 用于跳过 seed 包版本更新逻辑

## 0.2.4 (2019-11-07)

- fix: 修复 `init-me` 读取 `seed.path` 为相对路径时， 解析不对问题

## 0.2.3 (2019-10-15)

- feat: 新增 `init r`
- fix: 修复 `init recommend` 时 如搜索结果换行，显示异常问题

## 0.2.2 (2019-09-29)

- feat: 新增 `init clear` 用于 清除 init-me 配置文件
- feat: 补充 install 时 没有 `.init-me` 文件时的 test-case
- feat: `init --path` 会同时返回 `r.app` `r.config` 2 个路径
- fix: 修复 `init` 输入不存在的命令时， seed 列表会清空 的问题

## 0.2.1 (2019-09-24)

- fix: 修复 初装 `init-me` 时，`init install` 会报错问题

## 0.2.0 (2019-09-24)

- feat: `init list` 命令新增 已安装 和 本地安装 列表
- feat: `init link` 可以让 cwd 所在项目接入配置项 (方便开发)
- feat: `init unlink` 解除 当前 cwd 项目接入 (方便开发)
- feat: `init recommend` 新增， 显示线上未安装的 seed 包列表

## 0.1.1 (2019-09-16)

- fix: 修复 `env` 参数不对问题

## 0.1.0 (2019-08-31)

- feat: 新增 `init -v`
- feat: 新增 `init --version`
- feat: 新增 `init -h`
- feat: 新增 `init --help`
- feat: 新增 `init -p`
- feat: 新增 `init --path`
- feat: 新增 `init -q`
- feat: 新增 `init --silent`
- feat: 新增 `init install <pkgName>`
- feat: 新增 `init i <pkgName>`
- feat: 新增 `init uninstall <pkgName>`
- feat: 新增 `init reset`
- feat: 新增 `init list`

## 0.0.1 (2019-07-02)

- feat: 诞生
