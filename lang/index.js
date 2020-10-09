module.exports = {
  DESCRIPTION: {
    PATH: '显示 并打开 init-me 工具所在路径',
    INSTALL: '安装 init-me seed 包',
    UNINSTALL: '卸载 init-me seed 包',
    VERSION: '显示 init-me 版本',
    RESET: '重置 init-me',
    DIR_NAME: '在目标路径下进行初始化',
    SILENT: '静默输出',
    LIST: '显示 init-me 已安装的 seed 包',
    SEED: 'seed 包名称',
    LINK: '安装本地 seed 包',
    UNLINK: '卸载本地 seed 包',
    LOG_LEVEL: 'log 类型: 0|1|2',
    YY: '设置 当前处于 YY 环境下',
    RECOMMEND: '显示未安装的推荐 seed 包',
    CLEAR: '清除 init-me 配置文件',
    FORCE: '跳过检查 seed 包版本逻辑直接运行初始化'
  },
  SEARCH: {
    NPM_SEARCH_ERROR: 'npm search init-me-seed- 执行失败，请检查本地 npm 配置, 可参考 http://fet.yy.com/init-me/wiki/custom-qa/'
  },
  INIT: {
    BLANK_SEED: 'init 运行失败，seed 列表为空，请先安装 seed 再运行',
    LIST_START: '正在拉取可运行 seed 包',
    LIST_FINISHED: '拉取可运行 seed 包 完成',
    SEED_NOT_EXISTS: 'seed 不存在',
    QUEATION_SELECT_TYPE: '请选择初始化的 seed 包',

    SKIP_CHECK_VERSION: '跳过检查 seed 包版本',
    CHECK_VERSION_START: '正在检查 seed 包版本是否最新',
    CHECK_VERSION_FINISHED: '检查 seed 包版本完成',
    PKG_IS_LATEST: '已是最新版',

    UPDATE_PKG_VERSION_START: '开始更新 seed 包版本',
    UPDATE_PKG_VERSION_FINISHED: '更新 seed 包版本完成',

    START: 'init 运行开始',
    FINISHED: 'init 完成',
    SEED_INSTALLING: '正在安装 seed 包',
    SEED_INSTALLED: '安装 seed 包 完成',
    SEED_LOADING: '正在加载 seed 包',
    SEED_LOAD_FINISHED: '加载完成',
    SEED_MAP_NOT_EXISTS: 'seed 配置不存在，请重新安装 seed 包',
    SEED_MAP_MAIN_NOT_EXISTS: 'seed 配置错误，请重新安装 seed 包',
    SEED_COPY_PATH_NOT_EXISTS: 'seed.path 路径不存在，请联系 seed 包作者',
    SEED_COPY_PATH_UNDEFINED: 'seed.path 没有设置，请联系 seed 包作者',
    SEED_COPY_PATH_PRINT: 'seed 待复制原始路径',
    SEED_COPY_MAP_PRINT: 'seed 复制路径映射预览',
    SEED_MAIN_PRINT: 'seed 包路径',
    HOOKS_BEFORE_START_RUN: 'hooks.beforeStart 触发',
    HOOKS_BEFORE_START_FINISHED: 'hooks.beforeStart 完成',
    HOOKS_BEFORE_COPY_RUN: 'hooks.beforeCopy 触发',
    HOOKS_BEFORE_COPY_FINISHED: 'hooks.beforeCopy 完成',
    HOOKS_AFTER_COPY_RUN: 'hooks.afterCopy 触发',
    HOOKS_AFTER_COPY_FINISHED: 'hooks.afterCopy 完成'
  },
  INSTALL: {
    START: 'install 运行开始',
    FINISHED: 'install 运行完成'
  },
  UNINSTALL: {
    START: 'uninstall 运行开始',
    FINISHED: 'uninstall 运行完成'
  },
  LIST: {
    BLANK: 'seed 列表为空',
    PKG_LIST: '已安装 Seed 列表',
    LOCAL_LIST: '本  地 Seed 列表'
  },
  LINK: {
    START: '安装本地 seed 包 开始',
    FINISHED: '安装本地 seed 包 完成',
    PKG_NOT_FOUND: '当前目录下 package.json 不存在',
    PKG_NAME_IS_BLANK: 'pkg.name 为空',
    PKG_VERSION_IS_BLANK: 'pkg.version 为空',
    PKG_ENTRY_IS_BLANK: 'pkg.main 为空',
    PKG_ENTRY_NOT_EXISTS: 'pkg.main 路径不存在'
  },
  UNLINK: {
    START: '卸载本地 seed 包 开始',
    FINISHED: '卸载本地 seed 包 完成',
    PKG_NOT_FOUND: '当前目录下 package.json 不存在',
    PKG_NAME_IS_BLANK: 'pkg.name 为空'
  },
  LOCAL_STORAGE: {
    PARSE_ERROR: '配置解析错误'
  },
  RESET: {
    START: '重置 init-me 开始',
    FINISHED: '重置 init-me 完成'
  },
  RECOMMEND: {
    SEARCH_NPM_START: '查找 npm 相关信息 开始',
    SEARCH_NPM_FINISHED: '查找 npm 相关信息 完成',
    SEARCH_YY_NPM_START: '查找 yy npm 相关信息 开始',
    SEARCH_YY_NPM_FINISHED: '查找 yy npm 相关信息 完成',
    TITLE: '推荐 seed 包 列表',
    RESULT_BLANK: '暂无推荐信息'
  },
  CLEAR: {
    START: '清理 init-me 配置文件 开始',
    FINISHED: '清理 init-me 配置文件 完成'
  }
};