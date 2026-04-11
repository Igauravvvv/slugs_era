import { useState } from 'react';
import { motion } from 'framer-motion';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/api/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setIsSubmitted(true);
        setEmail('');
        setTimeout(() => {
          setIsSubmitted(false);
        }, 5000);
      } else {
        console.error('Failed to subscribe');
        // You can handle error feedback visually here if you'd like
      }
    } catch (error) {
      console.error('Error:', error);
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
        <div className="eye-text eye-text-center mb-3">Stay in the Loop</div>

        <div className="relative mx-auto w-fit mb-3">
          <h2 className="font-display text-[clamp(22px,4vw,50px)] font-light leading-[1.22] text-center">
            THE <em className="italic text-[#C0132A]">Slow</em> CLUB ,<br />
            Be a part of the community
          </h2>
          {/* Animated Video Logo */}
          <div className="absolute top-1/2 -translate-y-1/2 right-0 translate-x-[70%] w-[130px] sm:w-[155px] md:w-[240px] overflow-hidden pointer-events-none hidden sm:flex items-center mt-6 md:mt-12 mix-blend-multiply">
            <video
              src="/images/logo's animated.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="w-[180px] sm:w-[200px] md:w-[320px] max-w-none h-auto object-left object-contain"
            />
          </div>
        </div>
        <em className="italic text-[#C0132A] text-sm font-light text-[#888880]" >Early access to</em>
        <p className="text-sm font-light text-[#888880] mb-11">
          New drops, behind-the-scenes, and the occasional essay on intentional living.
        </p>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row max-w-[456px] mx-auto border border-[#E8E4E0] bg-white"
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email address"
            className="flex-1 border-none px-5 py-4 text-sm font-light text-[#1A1A1A] bg-transparent outline-none placeholder:text-[#888880]"
            required
          />
          <button
            type="submit"
            className="bg-[#C0132A] text-white border-none text-[10px] font-medium tracking-[0.16em] uppercase px-6 py-4 cursor-pointer whitespace-nowrap transition-colors duration-300 hover:bg-[#8B0000] disabled:opacity-75 disabled:cursor-not-allowed"
            disabled={isLoading || isSubmitted}
          >
            {isLoading ? 'Subscribing...' : isSubmitted ? 'Subscribed!' : 'Subscribe'}
          </button>
        </form>
      </motion.div>
    </section>
  );
}
