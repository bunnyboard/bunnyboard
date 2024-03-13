import BigNumber from 'bignumber.js';

// simple convert anything value to number
export function convertToNumber(X: number | string | BigNumber): number {
  return new BigNumber(X).toNumber();
}

// convert rate to percentage
export function convertRateToPercentage(X: number | string | BigNumber | undefined): number {
  if (X === undefined) {
    return 0;
  }

  return new BigNumber(X).multipliedBy(100).toNumber();
}

// given an amount of tokens and its price
// return the value in USD
export function calValueOf_Amount_With_Price(
  amount: number | string | BigNumber,
  price: number | string | BigNumber,
): number {
  return new BigNumber(amount).multipliedBy(new BigNumber(price)).toNumber();
}

// calculate changes percentage of given previous and current value
//
// the current, previous should in the ratio value, it should be 0.01 or '0.01' if it presents of 1%
// the value returned also in percentage (*100) value
export function calChangesOf_Current_From_Previous(
  current: number | string | BigNumber,
  previous: number | string | BigNumber,
): number {
  const X = convertToNumber(current);
  const Y = convertToNumber(previous);

  if (Y === 0) return 0;

  return ((X - Y) / Y) * 100;
}

// calculate previous value from current value and changed percentage
//
// give X is the current value and n is the percentage of X compared to Y (previous value)
// we need to find the y value
export function calPreviousOf_Current_And_Change(
  current: number | string | BigNumber,
  changePercentage: number | string | BigNumber,
): number {
  return new BigNumber(current).multipliedBy(100).dividedBy(new BigNumber(changePercentage).plus(100)).toNumber();
}

interface ItemX {
  value: number | string;
  change: number | string;
}

// we have a list of values and its change percentages
// we need to calculate the change percentage value of total values
//
// give:
// - Items list Items[0...n] where Item_n is the value and ItemC_n is the change percentage
// what is the TotalC - the change percentage of Total = sum(Item[0...n])
//
// an example of this problem:
// the market has ETH, BTC, BNB tokens with their prices are $2500, $40000, $280
// the change percentages are 1%, 5%, and -10%
// what is the change percentage of total market cap?
//
// the Xc should be in the percentage value (*100)
// the Yc return also in percentage value
export function calChangesOf_Total_From_Items(items: Array<ItemX>): number {
  let Y = 0;
  let previousY = 0;

  for (const item of items) {
    Y += new BigNumber(item.value).toNumber();

    // previousY += X / (Xc + 100)
    if (new BigNumber(item.change).gt(-100)) {
      previousY += new BigNumber(item.value)
        .dividedBy(new BigNumber(item.change).plus(100))
        .multipliedBy(100)
        .toNumber();
    }
  }

  return previousY > 0 ? ((Y - previousY) / previousY) * 100 : 0;
}

// we have 2 numbers (ItemX) with their values and changes
// now we want to calculate number of percentage in changes of their difference
//
// give:
// X is the bigger number than Y
// Xc is the change percentage of X, Yc is the change percentage of Y
// what is the change percentage of (X-Y)?
//
// an example of this problem:
// we have the total market cap (T) is 1000 and its change percentage in last 24 hours is 1%
// we have BTC market cap (T) is 800 and its change percentage in last 24 hours is 4%
// we want to know the change percentage of other coins in the last 24 hours?
export function calChangesOf_Two_Number_Diff(biggerNumber: ItemX, smallerNumber: ItemX): number {
  const previousBiggerValue = new BigNumber(biggerNumber.value)
    .multipliedBy(new BigNumber(biggerNumber.change))
    .dividedBy(100);
  const previousSmallerValue = new BigNumber(biggerNumber.value)
    .multipliedBy(new BigNumber(smallerNumber.change))
    .dividedBy(100);
  const currentDiff = new BigNumber(biggerNumber.value).minus(new BigNumber(smallerNumber.value));
  const previousDiff = new BigNumber(previousBiggerValue).minus(new BigNumber(previousSmallerValue));

  return currentDiff.minus(previousDiff).multipliedBy(100).dividedBy(previousDiff).toNumber();
}
