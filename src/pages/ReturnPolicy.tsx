import { motion } from 'framer-motion';
import { RotateCcw, Shield, AlertCircle, CheckCircle, XCircle, MessageCircle, Clock } from 'lucide-react';

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
};

export default function ReturnPolicy() {
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
            Return & Exchange<br /><em className="italic text-[#C0132A]">Policy</em>
          </h1>
          <p className="text-[#888880] text-[14px] font-light mt-4 max-w-md mx-auto">
            Hassle-free exchanges. We've got you covered.
          </p>
        </motion.div>
      </section>

      {/* Quick Summary Cards */}
      <section className="py-14 lg:py-20 px-5 lg:px-20">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { icon: Clock, title: '7-Day Window', desc: 'Request an exchange within 7 days of delivery' },
            { icon: RotateCcw, title: 'Easy Exchanges', desc: 'Swap for a different size or colour — no hassle' },
            { icon: Shield, title: 'Quality Guarantee', desc: 'Defective products get a full refund or replacement' },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="text-center p-7 bg-[#F9F7F5]"
            >
              <div className="w-12 h-12 flex items-center justify-center bg-[#C0132A]/5 text-[#C0132A] mx-auto mb-4">
                <item.icon size={22} strokeWidth={1.5} />
              </div>
              <h3 className="font-display text-[18px] font-light text-[#1A1A1A] mb-1.5">{item.title}</h3>
              <p className="text-[12px] font-light text-[#888880] leading-[1.7]">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Detailed Policy */}
      <section className="py-14 lg:py-20 px-5 lg:px-20 bg-[#F9F7F5]">
        <div className="max-w-3xl mx-auto space-y-10">
          <motion.div {...fadeUp}>
            <h2 className="font-display text-[22px] lg:text-[28px] font-light text-[#1A1A1A] mb-4">Exchange Policy</h2>
            <div className="text-[14px] font-light text-[#888880] leading-[1.8] space-y-3">
              <p>We offer <strong className="text-[#1A1A1A]">exchanges within 7 days</strong> of delivery for the following reasons:</p>
              <div className="space-y-2 pl-1">
                {[
                  'Wrong size — need a different fit',
                  'Colour mismatch — want a different shade',
                  'Defective product — manufacturing fault or damage',
                ].map((reason) => (
                  <div key={reason} className="flex items-center gap-3">
                    <CheckCircle size={14} className="text-[#C0132A] shrink-0" />
                    <span>{reason}</span>
                  </div>
                ))}
              </div>
              <p className="mt-2">
                To initiate an exchange, simply WhatsApp us at <strong className="text-[#1A1A1A]">+91 7701815002</strong> with:
              </p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>Your order ID</li>
                <li>Reason for exchange</li>
                <li>Photo of the product (if defective)</li>
              </ul>
            </div>
          </motion.div>

          <motion.div {...fadeUp}>
            <h2 className="font-display text-[22px] lg:text-[28px] font-light text-[#1A1A1A] mb-4">Refund Policy</h2>
            <div className="text-[14px] font-light text-[#888880] leading-[1.8] space-y-3">
              <p>We currently offer <strong className="text-[#1A1A1A]">exchanges only</strong> — not refunds — unless the product falls under one of these cases:</p>
              <div className="space-y-2 pl-1">
                {[
                  'Product is defective or has a manufacturing fault',
                  'Wrong product was shipped',
                  'Product was damaged during transit',
                ].map((reason) => (
                  <div key={reason} className="flex items-center gap-3">
                    <CheckCircle size={14} className="text-emerald-500 shrink-0" />
                    <span>{reason}</span>
                  </div>
                ))}
              </div>
              <p>In these cases, we'll offer a <strong className="text-[#1A1A1A]">full refund or free replacement</strong> — your choice. Refunds are processed within 5–7 business days to the original payment method.</p>
            </div>
          </motion.div>

          <motion.div {...fadeUp}>
            <h2 className="font-display text-[22px] lg:text-[28px] font-light text-[#1A1A1A] mb-4">Non-Returnable Items</h2>
            <div className="text-[14px] font-light text-[#888880] leading-[1.8] space-y-3">
              <p>The following are not eligible for exchange or return:</p>
              <div className="space-y-2 pl-1">
                {[
                  'Products with tags removed or washed/worn',
                  'Products beyond the 7-day exchange window',
                  'Sale or discounted items (unless defective)',
                  'Pre-order items (unless defective)',
                ].map((reason) => (
                  <div key={reason} className="flex items-center gap-3">
                    <XCircle size={14} className="text-red-400 shrink-0" />
                    <span>{reason}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div {...fadeUp}>
            <h2 className="font-display text-[22px] lg:text-[28px] font-light text-[#1A1A1A] mb-4">Return Shipping</h2>
            <div className="text-[14px] font-light text-[#888880] leading-[1.8] space-y-3">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-[13px]">
                  <thead>
                    <tr className="border-b border-[#E8E4E0]">
                      <th className="text-left py-3 pr-4 font-medium text-[#1A1A1A] text-[11px] tracking-[0.1em] uppercase">Scenario</th>
                      <th className="text-left py-3 font-medium text-[#1A1A1A] text-[11px] tracking-[0.1em] uppercase">Shipping Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['Defective / Wrong Product', 'Free (on us)'],
                      ['Size Exchange', 'Nominal fee (₹70–100)'],
                      ['Colour Exchange', 'Nominal fee (₹70–100)'],
                    ].map(([scenario, cost]) => (
                      <tr key={scenario} className="border-b border-[#E8E4E0]/50">
                        <td className="py-3 pr-4 text-[#888880]">{scenario}</td>
                        <td className="py-3 text-[#1A1A1A] font-medium">{cost}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>

          <motion.div {...fadeUp}>
            <h2 className="font-display text-[22px] lg:text-[28px] font-light text-[#1A1A1A] mb-4">Exchange Process</h2>
            <div className="text-[14px] font-light text-[#888880] leading-[1.8] space-y-4">
              {[
                { step: '1', text: 'WhatsApp us at +91 7701815002 with your order ID and reason' },
                { step: '2', text: 'We verify and approve your exchange within 24 hours' },
                { step: '3', text: 'Drop off the product via the courier we arrange, or we pick up' },
                { step: '4', text: 'Your replacement ships within 1–2 days of receiving the return' },
              ].map((item) => (
                <div key={item.step} className="flex items-start gap-4">
                  <div className="w-8 h-8 flex items-center justify-center bg-[#C0132A] text-white text-[12px] font-bold shrink-0">
                    {item.step}
                  </div>
                  <p className="pt-1">{item.text}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Important Note */}
          <motion.div {...fadeUp} className="p-5 bg-white flex items-start gap-4">
            <AlertCircle size={20} className="text-[#C0132A] shrink-0 mt-0.5" />
            <div>
              <p className="text-[14px] font-medium text-[#1A1A1A] mb-1">Important</p>
              <p className="text-[13px] font-light text-[#888880] leading-[1.7]">
                Please ensure the product is in its original condition with tags attached. Products that have been washed, altered, or used beyond trying on cannot be exchanged.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-12 lg:py-16 px-5 lg:px-20">
        <motion.div {...fadeUp} className="max-w-2xl mx-auto text-center">
          <MessageCircle size={28} className="mx-auto text-[#C0132A] mb-4" />
          <h3 className="font-display text-[24px] lg:text-[28px] font-light text-[#1A1A1A] mb-2">Need to initiate an exchange?</h3>
          <p className="text-[13px] font-light text-[#888880] mb-6">
            We make it as easy as sending a message. Reach out on WhatsApp — we'll take care of the rest.
          </p>
          <a
            href="https://wa.me/917701815002"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-dark inline-flex"
          >
            <MessageCircle size={14} /> Start Exchange
          </a>
        </motion.div>
      </section>
    </div>
  );
}
