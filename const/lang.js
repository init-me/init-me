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
    LOG_LEVEL: 'log 类型: 0|1|2'
  },
  INIT: {
    BLANK_SEED: 'init 运行失败，seed 列表为空，请先安装 seed 再运行',
    SEED_NOT_EXISTS: 'seed 不存在',
    QUEATION_SELECT_TYPE: '请选择初始化的 seed 包',
    START: 'init 运行开始',
    FINISHED: 'init 完成',
    SEED_LOADING: '正在加载 seed 包',
    SEED_LOAD_FINISHED: '加载完成',
    SEED_MAP_NOT_EXISTS: 'seed 配置不存在，请重新安装 seed 包',
    SEED_MAP_MAIN_NOT_EXISTS: 'seed 配置错误，请重新安装 seed 包',
    SEED_COPY_PATH_NOT_EXISTS: 'seed.path 路径不存在，请联系 seed 包作者',
    SEED_COPY_PATH_UNDEFINED: 'seed.path 没有设置，请联系 seed 包作者',
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
  CONFIG: {
    RESET_START: '配置重置开始',
    RESET_FINISHED: '配置重置完成'
  },
  LIST: {
    BLANK: 'seed 列表为空'
  },
  ERROR: {
    CONFIG_PARSE: '配置解析错误'
  }
};