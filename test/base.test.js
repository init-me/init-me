const task = require('../task/index');
const pkg = require('../package.json');
const path = require('path');

test('task.version({ env })', async () => {
  const ver = await task.version({ env: { silent: true}});
  expect(ver).toEqual(pkg.version);
});

test('task.path', async () => {
  const iPath = await task.path({
    env: {
      silent: true
    }
  });
  expect(iPath).toEqual(path.join(__dirname, '../'));
});