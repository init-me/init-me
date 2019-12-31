const task = require('../../task/index.js');
const path = require('path');
const fs = require('fs');
const extFs = require('yyl-fs');

const SEED_NAME = 'init-me-seed-helloworld';
const FRAG_PATH = path.join(__dirname, '../../../__frag');
const env = { silent: true };

const USERPROFILE = process.env[process.platform == 'win32' ? 'USERPROFILE' : 'HOME'];
const CONFIG_PATH = path.join(USERPROFILE, '.init-me');

jest.setTimeout(30000);

test('task.init(targetPath, { env })', async () => {
  await extFs.removeFiles(CONFIG_PATH, true);

  await task.reset({ env });
  await task.install([SEED_NAME], { env });

  if (fs.existsSync(FRAG_PATH)) {
    await extFs.removeFiles(FRAG_PATH, true);
    await extFs.mkdirSync(FRAG_PATH);
  }

  await task.init(FRAG_PATH, {
    env: {
      silent: true,
      seed: SEED_NAME,
      type: 'typescript'
    }
  });

  expect(fs.readdirSync(FRAG_PATH).length).not.toEqual(0);
  await task.reset({ env });
  await extFs.removeFiles(FRAG_PATH, true);
});