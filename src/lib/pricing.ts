import type { CartItem, Product } from '@/types';

export function getCompareAtPrice(product: Product): number | undefined {
  return product.originalPrice && product.originalPrice > product.price
    ? product.originalPrice
    : undefined;
}

export function getCartCompareAtTotal(cart: CartItem[]): number {
  return cart.reduce(
    (total, item) => total + (getCompareAtPrice(item.product) ?? item.product.price) * item.quantity,
    0,
  );
}
