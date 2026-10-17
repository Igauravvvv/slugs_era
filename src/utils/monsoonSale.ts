import type { Product } from '@/types';

export const MONSOON_TSHIRT_PRICE = 999;
/** Sale prices apply to storefront products and restored carts, not historical orders. */
export function withMonsoonPrice(product: Product): Product {
  if (product.category !== 'tshirts') return product;
  const previousPrice = Math.max(Number(product.originalPrice) || 0, Number(product.price) || 0);
  return { ...product, price: MONSOON_TSHIRT_PRICE, originalPrice: previousPrice > MONSOON_TSHIRT_PRICE ? previousPrice : undefined, ...(product.preOrderPrice ? { preOrderPrice: MONSOON_TSHIRT_PRICE } : {}) };
}
