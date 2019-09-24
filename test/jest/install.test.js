const task = require('../../task/index');
const env = { silent: true };

const SEED_NAME = 'init-me-seed-helloworld';

jest.setTimeout(30000);

test('task.install([pkg], { env })', async () => {
  await task.reset({ env });
  await task.install([SEED_NAME], { env });
  const seedMap = await task.list({ env });

  expect(seedMap[SEED_NAME]).not.toEqual(undefined);
});