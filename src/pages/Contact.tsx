import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Mail, MapPin, Clock, Send, Instagram, Phone } from 'lucide-react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production, send to backend/API
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const fadeUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-40px' as const },
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  };

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="relative py-16 lg:py-24 flex items-center justify-center bg-[#F9F7F5]">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="text-center px-5"
        >
          <span className="eye-text eye-text-center mb-4">Get In Touch</span>
          <h1 className="font-display text-[clamp(32px,5vw,60px)] font-light leading-[1.1] text-[#1A1A1A] mt-4">
            We'd love to<br /><em className="italic text-[#C0132A]">hear from you</em>
          </h1>
          <p className="text-[#888880] text-[14px] lg:text-[15px] font-light leading-[1.7] mt-4 max-w-md mx-auto">
            Questions about sizing, orders, or just want to say hi? We're always here.
          </p>
        </motion.div>
      </section>

      {/* Contact Info + Form */}
      <section className="py-16 lg:py-24 px-5 lg:px-20">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16">
          {/* Left — Contact Info */}
          <div className="lg:col-span-2 space-y-8">
            <motion.div {...fadeUp}>
              <h2 className="font-display text-[26px] lg:text-[32px] font-light text-[#1A1A1A] mb-6">
                Let's <em className="italic text-[#C0132A]">connect</em>
              </h2>
            </motion.div>

            {/* WhatsApp — Primary */}
            <motion.a
              {...fadeUp}
              href="https://wa.me/917701815002"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-4 group p-5 bg-[#F9F7F5] hover:bg-[#C0132A]/5 transition-colors duration-300"
            >
              <div className="w-10 h-10 flex items-center justify-center bg-[#C0132A]/10 text-[#C0132A] shrink-0 group-hover:bg-[#C0132A] group-hover:text-white transition-colors duration-300">
                <MessageCircle size={18} />
              </div>
              <div>
                <p className="text-[14px] font-medium text-[#1A1A1A] group-hover:text-[#C0132A] transition-colors">WhatsApp (Fastest)</p>
                <p className="text-[13px] font-light text-[#888880] mt-0.5">+91 7701815002</p>
                <p className="text-[11px] text-[#888880] mt-1">Usually responds within 30 minutes</p>
              </div>
            </motion.a>

            {/* Email */}
            <motion.a
              {...fadeUp}
              href="mailto:hello@slugsera.com"
              className="flex items-start gap-4 group p-5 hover:bg-[#F9F7F5] transition-colors duration-300"
            >
              <div className="w-10 h-10 flex items-center justify-center bg-[#C0132A]/10 text-[#C0132A] shrink-0">
                <Mail size={18} />
              </div>
              <div>
                <p className="text-[14px] font-medium text-[#1A1A1A]">Email</p>
                <p className="text-[13px] font-light text-[#888880] mt-0.5">hello@slugsera.com</p>
                <p className="text-[11px] text-[#888880] mt-1">We reply within 24 hours</p>
              </div>
            </motion.a>

            {/* Instagram */}
            <motion.a
              {...fadeUp}
              href="https://www.instagram.com/slugsera/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-4 group p-5 hover:bg-[#F9F7F5] transition-colors duration-300"
            >
              <div className="w-10 h-10 flex items-center justify-center bg-[#C0132A]/10 text-[#C0132A] shrink-0">
                <Instagram size={18} />
              </div>
              <div>
                <p className="text-[14px] font-medium text-[#1A1A1A]">Instagram</p>
                <p className="text-[13px] font-light text-[#888880] mt-0.5">@slugsera</p>
                <p className="text-[11px] text-[#888880] mt-1">DMs open for style queries</p>
              </div>
            </motion.a>

            {/* Hours */}
            <motion.div {...fadeUp} className="flex items-start gap-4 p-5">
              <div className="w-10 h-10 flex items-center justify-center bg-[#C0132A]/10 text-[#C0132A] shrink-0">
                <Clock size={18} />
              </div>
              <div>
                <p className="text-[14px] font-medium text-[#1A1A1A]">Working Hours</p>
                <p className="text-[13px] font-light text-[#888880] mt-0.5">Mon–Sat: 10 AM – 8 PM IST</p>
                <p className="text-[11px] text-[#888880] mt-1">Sunday: 12 PM – 6 PM IST</p>
              </div>
            </motion.div>
          </div>

          {/* Right — Form */}
          <motion.div
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.1 }}
            className="lg:col-span-3"
          >
            <div className="bg-[#F9F7F5] p-6 lg:p-10">
              <h3 className="font-display text-[22px] lg:text-[26px] font-light text-[#1A1A1A] mb-6">
                Send us a <em className="italic text-[#C0132A]">message</em>
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                    className="input-field bg-white"
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    required
                    className="input-field bg-white"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Subject"
                  value={formData.subject}
                  onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                  required
                  className="input-field bg-white"
                />
                <textarea
                  placeholder="Your message..."
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  required
                  className="input-field bg-white resize-none"
                />
                <button type="submit" className="btn-dark w-full justify-center">
                  <Send size={14} /> Send Message
                </button>
                {submitted && (
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[#C0132A] text-[13px] text-center font-medium"
                  >
                    ✓ Message sent! We'll get back to you soon.
                  </motion.p>
                )}
              </form>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
