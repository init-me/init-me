const task = require('../../task/index');
const env = { silent: true, yy: true };

const SEED_NAME = 'init-me-seed-helloworld';

jest.setTimeout(30000);

test('task.recommend({ env })', async () => {
  await task.reset({ env });
  const pkgNames = await task.recommend({ env });
  const yyPkgNames = pkgNames.filter((name) => {
    return /^@yy/.test(name);
  });
  const normalPkgNames = pkgNames.filter((name) => {
    return !/^@yy/.test(name);
  });
  expect(yyPkgNames.length).not.toEqual(0);
  expect(normalPkgNames.length).not.toEqual(0);

  await task.install([SEED_NAME], { env });

  const nNames = await task.recommend({ env });
  expect(pkgNames.length > nNames.length).toEqual(true);
});