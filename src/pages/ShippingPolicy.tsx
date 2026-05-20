import { motion } from 'framer-motion';
import { Truck, Clock, MapPin, Package, AlertCircle, MessageCircle } from 'lucide-react';

const shippingInfo = [
  {
    icon: Truck,
    title: 'Free Shipping',
    description: 'All orders ship free across India. No minimum order value required.',
  },
  {
    icon: Clock,
    title: '3–5 Business Days',
    description: 'Standard delivery across India. Metro cities usually receive in 2–3 days.',
  },
  {
    icon: MapPin,
    title: 'Pan-India Coverage',
    description: 'We deliver to all serviceable pincodes across India via trusted courier partners.',
  },
  {
    icon: Package,
    title: 'Order Tracking',
    description: 'Get real-time tracking updates via WhatsApp and email as soon as your order ships.',
  },
];

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
};

export default function ShippingPolicy() {
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
          <span className="eye-text eye-text-center mb-4">Policies</span>
          <h1 className="font-display text-[clamp(32px,5vw,60px)] font-light leading-[1.1] text-[#1A1A1A] mt-4">
            Shipping <em className="italic text-[#C0132A]">Policy</em>
          </h1>
          <p className="text-[#888880] text-[14px] font-light mt-4 max-w-md mx-auto">
            Free shipping. Fast delivery. Full transparency.
          </p>
        </motion.div>
      </section>

      {/* Highlights */}
      <section className="py-14 lg:py-20 px-5 lg:px-20">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {shippingInfo.map((info, i) => (
            <motion.div
              key={info.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="text-center p-6"
            >
              <div className="w-12 h-12 flex items-center justify-center bg-[#C0132A]/5 text-[#C0132A] mx-auto mb-4">
                <info.icon size={22} strokeWidth={1.5} />
              </div>
              <h3 className="font-display text-[18px] font-light text-[#1A1A1A] mb-1.5">{info.title}</h3>
              <p className="text-[12px] font-light text-[#888880] leading-[1.7]">{info.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Detailed Policy */}
      <section className="py-14 lg:py-20 px-5 lg:px-20 bg-[#F9F7F5]">
        <div className="max-w-3xl mx-auto space-y-10">
          <motion.div {...fadeUp}>
            <h2 className="font-display text-[22px] lg:text-[28px] font-light text-[#1A1A1A] mb-4">Processing Time</h2>
            <div className="text-[14px] font-light text-[#888880] leading-[1.8] space-y-3">
              <p>Orders are processed and dispatched within <strong className="text-[#1A1A1A]">1–2 business days</strong> of order confirmation.</p>
              <p>Orders placed after 5 PM IST or on weekends/holidays will be processed the next business day.</p>
              <p>Pre-order items have specific shipping dates mentioned on the product page and will ship as scheduled.</p>
            </div>
          </motion.div>

          <motion.div {...fadeUp}>
            <h2 className="font-display text-[22px] lg:text-[28px] font-light text-[#1A1A1A] mb-4">Delivery Timeline</h2>
            <div className="text-[14px] font-light text-[#888880] leading-[1.8] space-y-3">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-[13px]">
                  <thead>
                    <tr className="border-b border-[#E8E4E0]">
                      <th className="text-left py-3 pr-4 font-medium text-[#1A1A1A] text-[11px] tracking-[0.1em] uppercase">Region</th>
                      <th className="text-left py-3 font-medium text-[#1A1A1A] text-[11px] tracking-[0.1em] uppercase">Estimated Delivery</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['Metro Cities (Delhi, Mumbai, Bangalore, etc.)', '2–3 business days'],
                      ['Tier 2 Cities (Jaipur, Lucknow, Pune, etc.)', '3–4 business days'],
                      ['Other Locations', '4–6 business days'],
                      ['Remote/Northeast Regions', '5–7 business days'],
                    ].map(([region, time]) => (
                      <tr key={region} className="border-b border-[#E8E4E0]/50">
                        <td className="py-3 pr-4 text-[#888880]">{region}</td>
                        <td className="py-3 text-[#1A1A1A] font-medium">{time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-[12px] flex items-start gap-2 mt-3">
                <AlertCircle size={14} className="text-[#C0132A] shrink-0 mt-0.5" />
                Delivery timelines may vary during sales events, festivals, or circumstances beyond our control.
              </p>
            </div>
          </motion.div>

          <motion.div {...fadeUp}>
            <h2 className="font-display text-[22px] lg:text-[28px] font-light text-[#1A1A1A] mb-4">Order Tracking</h2>
            <div className="text-[14px] font-light text-[#888880] leading-[1.8] space-y-3">
              <p>Once your order ships, you'll receive a tracking link via <strong className="text-[#1A1A1A]">WhatsApp and email</strong>.</p>
              <p>You can track your order in real-time by clicking the tracking link or contacting us on WhatsApp with your order ID.</p>
            </div>
          </motion.div>

          <motion.div {...fadeUp}>
            <h2 className="font-display text-[22px] lg:text-[28px] font-light text-[#1A1A1A] mb-4">Shipping Partners</h2>
            <div className="text-[14px] font-light text-[#888880] leading-[1.8] space-y-3">
              <p>We ship via trusted courier partners including Delhivery, Shiprocket, and BlueDart to ensure safe and timely delivery.</p>
              <p>All orders are carefully packed in branded, eco-friendly packaging to ensure your product arrives in perfect condition.</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-12 lg:py-16 px-5 lg:px-20">
        <motion.div {...fadeUp} className="max-w-2xl mx-auto text-center">
          <MessageCircle size={28} className="mx-auto text-[#C0132A] mb-4" />
          <h3 className="font-display text-[24px] lg:text-[28px] font-light text-[#1A1A1A] mb-2">Need help with shipping?</h3>
          <p className="text-[13px] font-light text-[#888880] mb-6">
            Reach out on WhatsApp for the fastest response about your delivery.
          </p>
          <a
            href="https://wa.me/917701815002"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-dark inline-flex"
          >
            <MessageCircle size={14} /> Chat on WhatsApp
          </a>
        </motion.div>
      </section>
    </div>
  );
}
