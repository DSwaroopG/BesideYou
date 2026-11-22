// Portable HTTP checks. Does not submit the booking form or invoke its API.
import assert from 'node:assert/strict';
const base = process.env.QA_URL || 'http://localhost:3000';
const routes = ['/', '/solutions', '/how-it-works', '/who-we-help', '/why-besideyou', '/contact', '/privacy', '/terms', ...['ai-consulting-firms', 'saas-development-companies', 'data-engineering-firms', 'dev-consultancies', 'bengaluru', 'mumbai'].map(slug => '/outbound/' + slug)];
for (const route of routes) {
  const response = await fetch(new URL(route, base), { signal: AbortSignal.timeout(60000) });
  assert.equal(response.status, 200, `${route}: expected 200`);
  const html = await response.text();
  assert.equal((html.match(/<h1(?:\s|>)/g) || []).length, 1, `${route}: expected one H1`);
  console.log(`PASS ${route}: 200, one H1`);
}
// Renamed and retired URLs redirect to their v3.0 pages.
for (const [from, to] of [['/pilot', '/why-besideyou'], ['/the-pilot', '/why-besideyou'], ['/pay-per-qualified-call', '/why-besideyou'], ['/who-we-work-with', '/who-we-help']]) {
  const response = await fetch(new URL(from, base), { redirect: 'manual', signal: AbortSignal.timeout(60000) });
  assert([307, 308].includes(response.status), `${from}: expected redirect`);
  assert.equal(new URL(response.headers.get('location'), base).pathname, to);
  console.log(`PASS ${from} -> ${to}`);
}
for (const route of ['/robots.txt', '/sitemap.xml']) {
  const response = await fetch(new URL(route, base), { signal: AbortSignal.timeout(60000) });
  assert.equal(response.status, 200, `${route}: expected 200`);
  console.log(`PASS ${route}`);
}
console.log('All smoke checks passed; no booking submitted.');
