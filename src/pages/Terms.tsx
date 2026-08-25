const sections = [
  ['Using this website', 'You must provide accurate information, use the website lawfully, and avoid interfering with its security or operation. We may suspend access where we reasonably believe there is fraud, abuse, or a security risk.'],
  ['Products and availability', 'We aim to show colours, measurements, descriptions, prices, and availability accurately. Screens and handmade or small-batch production can introduce minor variations. Adding an item to a cart does not reserve it; an order is accepted only when we confirm it.'],
  ['Pricing and payment', 'Prices are shown in Indian rupees unless stated otherwise. Applicable taxes, delivery charges, and discounts are shown before payment. Payments are processed by third-party providers. If a pricing or stock error affects an order, we may cancel it and issue a refund.'],
  ['Shipping', 'Estimated dispatch and delivery windows are guidance, not guarantees. Delays can occur because of carriers, weather, address issues, or events outside our control. Please review the Shipping Policy for current timelines and coverage.'],
  ['Returns, exchanges, and cancellations', 'Eligibility, time limits, product condition requirements, and any return charges are described in our Return & Exchange Policy. Statutory consumer rights continue to apply. Contact us promptly if an item is damaged, defective, or incorrect.'],
  ['Intellectual property', 'The Slug\'s Era name, artwork, photography, copy, site design, and product graphics are owned by or licensed to us. You may use the website for personal shopping only and may not reproduce or exploit this content without permission.'],
  ['Liability', 'Nothing in these terms excludes liability that cannot legally be excluded. To the extent permitted by law, we are not responsible for indirect losses or losses caused by misuse, third-party services, or events outside our reasonable control.'],
  ['Changes and governing law', 'We may update these terms to reflect operational or legal changes. The effective date above shows the latest revision. These terms are governed by applicable Indian law, and disputes are subject to the courts with jurisdiction under that law.'],
];

export default function Terms() {
  return <article className="bg-white px-5 py-14 lg:px-20 lg:py-24"><div className="mx-auto max-w-3xl">
    <p className="eye-text mb-4">Legal</p><h1 className="font-display text-[clamp(36px,6vw,64px)] font-light">Terms &amp; Conditions</h1><p className="mt-3 text-sm text-[#888880]">Effective 25 August 2026</p>
    <p className="mt-8 text-[15px] font-light leading-7 text-[#555550]">These terms apply when you browse slugsera.com, create an account, or purchase from Slug's Era. By using the website, you agree to them.</p>
    <div className="mt-10 space-y-9">{sections.map(([title, body]) => <section key={title}><h2 className="font-display text-2xl font-light text-[#1A1A1A]">{title}</h2><p className="mt-3 text-[14px] font-light leading-7 text-[#666660]">{body}</p></section>)}
      <section><h2 className="font-display text-2xl font-light text-[#1A1A1A]">Contact</h2><p className="mt-3 text-[14px] font-light leading-7 text-[#666660]">Questions about these terms can be sent to <a className="text-[#C0132A] underline underline-offset-4" href="mailto:slugsera@gmail.com">slugsera@gmail.com</a>.</p></section>
    </div></div></article>;
}
