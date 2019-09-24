const task = require('../../task/index');
const pkg = require('../../package.json');

test('task.version({ env })', async () => {
  const ver = await task.version({ env: { silent: true}});
  expect(ver).toEqual(pkg.version);
});