const task = require('../task/index');
const env = { silent: true };

const SEED_NAME = 'init-me-seed-rollup';

jest.setTimeout(30000);

test('task.reset({ env })', async () => {
  await task.reset({ env });
  const seedMap = await task.list({ env });
  expect(seedMap).toEqual({});
});

test('task.install([pkg], { env })', async () => {
  await task.install([SEED_NAME], { env });
  const seedMap = await task.list({ env });

  expect(seedMap[SEED_NAME]).not.toEqual(undefined);
});

test('task.uninstall([pkg], { env })', async () => {
  await task.uninstall([SEED_NAME], { env });
  const seedMap = await task.list({ env });
  expect(seedMap).toEqual({});
  await task.reset({ env });
});