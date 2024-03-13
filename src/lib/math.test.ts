import { describe, expect, test } from 'vitest';

import {
  calChangesOf_Current_From_Previous,
  calChangesOf_Two_Number_Diff,
  calPreviousOf_Current_And_Change,
} from './math';

describe('lib:math:calChangesOf_Current_From_Previous', function () {
  test('calculate change percentage value correctly, x = 100, y = 90, change = 11%', function () {
    const X = 100;
    const Y = 90;
    const change = 11; // 11%

    expect(calChangesOf_Current_From_Previous(X, Y).toFixed(0)).equal(change.toString());
  });
});

describe('lib:math:calPreviousOf_Current_And_Change', function () {
  test('calculate previous value correctly, x = 100, y = 90, change = 11.1111%', function () {
    const X = 100;
    const change = 11.1111; // 10%
    const Y = 90;

    expect(calPreviousOf_Current_And_Change(X, change).toFixed(0)).equal(Y.toString());
  });
  test('calculate previous value correctly, x = 100, y = 120, change = -16.7%', function () {
    const X = 100;
    const Y = 120;
    const change = -16.7; // 16%

    expect(calPreviousOf_Current_And_Change(X, change).toFixed(0)).equal(Y.toString());
  });
  test('calculate previous value correctly, x = 100, y = 100, change = 0%', function () {
    const X = 100;
    const Y = 100;
    const change = 0; // 0%

    expect(calPreviousOf_Current_And_Change(X, change).toFixed(0)).equal(Y.toString());
  });
  test('calculate previous value correctly, x = 100, y = 100, change = 0%', function () {
    const X = 735013.0803093826;
    const Xc = 12.725503641801843;
    const Y = 677205.938459583;
    const Yc = 17.407911858130735;

    expect(
      calChangesOf_Two_Number_Diff(
        {
          value: X,
          change: Xc,
        },
        {
          value: Y,
          change: Yc,
        },
      ),
    ).equal(23.17010995037431);
  });
});
