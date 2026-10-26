// Runs on Netlify every time the site is published (see netlify.toml).
// Bundles every essay, album, track and drift, plus the bio and ten-minutes
// settings, into one file: /content/bundle.json. The site loads that single
// file from its own domain instead of asking GitHub for each folder.
// No dependencies: files are stored raw and parsed by the site itself.
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const FOLDERS = ['essays', 'albums', 'tracks', 'drifts'];
const SETTINGS = ['bio', 'start'];
const out = { v: 1, generated: new Date().toISOString(), folders: {}, settings: {} };

for (const folder of FOLDERS) {
  let names = [];
  try {
    names = (await readdir(join('content', folder))).filter(n => n.endsWith('.md')).sort();
  } catch { /* folder missing: leave it empty */ }
  out.folders[folder] = await Promise.all(
    names.map(async name => ({ name, raw: await readFile(join('content', folder, name), 'utf8') }))
  );
}

for (const key of SETTINGS) {
  try {
    out.settings[key] = JSON.parse(await readFile(join('content', 'settings', key + '.json'), 'utf8'));
  } catch { /* missing or invalid: the site falls back to fetching it directly */ }
}

await writeFile(join('content', 'bundle.json'), JSON.stringify(out));
console.log('content bundle:', FOLDERS.map(f => `${f} ${out.folders[f].length}`).join(', '),
  '| settings:', Object.keys(out.settings).join(', ') || 'none');
