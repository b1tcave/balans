import Big from "big.js";
export const getSum = arr =>
    arr.reduce((rowSum, value) => rowSum.plus(value), Big(0));
export const getSumOfSums = arr =>
    arr
        .reduce((total, value) => total.plus(getSum(value)), Big(0))
        .round(3)
        .toNumber();
