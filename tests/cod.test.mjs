import { test } from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';
import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const dir = await mkdtemp(join(tmpdir(), 'cod-test-'));
await mkdir(join(dir, '_lib'));
await mkdir(join(dir, 'payment'));
await mkdir(join(dir, 'node_modules/nodemailer'), { recursive: true });
await mkdir(join(dir, 'node_modules/@vercel/functions'), { recursive: true });
await writeFile(join(dir, 'node_modules/@vercel/functions/package.json'), '{"type":"module","main":"index.js"}');
await writeFile(join(dir, 'node_modules/@vercel/functions/index.js'), 'export const waitUntil = task => globalThis.backgroundTasks.push(task);');
globalThis.backgroundTasks = [];
await writeFile(join(dir, 'node_modules/nodemailer/package.json'), '{"type":"module","main":"index.js"}');
await writeFile(join(dir, 'node_modules/nodemailer/index.js'), `export default { createTransport: () => ({ sendMail: async message => { if (globalThis.mailGate) await globalThis.mailGate; globalThis.testEmails.push(message); if(globalThis.rejectCustomer && message.to === 'buyer@example.test') throw Object.assign(new Error('Temporary SMTP failure'), {code:'ETIMEDOUT'}); return { accepted: [message.to], messageId: message.messageId }; }, close() {} }) };`);
globalThis.testEmails = [];
await writeFile(join(dir, 'package.json'), '{"type":"module"}');
for (const file of ['_lib/checkout', '_lib/order-email', '_lib/retry-order-emails', 'payment/cod']) {
  const source = await readFile(`api/${file}.ts`, 'utf8');
  await writeFile(join(dir, `${file}.js`), ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText);
}
const { default: handler } = await import(pathToFileURL(join(dir, 'payment/cod.js')));
process.env.SUPABASE_URL = 'https://db.test';
process.env.SUPABASE_ANON_KEY = 'test';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test';
delete process.env.RAZORPAY_KEY_ID;
delete process.env.RAZORPAY_KEY_SECRET;
const body = {
  requestId: '12345678-1234-4234-a234-123456789012', customerName: 'Test Buyer', customerPhone: '9876543210',
  shippingAddress: { street: '123 Test Street', city: 'Delhi', state: 'Delhi', pincode: '110001', country: 'India' },
  items: [{ productId: 'shirt', quantity: 2, price: 1 }], promoCodes: ['2burpy'], total: 1,
};
async function call(overrides = {}) {
  const res = { status(code) { this.code = code; return this; }, json(data) { this.data = data; return this; }, end() { return this; } };
  await handler({ method: 'POST', headers: { authorization: 'Bearer test' }, body, ...overrides }, res);
  return res;
}
await test('COD authentication, validation, server pricing, stock and retry protection', async () => {
  const orders = new Map();
  let inserts = 0;
  let stock = 10;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input, options = {}) => {
    const url = new URL(input);
    const reply = (data, status = 200) => new Response(JSON.stringify(data), { status });
    if (url.pathname === '/auth/v1/user') return reply({ id: 'buyer', email: 'buyer@example.test' });
    if (url.pathname === '/rest/v1/products') return reply([{ id: 'shirt', name: 'Shirt', price: 1199, category: 'tshirts', is_published: true, stock_quantity: stock }]);
    if (url.pathname === '/rest/v1/notifications') throw new Error('Notifications unavailable');
    if (url.pathname === '/rest/v1/orders') {
      if (options.method === 'PATCH') {
        const order = orders.get(url.searchParams.get('id')?.slice(3));
        const expected = url.searchParams.get('shipping_address->emailDelivery->>attemptId');
        const current = order?.shipping_address?.emailDelivery?.attemptId;
        if (!order || (expected === 'is.null' ? Boolean(current) : expected !== `eq.${current}`)) return reply([]);
        Object.assign(order, JSON.parse(options.body));
        return reply([order]);
      }
      if (options.method === 'POST') {
        const order = JSON.parse(options.body);
        if (orders.has(order.id)) return reply({}, 409);
        inserts++;
        orders.set(order.id, order);
        return reply([order], 201);
      }
      const saved = orders.get(url.searchParams.get('id')?.slice(3));
      return reply(saved ? [saved] : []);
    }
    throw new Error(`Unexpected request: ${url}`);
  };
  try {
    assert.equal((await call({ headers: {} })).code, 401);
    assert.equal((await call({ method: 'GET' })).code, 405);
    assert.equal((await call({ body: { ...body, customerPhone: 'bad' } })).code, 400);
    stock = 1;
    assert.equal((await call()).code, 409);
    stock = 10;
    let releaseEmail;
    globalThis.mailGate = new Promise(resolve => { releaseEmail = resolve; });
    const results = await Promise.race([Promise.all([call(), call()]), new Promise((_, reject) => setTimeout(() => reject(new Error('Checkout waited for email')), 500))]);
    assert.equal(globalThis.testEmails.length, 0, 'Saved order returns before slow SMTP');
    releaseEmail(); globalThis.mailGate = null;
    await Promise.all(globalThis.backgroundTasks.splice(0));
    for (const result of results) {
      assert.equal(result.code, 200);
      assert.equal(result.data.data.order.total, 1998);
      assert.equal(result.data.data.order.payment_id, null);
      assert.equal(result.data.data.order.shipping_address.paymentMethod, 'COD');
      assert.equal(result.data.data.order.shipping_address.paymentStatus, 'Pending');
    }
    assert.equal(inserts, 1);
    assert.equal((await call()).data.data.order.id, results[0].data.data.order.id);
    assert.equal(inserts, 1);
    await Promise.all(globalThis.backgroundTasks.splice(0));
    assert.equal(globalThis.testEmails.length, 2);
    assert.deepEqual(globalThis.testEmails.map(message => message.to).sort(), ['buyer@example.test', 'slugsera@gmail.com']);
  } finally { globalThis.fetch = originalFetch; }
});
const { orderEmail, customerOrderEmail, sendOrderEmail } = await import(pathToFileURL(join(dir, '_lib/order-email.js')));
await test('order emails include the saved ID, items and correct collection status', () => {
  const order = { id: 'order-123', order_number: 'SLG-ABC', total: 1999, items: [{ name: 'Shirt', quantity: 2, size: 'M' }], shipping_address: { paymentMethod: 'COD', fullName: 'Buyer', street: '123 Test Street' } };
  const cod = orderEmail(order);
  assert.match(cod.subject, /New COD order received/);
  assert.match(cod.text, /Order ID: order-123/);
  assert.match(cod.text, /Collect on delivery: INR 1999.00/);
  assert.match(cod.text, /Shirt × 2 \/ M/);
  const paid = orderEmail({ ...order, payment_id: 'pay_123', shipping_address: {} });
  assert.match(paid.text, /Razorpay — paid/);
  assert.doesNotMatch(paid.text, /Collect on delivery/);
  assert.match(customerOrderEmail(order).subject, /Your Slugsera order is confirmed/);
  assert.match(customerOrderEmail(order).text, /Amount due on delivery: INR 1999.00/);
});
await test('failed customer email can retry without resending the accepted store alert', async () => {
  let saved = { id: 'retry-order', total: 100, shipping_address: { email: 'buyer@example.test', paymentMethod: 'COD' }, items: [] };
  const originalFetch = globalThis.fetch;
  globalThis.testEmails = [];
  globalThis.rejectCustomer = true;
  globalThis.fetch = async (input, options = {}) => {
    if (options.method === 'PATCH') saved = { ...saved, ...JSON.parse(options.body) };
    return new Response(JSON.stringify([saved]), {status:200});
  };
  try {
    const first = await sendOrderEmail(saved);
    assert.equal(first.store, true);
    assert.equal(first.customer, false);
    assert.equal(saved.shipping_address.emailDelivery.customer.error, 'ETIMEDOUT');
    globalThis.rejectCustomer = false;
    const second = await sendOrderEmail(saved);
    assert.equal(second.store, true);
    assert.equal(second.customer, true);
    assert.equal(globalThis.testEmails.filter(message => message.to === 'slugsera@gmail.com').length, 1);
    assert.equal(globalThis.testEmails.filter(message => message.to === 'buyer@example.test').length, 2);
    await sendOrderEmail(saved);
    assert.equal(globalThis.testEmails.length, 3);
  } finally { globalThis.fetch = originalFetch; }
});
await test('retired EOWS01 is rejected; sale checkout remains 999 per tee', async () => {
  const {priceCheckout, parsePromoCodes} = await import(pathToFileURL(join(dir, '_lib/checkout.js')));
  for (const code of ['EOWS01',' eows01 ','AOWS01']) assert.throws(() => parsePromoCodes([code]), /not valid/);
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(JSON.stringify([{id:'tee',name:'Tee',price:1199,category:'tshirts',stock_quantity:10,is_published:true}]));
  try {
    assert.equal((await priceCheckout([{productId:'tee',quantity:1}],{url:'https://db.test',serviceKey:'test',userId:'buyer'})).total,999);
  } finally { globalThis.fetch = originalFetch; }
});
await test('scheduled recovery selects only recent paid or COD orders with pending emails', async () => {
  const {retryOrderEmails} = await import(pathToFileURL(join(dir, '_lib/retry-order-emails.js')));
  const originalFetch = globalThis.fetch;
  let query;
  globalThis.fetch = async input => { query = new URL(input); return new Response('[]'); };
  try {
    assert.deepEqual(await retryOrderEmails(), {checked:0,complete:0});
    assert.match(query.searchParams.get('and'), /paymentMethod.eq.COD/);
    assert.match(query.searchParams.get('and'), /store->>sentAt.is.null/);
    assert.match(query.searchParams.get('and'), /customer->>sentAt.is.null/);
    assert.equal(query.searchParams.get('status'), 'neq.Cancelled');
    assert.equal(query.searchParams.get('limit'), '10');
    assert.match(query.searchParams.get('created_at'), /^gte\./);
  } finally { globalThis.fetch = originalFetch; }
});
await rm(dir, { recursive: true, force: true });
