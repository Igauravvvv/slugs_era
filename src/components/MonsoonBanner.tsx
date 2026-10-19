import { Link } from 'react-router-dom';

const messages = [
  'END OF MONSOON SALE · ALL TEES ₹999',
  'CASH ON DELIVERY LIVE · PAY WHEN IT ARRIVES',
];

export default function MonsoonBanner() {
  return (
    <Link
      to="/collections/tshirts"
      aria-label="Shop all tees at ₹999 in the End of Monsoon Sale. Cash on Delivery Live — pay when it arrives."
      className="monsoon-banner relative flex h-12 items-center overflow-hidden bg-[#C0132A] text-[10px] font-semibold tracking-[0.02em] text-white sm:h-8 sm:text-xs"
    >
      <div className="monsoon-banner-track flex w-max" aria-hidden="true">
        {[0, 1].map(copy => (
          <div key={copy} className="flex min-w-[100vw] shrink-0 items-center justify-around">
            {[...messages, ...messages].map((message, index) => (
              <span key={index} className="flex shrink-0 items-center whitespace-nowrap">
                <span className="px-8 sm:px-12">{message}</span>
                <span aria-hidden="true">✦</span>
              </span>
            ))}
          </div>
        ))}
      </div>
      <span className="monsoon-banner-static w-full px-3 text-center" aria-hidden="true">
        END OF MONSOON SALE · ALL TEES ₹999 · CASH ON DELIVERY LIVE
      </span>
    </Link>
  );
}
