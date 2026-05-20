/**
 * Centralized shipping cost calculation.
 * Used by Cart, Address, and Payment pages for consistency.
 *
 * Policy: Free shipping on all orders (always ₹0).
 * Update this single file if the policy ever changes.
 */

export const FREE_SHIPPING_THRESHOLD = 0; // Currently free on all orders
export const SHIPPING_COST = 0;

export function calculateShipping(_subtotal: number): number {
  // Currently: free shipping on all orders
  // To add a threshold, uncomment:
  // return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  return 0;
}
