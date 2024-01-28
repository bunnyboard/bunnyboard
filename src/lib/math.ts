import BigNumber from 'bignumber.js';

// simple convert anything value to number
export function convertToNumber(X: number | string | BigNumber): number {
  return new BigNumber(X).toNumber();
}

// convert any value to percentage
export function convertToPercentage(X: number | string | BigNumber | undefined): number {
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

  return ((X - Y) / Y) * 100;
}

// when collect data on-chain, we only saved the amount in token unit and the token price in USD
// also, we save the 24h change percentage of amount in token unit and token price in USD only
// so, we need to calculate the change percentage of amount of token in USD
//
// give:
// - X amount of tokens
// - Xc change percentage of amount of tokens
// - P is the price in USD of token
// - Pc is the change percentage of token price in USD
// so, we got Y = X * P is the amount of token value in USD
// we need to calculate the Yc - the change percentage of Y
//
// an example of this problem:
// the current pool balance is 10 ETH at the price of $2500 per ETH token.
// pool increased 1% of its balance and the ETH price was down -5%
// what is the percentage was changed of pool balance value in USD?
//
// the Xc, Pc should in the ratio value, it should be 0.01 or '0.01' if it presents of 1%
// the Yc return also in ratio value
export function calChangesOf_Y_From_XP(
  X: number | string,
  Xc: number | string,
  P: number | string,
  Pc: number | string,
): number {
  // previousX = X / (Xc + 1)
  const previousX = new BigNumber(X).dividedBy(new BigNumber(Xc).plus(1));

  // previousP = P / (Pc + 1)
  const previousP = new BigNumber(P).dividedBy(new BigNumber(Pc).plus(1));

  // Y = X * P
  const Y = new BigNumber(X).multipliedBy(P);
  const previousY = previousX.multipliedBy(previousP);

  return Y.minus(previousY).dividedBy(previousY).toNumber();
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
// the Xc should be in the ratio value, it should be 0.01 or '0.01' if it presents of 1%
// the Yc return also in ratio value
interface ItemX {
  value: number | string;
  change: number | string;
}
export function calChangesOf_Total_From_Items(items: Array<ItemX>): number {
  let Y = 0;
  let previousY = 0;

  for (const item of items) {
    Y += new BigNumber(item.value).toNumber();

    // previousY += X / (Xc + 1)
    previousY += new BigNumber(item.value).dividedBy(new BigNumber(item.change).plus(1)).toNumber();
  }

  return ((Y - previousY) / previousY) * 100;
}
