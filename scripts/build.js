import { cpSync, mkdirSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const output = 'dist';
rmSync(output, { recursive: true, force: true });
mkdirSync(output);
for (const path of ['index.html', '404.html', 'assets', 'privacy', 'thank-you', 'robots.txt', 'sitemap.xml']) {
  cpSync(path, join(output, path), { recursive: true });
}

const html = readFileSync(join(output, 'index.html'), 'utf8');
for (const fragment of ['name="quote-request"', 'method="POST"', 'data-netlify="true"', 'name="form-name" value="quote-request"', 'name="name"', 'name="email"', 'name="service"', 'name="zip"']) {
  if (!html.includes(fragment)) throw new Error(`Netlify form registration missing: ${fragment}`);
}
console.log('Built dist/ with the static quote-request form registration.');
