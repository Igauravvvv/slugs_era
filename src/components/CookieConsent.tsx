import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { disableAnalytics, initAnalytics, trackPageView } from '@/lib/analytics';

export const COOKIE_CONSENT_KEY = 'slugsera_cookie_consent_v1';
type ConsentChoice = 'accepted' | 'rejected';

function readChoice(): ConsentChoice | null {
  try { const value = localStorage.getItem(COOKIE_CONSENT_KEY); return value === 'accepted' || value === 'rejected' ? value : null; } catch { return null; }
}

export default function CookieConsent() {
  const [isOpen, setIsOpen] = useState(() => readChoice() === null);
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => { if (readChoice() === 'accepted') initAnalytics(); }, []);
  useEffect(() => { if (location.hash === '#cookie-settings') setIsOpen(true); }, [location.hash]);
  const saveChoice = (choice: ConsentChoice) => {
    try { localStorage.setItem(COOKIE_CONSENT_KEY, choice); } catch { /* Storage can be unavailable. */ }
    if (choice === 'accepted') {
      initAnalytics();
      trackPageView(location.pathname, document.title);
    } else {
      disableAnalytics();
    }
    setIsOpen(false);
    if (location.hash === '#cookie-settings') navigate(location.pathname, { replace: true });
  };
  if (!isOpen) return null;
  return <section aria-labelledby="cookie-consent-title" className="fixed inset-x-3 bottom-3 z-[10000] mx-auto max-w-3xl border border-[#E8E4E0] bg-white p-5 shadow-[0_18px_60px_rgba(0,0,0,0.22)] sm:p-6">
    <div className="sm:flex sm:items-center sm:gap-7"><div className="flex-1"><h2 id="cookie-consent-title" className="font-display text-2xl font-light text-[#1A1A1A]">Your privacy, your choice</h2><p className="mt-2 text-xs font-light leading-5 text-[#666660]">Essential storage keeps the shop working. Optional analytics loads only if you accept. Read our <Link className="text-[#C0132A] underline underline-offset-2" to="/privacy-policy">Privacy Policy</Link>.</p></div>
      <div className="mt-4 flex flex-col gap-2 sm:mt-0 sm:shrink-0"><button type="button" onClick={() => saveChoice('rejected')} className="min-h-11 border border-[#1A1A1A] px-5 text-[10px] font-medium uppercase tracking-[0.14em] text-[#1A1A1A]">Reject optional</button><button type="button" onClick={() => saveChoice('accepted')} className="min-h-11 bg-[#C0132A] px-5 text-[10px] font-medium uppercase tracking-[0.14em] text-white">Accept analytics</button></div>
    </div></section>;
}
