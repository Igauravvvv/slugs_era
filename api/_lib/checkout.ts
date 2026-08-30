export const FIRST_BUYER_CODE = 'TheOneOfHundred';
export const TSHIRT_BUNDLE_CODE = '2burpy';
const FIRST_BUYER_DISCOUNT = 99;
const TWO_TSHIRT_PRICE = 1999;
const THREE_TSHIRT_PRICE = 2699;

type CheckoutConfig = { url: string; serviceKey: string };
type PriceCheckoutOptions = CheckoutConfig & {
  userId: string;
  promoCodes?: unknown;
  honorReservedPromos?: boolean;
};
type RequestedItem = { productId: string; size?: string; color?: string; quantity: number };
type PricedItem = RequestedItem & { name: string; price: number; category: string };

function httpError(message: string, statusCode: number) {
  return Object.assign(new Error(message), { statusCode });
}

export function parsePromoCodes(raw: unknown): string[] {
  const submitted = (Array.isArray(raw) ? raw : typeof raw === 'string' ? raw.split(',') : [])
    .filter((value): value is string => typeof value === 'string')
    .map((value) => value.trim())
    .filter(Boolean);
  const codes = new Set<string>();
  for (const code of submitted) {
    if (code.toLowerCase() === TSHIRT_BUNDLE_CODE.toLowerCase()) codes.add(TSHIRT_BUNDLE_CODE);
    else if (code.toLowerCase() === FIRST_BUYER_CODE.toLowerCase()) codes.add(FIRST_BUYER_CODE);
    else throw httpError('This offer code is not valid.', 400);
  }
  return [TSHIRT_BUNDLE_CODE, FIRST_BUYER_CODE].filter((code) => codes.has(code));
}

function calculateTshirtBundle(unitPrices: number[]) {
  const prices = [...unitPrices].sort((a, b) => b - a);
  const best = Array.from({ length: prices.length + 1 }, () => Number.POSITIVE_INFINITY);
  best[0] = 0;
  for (let index = 1; index <= prices.length; index += 1) {
    best[index] = best[index - 1] + prices[index - 1];
    if (index >= 2) best[index] = Math.min(best[index], best[index - 2] + TWO_TSHIRT_PRICE);
    if (index >= 3) best[index] = Math.min(best[index], best[index - 3] + THREE_TSHIRT_PRICE);
  }
  return best[prices.length];
}

async function assertFirstBuyerEligible({ url, serviceKey }: CheckoutConfig, userId: string) {
  const headers = { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` };
  const paidOrdersUrl = new URL(`${url}/rest/v1/orders`);
  paidOrdersUrl.searchParams.set('select', 'id');
  paidOrdersUrl.searchParams.set('payment_id', 'not.is.null');
  paidOrdersUrl.searchParams.set('limit', '100');
  const customerOrdersUrl = new URL(`${url}/rest/v1/orders`);
  customerOrdersUrl.searchParams.set('select', 'id');
  customerOrdersUrl.searchParams.set('payment_id', 'not.is.null');
  customerOrdersUrl.searchParams.set('user_id', `eq.${userId}`);
  customerOrdersUrl.searchParams.set('limit', '1');
  const [paidResponse, customerResponse] = await Promise.all([
    fetch(paidOrdersUrl, { headers }),
    fetch(customerOrdersUrl, { headers }),
  ]);
  if (!paidResponse.ok || !customerResponse.ok) throw httpError('Could not validate the first-buyer offer.', 503);
  const [paidOrders, customerOrders] = await Promise.all([
    paidResponse.json() as Promise<unknown[]>,
    customerResponse.json() as Promise<unknown[]>,
  ]);
  if (paidOrders.length >= 100 || customerOrders.length > 0) {
    throw httpError('TheOneOfHundred is only available to the first 100 new buyers.', 409);
  }
}

export async function priceCheckout(raw: unknown, options: PriceCheckoutOptions) {
  if (!Array.isArray(raw) || raw.length < 1 || raw.length > 50) {
    throw httpError('Your cart must contain between 1 and 50 items.', 400);
  }
  const requested: RequestedItem[] = raw.map((item: any) => ({
    productId: typeof item?.productId === 'string' ? item.productId : '',
    size: typeof item?.size === 'string' ? item.size.slice(0, 30) : undefined,
    color: typeof item?.color === 'string' ? item.color.slice(0, 50) : undefined,
    quantity: Number(item?.quantity),
  }));
  if (requested.some((item) => !/^[a-zA-Z0-9_-]{1,100}$/.test(item.productId)
    || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 10)) {
    throw httpError('Your cart contains an invalid product or quantity.', 400);
  }
  const ids = [...new Set(requested.map((item) => item.productId))];
  const productsUrl = new URL(`${options.url}/rest/v1/products`);
  productsUrl.searchParams.set('select', 'id,name,price,category,is_published,stock_quantity');
  productsUrl.searchParams.set('id', `in.(${ids.join(',')})`);
  const response = await fetch(productsUrl, {
    headers: { apikey: options.serviceKey, Authorization: `Bearer ${options.serviceKey}` },
  });
  if (!response.ok) throw httpError('Could not validate your cart.', 503);
  const products = await response.json() as any[];
  if (products.length !== ids.length) throw httpError('One or more products are no longer available.', 409);
  const byId = new Map(products.map((product) => [product.id, product]));
  const quantities = new Map<string, number>();
  requested.forEach((item) => quantities.set(item.productId, (quantities.get(item.productId) || 0) + item.quantity));
  const items: PricedItem[] = requested.map((item) => {
    const product = byId.get(item.productId);
    const price = Number(product?.price);
    if (!product || !Number.isFinite(price) || price < 0) throw httpError('A product has an invalid price.', 409);
    if (product.is_published === false || (typeof product.stock_quantity === 'number'
      && product.stock_quantity < (quantities.get(item.productId) || 0))) {
      throw httpError(`${product.name} is unavailable in that quantity.`, 409);
    }
    return { ...item, name: product.name, price, category: String(product.category || '') };
  });
  const promoCodes = parsePromoCodes(options.promoCodes);
  const retailSubtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tshirtPrices = items.flatMap((item) => item.category === 'tshirts'
    ? Array.from({ length: item.quantity }, () => item.price)
    : []);
  const tshirtRetail = tshirtPrices.reduce((sum, price) => sum + price, 0);
  const bundledTshirtTotal = promoCodes.includes(TSHIRT_BUNDLE_CODE)
    ? calculateTshirtBundle(tshirtPrices)
    : tshirtRetail;
  const launchDiscount = Math.max(0, tshirtRetail - bundledTshirtTotal);
  const afterBundle = retailSubtotal - launchDiscount;
  if (promoCodes.includes(FIRST_BUYER_CODE) && !options.honorReservedPromos) {
    await assertFirstBuyerEligible(options, options.userId);
  }
  const welcomeDiscount = promoCodes.includes(FIRST_BUYER_CODE)
    ? Math.min(FIRST_BUYER_DISCOUNT, afterBundle)
    : 0;
  const subtotal = Math.max(0, afterBundle - welcomeDiscount);
  return {
    items,
    retailSubtotal,
    launchDiscount,
    welcomeDiscount,
    subtotal,
    shippingFee: 0,
    total: subtotal,
    promoCodes,
  };
}
