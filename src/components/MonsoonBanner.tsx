import { Link } from 'react-router-dom';
export default function MonsoonBanner() {
  return <Link to="/collections/tshirts" className="flex flex-wrap items-center justify-center gap-x-3 gap-y-0.5 bg-[#C0132A] px-3 py-2 text-center text-[11px] font-semibold text-white sm:text-xs">
    <span>END OF MONSOON SALE · ALL TEES ₹999</span><span className="whitespace-nowrap">COD IS LIVE ↗</span>
  </Link>;
}
