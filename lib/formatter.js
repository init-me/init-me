const YY_SEED_FULL_PREFIX = '@yy/init-me-seed-';
const SEED_FULL_PREFIX = 'init-me-seed-';
const YY_SEED_SHORT_PREFIX = '@yy/';

const REG = {
  YY_SEED_FULL_PREFIX: new RegExp(`^${YY_SEED_FULL_PREFIX}`),
  YY_SEED_SHORT_PREFIX: new RegExp(`^${YY_SEED_SHORT_PREFIX}`),
  SEED_FULL_PREFIX: new RegExp(`^${SEED_FULL_PREFIX}`)
};


function seedFull2Short (name) {
  return name
    .replace(REG.YY_SEED_FULL_PREFIX, YY_SEED_SHORT_PREFIX)
    .replace(REG.SEED_FULL_PREFIX, '');
}

function seedShort2Full (name) {
  if (
    name.match(REG.YY_SEED_FULL_PREFIX) ||
    name.match(REG.YY_SEED_FULL_PREFIX)
  ) {
    return name;
  } else {
    if (name.match(REG.YY_SEED_PREFIX)) {
      return `${YY_SEED_FULL_PREFIX}${name.replace(REG.YY_SEED_SHORT_PREFIX, '')}`;
    } else {
      return `${SEED_FULL_PREFIX}${name}`;
    }
  }
}

module.exports = {
  seedFull2Short,
  seedShort2Full
};
