import type { CartItem } from '@/types';

export const LAUNCH_SALE = {
  twoPackPrice: 1999,
  threePackPrice: 2699,
} as const;

export const FIRST_BUYER_CODE = 'TheOneOfHundred';
export const FIRST_BUYER_DISCOUNT = 99;
export const TSHIRT_BUNDLE_CODE = '2burpy';

export type LaunchSalePricing = {
  retailSubtotal: number;
  saleSubtotal: number;
  discount: number;
  eligibleTshirtCount: number;
  twoPacks: number;
  threePacks: number;
};

export const isFirstBuyerCode = (code?: string | null) =>
  code?.trim().toLowerCase() === FIRST_BUYER_CODE.toLowerCase();

export const isTshirtBundleCode = (code?: string | null) =>
  code?.trim().toLowerCase() === TSHIRT_BUNDLE_CODE.toLowerCase();

export const isTshirtProduct = (item: CartItem['product']) => item.category === 'tshirts';

export function calculateLaunchSaleFromUnits(
  retailSubtotal: number,
  tshirtUnitPrices: number[],
  enabled = true,
): LaunchSalePricing {
  const prices = [...tshirtUnitPrices].sort((a, b) => b - a);
  const count = prices.length;

  if (!enabled || count < 2) {
    return {
      retailSubtotal,
      saleSubtotal: retailSubtotal,
      discount: 0,
      eligibleTshirtCount: count,
      twoPacks: 0,
      threePacks: 0,
    };
  }

  const best = Array.from({ length: count + 1 }, () => Number.POSITIVE_INFINITY);
  const packs = Array.from({ length: count + 1 }, () => ({ twoPacks: 0, threePacks: 0 }));
  best[0] = 0;

  for (let index = 1; index <= count; index += 1) {
    best[index] = best[index - 1] + prices[index - 1];
    packs[index] = { ...packs[index - 1] };

    if (index >= 2 && best[index - 2] + LAUNCH_SALE.twoPackPrice < best[index]) {
      best[index] = best[index - 2] + LAUNCH_SALE.twoPackPrice;
      packs[index] = { ...packs[index - 2], twoPacks: packs[index - 2].twoPacks + 1 };
    }

    if (index >= 3 && best[index - 3] + LAUNCH_SALE.threePackPrice < best[index]) {
      best[index] = best[index - 3] + LAUNCH_SALE.threePackPrice;
      packs[index] = { ...packs[index - 3], threePacks: packs[index - 3].threePacks + 1 };
    }
  }

  const tshirtRetail = prices.reduce((sum, price) => sum + price, 0);
  const nonTshirtRetail = retailSubtotal - tshirtRetail;
  const saleSubtotal = Math.max(0, nonTshirtRetail + best[count]);

  return {
    retailSubtotal,
    saleSubtotal,
    discount: Math.max(0, retailSubtotal - saleSubtotal),
    eligibleTshirtCount: count,
    ...packs[count],
  };
}

export function calculateLaunchSale(cart: CartItem[], enabled = true): LaunchSalePricing {
  const retailSubtotal = cart.reduce(
    (total, item) => total + Number(item.product.price) * item.quantity,
    0,
  );
  const tshirtUnitPrices = cart.flatMap((item) =>
    isTshirtProduct(item.product)
      ? Array.from({ length: item.quantity }, () => Number(item.product.price))
      : [],
  );

  return calculateLaunchSaleFromUnits(retailSubtotal, tshirtUnitPrices, enabled);
}

export function getBundleProgressMessage(tshirtCount: number) {
  if (tshirtCount <= 0) return 'Add 2 tees for ₹1,999 or 3 tees for ₹2,699.';
  if (tshirtCount === 1) return 'Add one more tee and get both for ₹1,999.';
  if (tshirtCount === 2) return 'Your 2-tee launch price is ready.';
  return 'Your launch bundle price is ready.';
}
