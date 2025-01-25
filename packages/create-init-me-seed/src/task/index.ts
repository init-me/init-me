import path from "path";
import fs from "fs";
import extOs from "yyl-os";
import chalk from "chalk";
import inquirer, { InputQuestion } from "inquirer";
import extFs from "yyl-fs";
import { YylCmdLogger, LogLevel } from "yyl-cmd-logger";
import { Lang } from "../lang";
import { replacer } from "init-me-helper";
const pkg = require("../../package.json");
export interface Env {
  silent?: boolean;
  logLevel?: LogLevel;
  name?: string;
}

const blankLogger: YylCmdLogger = {
  log() {
    return [];
  },
  setLogLevel() {},
  setProgress() {},
} as unknown as YylCmdLogger;

function formatOption(op?: { env: Env; logger: YylCmdLogger }) {
  const env: Required<Env> = {
    silent: !!op?.env.silent,
    logLevel: op?.env?.logLevel === undefined ? 1 : op.env.logLevel,
    name: op?.env?.name || "",
  };
  const logger = op?.logger || blankLogger;
  if (logger) {
    if (env.silent) {
      logger.setLogLevel(0);
    } else if (env.logLevel) {
      logger.setLogLevel(env.logLevel);
    } else {
      logger.setLogLevel(1);
    }
  }
  return {
    env,
    logger,
  };
}

export interface TaskOption {
  env: Env;
  logger: YylCmdLogger;
}

interface InitData {
  name: string;
  [key: string]: string;
}

export const task = {
  async init(targetPath: string, op: TaskOption) {
    const { env, logger } = formatOption(op);
    const questions: InputQuestion[] = [];
    const pjName = `${targetPath.split(/[\\/]/).pop()}`;
    let initData: InitData = {
      name: "",
    };
    if (!env.name) {
      questions.push({
        type: "input",
        name: "name",
        default: pjName,
        message: Lang.QUESTION.NAME,
      });
    } else {
      initData.name = env.name;
    }
    if (questions.length) {
      const anwser = await inquirer.prompt<{ name: string }>(questions);
      initData = {
        ...initData,
        ...anwser,
      };
    }

    // 拷贝文件
    logger.log("info", [Lang.INIT.COPY_START]);
    const oriPath = path.join(__dirname, "../../seed");
    const logs = await extFs.copyFiles(oriPath, [targetPath]);
    logger.log("success", [
      `${Lang.INIT.COPY_FINISHED}(add:${logs.add.length}, update: ${logs.update.length})`,
    ]);

    // rename 处理
    logger.log("info", [Lang.INIT.RENAME_START]);
    const renameMap: { [key: string]: string } = {};
    renameMap[path.join(targetPath, "gitignore")] = path.join(
      targetPath,
      ".gitignore",
    );
    renameMap[path.join(targetPath, "npmignore")] = path.join(
      targetPath,
      ".npmignore",
    );
    renameMap[path.join(targetPath, "prettierignore")] = path.join(
      targetPath,
      ".prettierignore",
    );
    Object.keys(renameMap).forEach((ori) => {
      const target = renameMap[ori];
      fs.writeFileSync(target, fs.readFileSync(ori));
      fs.unlinkSync(ori);
      logger.log("info", [
        `${path.relative(targetPath, ori)} => ${path.relative(targetPath, target)}`,
      ]);
    });
    logger.log("success", [Lang.INIT.RENAME_FINISHED]);

    logger.log("info", [Lang.INIT.REPLACE_START]);
    // pkg 处理
    const pkgPath = path.join(targetPath, "package.json");
    const targetPkg = require(pkgPath);
    targetPkg.name = initData.name;
    targetPkg.dependencies["init-me-seed-types"] =
      pkg.dependencies["init-me-seed-types"];
    fs.writeFileSync(pkgPath, JSON.stringify(targetPkg, null, 2));
    logger.log("info", [Lang.INIT.PKG_EDITED]);

    // data 替换
    const rPaths = [path.join(targetPath, "README.md"), pkgPath];
    rPaths.forEach((iPath) => {
      const cnt = fs.readFileSync(iPath).toString();
      fs.writeFileSync(iPath, replacer.dataRender(cnt, initData));
      logger.log("update", [iPath]);
    });
    logger.log("success", [Lang.INIT.REPLACE_FINISHED]);
  },
  version(op: TaskOption) {
    const { env, logger } = formatOption(op);
    if (!env.silent) {
      logger &&
        logger.log("info", [
          `create-init-me-seed ${chalk.yellow.bold(pkg.version)}`,
        ]);
    }
    return Promise.resolve(pkg.version);
  },
  path(op: Omit<TaskOption, "logger">) {
    const { env } = op;
    const r = {
      app: path.join(__dirname, "../"),
    };
    if (!env.silent) {
      console.log(
        ["", " App path:", ` ${chalk.yellow.bold(r.app)}`, ""].join("\r\n"),
      );
      extOs.openPath(r.app);
    }
    return Promise.resolve(r);
  },
};
