import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Ruler, Truck, RotateCcw, CreditCard, MessageCircle, Package } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqSections: { title: string; icon: React.ElementType; items: FAQItem[] }[] = [
  {
    title: 'Sizing & Fit',
    icon: Ruler,
    items: [
      {
        question: 'What size should I order?',
        answer: 'Our tees are designed oversized — if you normally wear M, try M for the perfect relaxed fit. For a more fitted look, go one size down. Check our size chart on each product page for exact measurements.',
      },
      {
        question: 'What\'s the GSM of your fabrics?',
        answer: 'Our t-shirts use 240 GSM premium combed cotton — that\'s heavyweight, won\'t see through, holds shape after washing. Hoodies range from 330-400 GSM. Shirts are 180 GSM premium rayon for a flowy, breathable drape.',
      },
      {
        question: 'Do your clothes shrink after washing?',
        answer: 'Minimal to no shrinkage when following care instructions. We pre-shrink all our fabrics. Machine wash cold, tumble dry low or hang dry for best results.',
      },
      {
        question: 'Are your sizes true to Indian body types?',
        answer: 'Yes! Unlike international brands, we design our silhouettes specifically for Indian proportions — broader shoulders, right sleeve length, and torso fit that actually works.',
      },
    ],
  },
  {
    title: 'Shipping',
    icon: Truck,
    items: [
      {
        question: 'Do you offer free shipping?',
        answer: 'Yes! Free shipping across India on all orders, no minimum required. We ship via trusted courier partners.',
      },
      {
        question: 'How long does delivery take?',
        answer: 'Standard delivery takes 3-5 business days across India. Metro cities usually receive in 2-3 days. You\'ll get a tracking link via WhatsApp/email once your order ships.',
      },
      {
        question: 'Do you ship internationally?',
        answer: 'Not yet — but we\'re working on it! Currently we only ship within India. Follow @slugsera on Instagram for updates on international shipping.',
      },
    ],
  },
  {
    title: 'Returns & Exchanges',
    icon: RotateCcw,
    items: [
      {
        question: 'What\'s your return policy?',
        answer: 'We offer hassle-free exchanges within 7 days of delivery for size, colour, or defects. Simply reach out to us on WhatsApp (7701815002) with your order number, and we\'ll guide you through the process.',
      },
      {
        question: 'Can I get a refund?',
        answer: 'We currently offer exchanges only (not refunds), unless the product is defective or damaged. In such cases, we\'ll arrange a full refund or replacement — your choice.',
      },
      {
        question: 'Who pays for return shipping?',
        answer: 'If the product is defective or wrong item was sent, return shipping is on us. For size exchanges, a nominal return shipping fee applies.',
      },
    ],
  },
  {
    title: 'Orders & Payment',
    icon: CreditCard,
    items: [
      {
        question: 'What payment methods do you accept?',
        answer: 'We accept all major credit/debit cards, UPI (GPay, PhonePe, Paytm), net banking, and wallets. All payments are processed securely via Razorpay.',
      },
      {
        question: 'Can I cancel my order?',
        answer: 'You can cancel within 2 hours of placing your order. After that, if the order hasn\'t shipped yet, reach out on WhatsApp and we\'ll try our best to accommodate.',
      },
      {
        question: 'What is a pre-order?',
        answer: 'Some of our limited items are available for pre-order. You pay at the time of pre-ordering and the product ships within the date mentioned on the product page. Pre-order items often come at a discounted price.',
      },
    ],
  },
  {
    title: 'Product Care',
    icon: Package,
    items: [
      {
        question: 'How do I care for printed tees?',
        answer: 'Turn inside out before washing. Machine wash cold with similar colours. Do not bleach. Tumble dry low or hang dry. Iron inside out — never directly on the print.',
      },
      {
        question: 'How do I maintain hoodie embroidery?',
        answer: 'Machine wash cold on gentle cycle. Do not iron directly on the embroidery. Hang dry recommended for best longevity.',
      },
    ],
  },
];

function AccordionItem({ item, isOpen, toggle }: { item: FAQItem; isOpen: boolean; toggle: () => void }) {
  return (
    <div className="border-b border-[#E8E4E0] last:border-0">
      <button
        onClick={toggle}
        className="w-full flex items-center justify-between py-5 lg:py-6 text-left group"
      >
        <span className={`text-[14px] lg:text-[16px] font-light pr-4 transition-colors duration-200 ${
          isOpen ? 'text-[#C0132A]' : 'text-[#1A1A1A] group-hover:text-[#C0132A]'
        }`}>
          {item.question}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="shrink-0"
        >
          <ChevronDown size={18} className={`transition-colors duration-200 ${isOpen ? 'text-[#C0132A]' : 'text-[#888880]'}`} />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="text-[13px] lg:text-[14px] font-light text-[#888880] leading-[1.7] pb-5 lg:pb-6 pr-8">
              {item.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQ() {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const toggleItem = (key: string) => {
    setOpenItems(prev => ({ ...prev, [key]: !prev[key] }));
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
          <span className="eye-text eye-text-center mb-4">Help Center</span>
          <h1 className="font-display text-[clamp(32px,5vw,60px)] font-light leading-[1.1] text-[#1A1A1A] mt-4">
            Frequently Asked<br /><em className="italic text-[#C0132A]">Questions</em>
          </h1>
          <p className="text-[#888880] text-[14px] lg:text-[15px] font-light leading-[1.7] mt-4 max-w-md mx-auto">
            Everything you need to know about ordering, sizing, shipping, and more.
          </p>
        </motion.div>
      </section>

      {/* FAQ Sections */}
      <section className="py-16 lg:py-24 px-5 lg:px-20">
        <div className="max-w-3xl mx-auto space-y-12 lg:space-y-16">
          {faqSections.map((section, sIdx) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: sIdx * 0.05 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 flex items-center justify-center bg-[#C0132A]/5 text-[#C0132A]">
                  <section.icon size={18} strokeWidth={1.5} />
                </div>
                <h2 className="font-display text-[22px] lg:text-[26px] font-light text-[#1A1A1A]">{section.title}</h2>
              </div>
              <div className="border-t border-[#E8E4E0]">
                {section.items.map((item, iIdx) => {
                  const key = `${sIdx}-${iIdx}`;
                  return (
                    <AccordionItem
                      key={key}
                      item={item}
                      isOpen={!!openItems[key]}
                      toggle={() => toggleItem(key)}
                    />
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Still have questions CTA */}
      <section className="py-12 lg:py-16 px-5 lg:px-20 bg-[#F9F7F5]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center"
        >
          <MessageCircle size={28} className="mx-auto text-[#C0132A] mb-4" />
          <h3 className="font-display text-[24px] lg:text-[30px] font-light text-[#1A1A1A] mb-2">Still have questions?</h3>
          <p className="text-[13px] font-light text-[#888880] mb-6">
            We're always here to help. Reach out via WhatsApp for the fastest response.
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
