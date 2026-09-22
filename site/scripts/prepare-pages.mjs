import { readdir, readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import { resolve, join, extname } from 'node:path';

// Vinext's basePath export currently skips the root page. Export at the root,
// then prefix static bundle URLs for the repository's GitHub Pages address.
const prefix = process.env.NEXT_PUBLIC_BASE_PATH || '';
if (prefix && !/^\/[a-zA-Z0-9._-]+$/.test(prefix)) {
  throw new Error(`Invalid GitHub Pages base path: ${prefix}`);
}
const output = resolve('dist/client');
await readFile(join(output, 'index.html')); // Fail publication if export is incomplete.
async function prepare(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await prepare(path);
    else if (['.html', '.css', '.js', '.rsc', '.json'].includes(extname(path))) {
      const content = await readFile(path, 'utf8');
      const updated = content
        .replace(/(?<![\w/])\/(?:_next|fonts)\//g, (url) => `${prefix}${url}`)
        // Vite's preload map stores paths without the leading slash.
        .replace(/(?<=["'`])_next\//g, `${prefix.slice(1)}/_next/`);
      if (updated !== content) await writeFile(path, updated);
    }
  }
}
if (prefix) await prepare(output);
// Static hosts need real directories for links ending in /privacy/, etc.
// Keep Vinext's flat exports too, for its own route/RSC resolution.
for (const name of ['privacy', 'analytics-consent', 'cookies']) {
  const directory = join(output, name);
  await mkdir(directory, { recursive: true });
  await copyFile(join(output, `${name}.html`), join(directory, 'index.html'));
  await copyFile(join(output, `${name}.rsc`), join(directory, 'index.rsc'));
}
await writeFile(join(output, '.nojekyll'), '');
console.log(`GitHub Pages files ready at ${output} (base: ${prefix || '/'})`);
