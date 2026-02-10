#!/usr/bin/env node
// Script to query products from backend and update their category.
// Usage: node scripts/update-category.js --from="OldCategory" --to="NewCategory" [--search="term"] --apiUrl="https://..." --token="<token>"

const rawArgs = process.argv.slice(2);
const args = {};
for (const a of rawArgs) {
  if (a.startsWith('--')) {
    const [k, v] = a.slice(2).split('=');
    args[k] = v === undefined ? true : v;
  }
}
const fetch = global.fetch || (async (...p) => (await import('node-fetch')).default(...p));

async function main() {
  const API_BASE = args.apiUrl || process.env.NEXT_PUBLIC_API_URL || process.env.API_URL;
  if (!API_BASE) {
    console.error('Provide --apiUrl or set NEXT_PUBLIC_API_URL / API_URL');
    process.exit(1);
  }

  const from = args.from;
  const to = args.to;
  const search = args.search || '';
  const token = args.token || process.env.API_TOKEN || '';

  if (!from || !to) {
    console.error('Usage: --from="OldCategory" --to="NewCategory" [--search="term"] --apiUrl="..." --token="TOKEN"');
    process.exit(1);
  }

  const query = new URLSearchParams();
  if (search) query.append('search', search);
  query.append('category', from);

  const listUrl = `${API_BASE.replace(/\/$/, '')}/api/products/?${query.toString()}`;
  console.log('Fetching products from', listUrl);

  const listRes = await fetch(listUrl, {
    headers: token ? { 'Authorization': `Token ${token}` } : {}
  });

  if (!listRes.ok) {
    console.error('Failed to fetch products', await listRes.text());
    process.exit(1);
  }

  const listJson = await listRes.json();
  const products = (listJson && listJson.data && listJson.data.products) || listJson.data || listJson.products || [];

  console.log(`Found ${products.length} products to update`);

  for (const p of products) {
    const id = p.id;
    const updateUrl = `${API_BASE.replace(/\/$/, '')}/api/products/${id}/`;
    const body = {
      name: p.name,
      category: to,
      price: p.price,
      specs: p.specs,
      warranty: p.warranty || '3 Months',
      // Backend may accept images_data or image_urls; we only change category via PUT
    };

    try {
      const res = await fetch(updateUrl, {
        method: 'PUT',
        headers: Object.assign({ 'Content-Type': 'application/json' }, token ? { 'Authorization': `Token ${token}` } : {}),
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        console.error(`Failed to update ${id}:`, res.status, await res.text());
        continue;
      }

      const resJson = await res.json();
      console.log(`Updated product ${id}: ${resJson?.data?.name || p.name}`);
    } catch (err) {
      console.error('Error updating product', id, err.message || err);
    }
  }

  console.log('Done');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
