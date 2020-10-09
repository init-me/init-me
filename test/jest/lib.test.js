const { parseExpectedArgs } = require("commander");
const { TestScheduler } = require("jest");
const {seedFull2Short, seedShort2Full } = require('../../lib/formatter')
test('lib test', () => {
  expect(seedFull2Short('@yy/init-me-seed-yyl-other')).toEqual('@yy/yyl-other')
  expect(seedFull2Short('init-me-seed-yyl-other')).toEqual('yyl-other')
  expect(seedShort2Full('@yy/yyl-other')).toEqual('@yy/init-me-seed-yyl-other')
  expect(seedShort2Full('yyl-other')).toEqual('init-me-seed-yyl-other')
})