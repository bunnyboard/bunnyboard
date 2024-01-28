import { expect, test } from 'vitest';

import { groupAndSumObjectList } from './helper';

const snapshots: Array<any> = [
  {
    timestamp: 1672531200,
    totalBalanceUsd: 100,
  },
  {
    timestamp: 1672531200,
    totalBalanceUsd: 200,
  },
  {
    timestamp: 1672531200,
    totalBalanceUsd: 50,
  },
  {
    timestamp: 1672531200,
    totalBalanceUsd: 50,
  },
  {
    timestamp: 1672617600,
    totalBalanceUsd: 100,
  },
];

test('group snapshots list', function () {
  const items = groupAndSumObjectList(snapshots, 'timestamp');

  expect(items.length).equal(2);
  expect(items[0].timestamp).equal(1672531200);
  expect(items[0].totalBalanceUsd).equal(400);
  expect(items[1].timestamp).equal(1672617600);
  expect(items[1].totalBalanceUsd).equal(100);

  // should ignore undefined field
  expect(items[0].totalDeposited).equal(undefined);
});
