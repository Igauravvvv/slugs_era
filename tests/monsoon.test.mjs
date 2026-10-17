import { test } from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';
import { readFile } from 'node:fs/promises';
const source = await readFile('src/utils/monsoonSale.ts','utf8');
const js = ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
const { withMonsoonPrice } = await import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`);
test('sale reprices restored tees and preorders without mutating source or changing other categories', () => {
  const old = { id:'tee', category:'tshirts',price:1199,preOrderPrice:1099 };
  assert.deepEqual(withMonsoonPrice(old), { ...old, price:999, originalPrice:1199, preOrderPrice:999 });
  assert.equal(old.price,1199);
  assert.deepEqual(withMonsoonPrice(withMonsoonPrice(old)),withMonsoonPrice(old));
  const shirt = {category:'shirts',price:2299};
  assert.equal(withMonsoonPrice(shirt),shirt);
  assert.equal(withMonsoonPrice({category:'tshirts',price:999}).originalPrice,undefined);
});
