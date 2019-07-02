const util = require('yyl-util');
const print = require('yyl-print');
const runner = require('./task/runner');
const { cmds, env, shortEnv } = util.cmdParse(process.argv, {
  env: {
    verbose: Boolean,
    silent: Boolean
  }
});

runner({cmds, env, shortEnv}).then(() => {

}).catch((er) => {
  print.log.error(er);
});