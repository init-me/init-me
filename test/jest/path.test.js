const task = require('../../task/index');
const path = require('path');

test('task.path', async () => {
  const iPath = await task.path({
    env: {
      silent: true
    }
  });
  expect(iPath).toEqual(path.join(__dirname, '../../'));
});