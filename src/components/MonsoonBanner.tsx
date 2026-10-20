import { Link } from 'react-router-dom';

export default function MonsoonBanner() {
  return (
    <Link
      to="/collections/tshirts"
      aria-label="Shop all tees at ₹999 in the End of Monsoon Sale. Cash on Delivery Live — pay when it arrives."
      className="flex h-12 flex-col items-center justify-center gap-0.5 bg-[#C0132A] px-3 text-center text-[10px] font-semibold leading-tight tracking-[0.02em] text-white sm:h-8 sm:flex-row sm:gap-3 sm:text-xs"
    >
      <span>END OF MONSOON SALE · ALL TEES ₹999</span>
      <span aria-hidden="true" className="hidden sm:inline">·</span>
      <span>CASH ON DELIVERY LIVE · PAY WHEN IT ARRIVES</span>
    </Link>
  );
}
