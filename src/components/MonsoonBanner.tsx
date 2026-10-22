import { Link } from 'react-router-dom';

export default function MonsoonBanner() {
  return (
    <Link
      to="/collections/tshirts"
      aria-label="Shop all tees at ₹999 in the End of Monsoon Sale. Cash on Delivery Live — pay when it arrives."
      className="flex h-8 flex-row items-center justify-center gap-2 whitespace-nowrap bg-[#C0132A] px-2 text-center text-[9px] font-semibold leading-tight tracking-[0.02em] text-white sm:gap-3 sm:px-3 sm:text-xs"
    >
      <span>END OF MONSOON SALE<span className="hidden sm:inline"> · ALL TEES ₹999</span></span>
      <span aria-hidden="true">·</span>
      <span>CASH ON DELIVERY LIVE<span className="hidden sm:inline"> · PAY WHEN IT ARRIVES</span></span>
    </Link>
  );
}
