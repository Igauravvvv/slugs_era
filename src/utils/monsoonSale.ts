import type { Product } from '@/types';
import { TSHIRT_QUOTED_PRICE, TSHIRT_FABRIC } from '@/data/tshirtDetails';

export const MONSOON_TSHIRT_PRICE = 999;
/** Sale prices apply to storefront products and restored carts, not historical orders. */
export function withMonsoonPrice(product: Product): Product {
  if (product.category !== 'tshirts') return product;
  return { ...product, price: MONSOON_TSHIRT_PRICE, originalPrice: TSHIRT_QUOTED_PRICE, material: TSHIRT_FABRIC, ...(product.preOrderPrice ? { preOrderPrice: MONSOON_TSHIRT_PRICE } : {}) };
}
