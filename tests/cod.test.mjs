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
await writeFile(join(dir, 'package.json'), '{"type":"module"}');
for (const file of ['_lib/checkout', '_lib/order-email', 'payment/cod']) {
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
    const results = await Promise.all([call(), call()]);
    for (const result of results) {
      assert.equal(result.code, 200);
      assert.equal(result.data.data.order.total, 1999);
      assert.equal(result.data.data.order.payment_id, null);
      assert.equal(result.data.data.order.shipping_address.paymentMethod, 'COD');
      assert.equal(result.data.data.order.shipping_address.paymentStatus, 'Pending');
    }
    assert.equal(inserts, 1);
    assert.equal((await call()).data.data.order.id, results[0].data.data.order.id);
    assert.equal(inserts, 1);
  } finally { globalThis.fetch = originalFetch; }
});
const { orderEmail } = await import(pathToFileURL(join(dir, '_lib/order-email.js')));
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
});
await rm(dir, { recursive: true, force: true });
