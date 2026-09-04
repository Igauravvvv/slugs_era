const sections = [
  ['Information we collect', 'We collect information you provide when you place an order, create an account, contact us, or join The Slow Club. This may include your name, email address, phone number, shipping and billing address, order details, and messages. Payment card and UPI details are processed by our payment provider and are not stored by Slug\'s Era.'],
  ['How we use information', 'We use your information to fulfil and support orders, provide account features, respond to enquiries, prevent fraud, improve the storefront, meet legal obligations, and send marketing messages when you have asked to receive them. You can unsubscribe from marketing at any time.'],
  ['Cookies and analytics', 'Essential storage supports features such as your cart, login state, and consent choice. Google Analytics uses consent mode. Before you accept, or if you reject optional cookies, analytics storage remains disabled and Google receives cookieless measurement events for basic reporting and modeling. If you accept, analytics cookies allow fuller device, browser, page, and interaction insights. You can change this choice using Cookie Settings in the footer.'],
  ['Sharing and processors', 'We share only the information necessary with service providers that help us operate the store, including hosting, database, authentication, payment, email, analytics, delivery, and customer-support providers. We may also disclose information where required by law or to protect customers and our business.'],
  ['Retention and security', 'We retain information only for as long as needed for the purposes above, including tax, accounting, dispute, and fraud-prevention requirements. We use reasonable technical and organisational safeguards, but no internet service can guarantee absolute security.'],
  ['Your choices and rights', 'You may ask to access, correct, or delete personal information we control, object to certain uses, withdraw consent, or opt out of marketing. Some records may need to be retained where the law requires it. We may verify your identity before completing a request.'],
];

export default function PrivacyPolicy() {
  return <article className="bg-white px-5 py-14 lg:px-20 lg:py-24"><div className="mx-auto max-w-3xl">
    <p className="eye-text mb-4">Legal</p><h1 className="font-display text-[clamp(36px,6vw,64px)] font-light">Privacy Policy</h1><p className="mt-3 text-sm text-[#888880]">Effective 25 August 2026</p>
    <p className="mt-8 text-[15px] font-light leading-7 text-[#555550]">This policy explains how Slug's Era collects, uses, and protects personal information when you use slugsera.com or contact us.</p>
    <div className="mt-10 space-y-9">{sections.map(([title, body]) => <section key={title}><h2 className="font-display text-2xl font-light text-[#1A1A1A]">{title}</h2><p className="mt-3 text-[14px] font-light leading-7 text-[#666660]">{body}</p></section>)}
      <section><h2 className="font-display text-2xl font-light text-[#1A1A1A]">Contact us</h2><p className="mt-3 text-[14px] font-light leading-7 text-[#666660]">For privacy questions or requests, email <a className="text-[#C0132A] underline underline-offset-4" href="mailto:slugsera@gmail.com">slugsera@gmail.com</a> or use the contact page. Slug's Era operates from India and this policy is governed by applicable Indian law.</p></section>
    </div></div></article>;
}
