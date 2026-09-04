import { useState } from 'react';
import { motion } from 'framer-motion';
import { CDN } from '@/lib/cdn';
import { useSiteSection } from '@/context/SiteContentContext';
import { trackSignUp } from '@/lib/analytics';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const { section } = useSiteSection('newsletter');

  const eyebrow = section?.subtitle || 'Stay in the Loop';
  const heading = section?.title || 'THE <em class="italic text-[#C0132A]">Slow</em> CLUB ,<br />Be a part of the community';
  const bodyText = section?.body_text || 'New drops, behind-the-scenes, and the occasional essay on intentional living.';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || isLoading) return;

    setIsLoading(true);
    setFeedback(null);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:3000');
      const response = await fetch(`${apiUrl}/api/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        trackSignUp('newsletter');
        setIsSubmitted(true);
        setEmail('');
        setFeedback({ type: 'success', message: data.message || 'Welcome to The Slow Club!' });
        setTimeout(() => {
          setIsSubmitted(false);
          setFeedback(null);
        }, 6000);
      } else {
        setFeedback({ type: 'error', message: data.message || 'Something went wrong. Please try again.' });
        setTimeout(() => setFeedback(null), 5000);
      }
    } catch {
      setFeedback({ type: 'error', message: 'Network error. Please check your connection.' });
      setTimeout(() => setFeedback(null), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="py-14 lg:py-24 px-5 lg:px-20 bg-white text-center">
      <motion.div
        initial={{ opacity: 0, y: 36 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      >
      <div className="eye-text eye-text-center mb-3">{eyebrow}</div>

      <div className="relative mx-auto w-fit mb-3">
        <h2
          className="font-display text-[clamp(22px,4vw,50px)] font-light leading-[1.22] text-center"
          dangerouslySetInnerHTML={{ __html: heading }}
        />
          {/* Animated Video Logo */}
          <div className="absolute top-1/2 -translate-y-1/2 right-0 translate-x-[70%] w-[130px] sm:w-[155px] md:w-[240px] overflow-hidden pointer-events-none hidden sm:flex items-center mt-6 md:mt-12 mix-blend-multiply">
            <video
              src={CDN.LOGO_ANIMATED}
              autoPlay
              loop
              muted
              playsInline
              preload="none"
              className="w-[180px] sm:w-[200px] md:w-[320px] max-w-none h-auto object-left object-contain"
            />
          </div>
        </div>
        <em className="italic text-[#C0132A] text-sm font-light text-[#888880]" >Early access to</em>
      <p className="text-sm font-light text-[#888880] mb-6">
        {bodyText}
      </p>

        {/* Feedback message */}
        {feedback && (
          <motion.div
            id="newsletter-feedback"
            role="status"
            aria-live="polite"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={`text-sm font-medium mb-4 px-4 py-2.5 rounded-md inline-block ${
              feedback.type === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {feedback.type === 'success' ? '✓ ' : '⚠ '}
            {feedback.message}
          </motion.div>
        )}

        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row max-w-[456px] mx-auto border border-[#E8E4E0] bg-white mt-2"
        >
          <label htmlFor="newsletter-email" className="sr-only">Email address</label>
          <input
            id="newsletter-email"
            name="email"
            autoComplete="email"
            aria-describedby={feedback ? 'newsletter-feedback' : undefined}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email address"
            className="flex-1 border-none px-5 py-4 text-sm font-light text-[#1A1A1A] bg-transparent outline-none placeholder:text-[#888880]"
            required
            disabled={isSubmitted}
            maxLength={254}
          />
          <button
            type="submit"
            className="bg-[#C0132A] text-white border-none text-[10px] font-medium tracking-[0.16em] uppercase px-6 py-4 cursor-pointer whitespace-nowrap transition-colors duration-300 hover:bg-[#8B0000] disabled:opacity-75 disabled:cursor-not-allowed"
            disabled={isLoading || isSubmitted}
          >
            {isLoading ? 'Subscribing...' : isSubmitted ? '✓ Subscribed!' : 'Subscribe'}
          </button>
        </form>
      </motion.div>
    </section>
  );
}
