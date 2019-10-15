# 更新日志
## 0.2.3 (2019-10-15)
* feat: 新增 `init r`
* fix: 修复 `init recommend` 时 如搜索结果换行，显示异常问题

## 0.2.2 (2019-09-29)
* feat: 新增 `init clear` 用于 清除 init-me 配置文件
* feat: 补充 install 时 没有 `.init-me` 文件时的 test-case
* feat: `init --path` 会同时返回 `r.app` `r.config` 2 个路径
* fix: 修复 `init` 输入不存在的命令时， seed 列表会清空 的问题

## 0.2.1 (2019-09-24)
* fix: 修复 初装 `init-me` 时，`init install` 会报错问题

## 0.2.0 (2019-09-24)
* feat: `init list` 命令新增 已安装 和 本地安装 列表
* feat: `init link` 可以让 cwd 所在项目接入配置项 (方便开发)
* feat: `init unlink` 解除 当前 cwd 项目接入 (方便开发)
* feat: `init recommend` 新增， 显示线上未安装的 seed 包列表

## 0.1.1 (2019-09-16)
* fix: 修复 `env` 参数不对问题

## 0.1.0 (2019-08-31)
* feat: 新增 `init -v`
* feat: 新增 `init --version`
* feat: 新增 `init -h`
* feat: 新增 `init --help`
* feat: 新增 `init -p`
* feat: 新增 `init --path`
* feat: 新增 `init -q`
* feat: 新增 `init --silent`
* feat: 新增 `init install <pkgName>`
* feat: 新增 `init i <pkgName>`
* feat: 新增 `init uninstall <pkgName>`
* feat: 新增 `init reset`
* feat: 新增 `init list`

## 0.0.1 (2019-07-02)
* feat: 诞生