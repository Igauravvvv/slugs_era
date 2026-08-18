interface ProductPriceProps {
  price: number;
  compareAtPrice?: number | null;
  quantity?: number;
  className?: string;
  priceClassName?: string;
  compareClassName?: string;
}

const formatPrice = (amount: number) => `₹${Math.round(amount).toLocaleString('en-IN')}`;

/** Consistent storefront price treatment for cards, product details, and checkout. */
export default function ProductPrice({
  price,
  compareAtPrice,
  quantity = 1,
  className = '',
  priceClassName = 'text-lg font-medium text-[#1A1A1A]',
  compareClassName = 'text-base text-[#888880] line-through',
}: ProductPriceProps) {
  const currentTotal = price * quantity;
  const originalTotal = compareAtPrice && compareAtPrice > price
    ? compareAtPrice * quantity
    : null;

  return (
    <div className={`flex items-baseline gap-3 ${className}`.trim()}>
      <span className={priceClassName}>{formatPrice(currentTotal)}</span>
      {originalTotal && <span className={compareClassName}>{formatPrice(originalTotal)}</span>}
    </div>
  );
}
