// The app's icons: Iconsax, from the Figma file "7000 FREE UI ICONS" (the set andinoh_mobile and andinoh_admin use).
//
//   npm run icons:build   (node scripts/figma-icons.mjs build)
//       assets/icons/iconsax/<style>/*.svg → src/components/icons/iconsax.generated.ts (no network)
//
//   npm run icons:fetch   (node scripts/figma-icons.mjs fetch [linear|bold …])
//       Re-export every SVG named in scripts/icon-map.json from Figma into assets/icons/iconsax/<style>/,
//       then build. Needs FIGMA_TOKEN (a personal access token that can read file content), taken from
//       the environment or this repo's .env.local. Figma's export quota is small on Starter seats; on a
//       429 the script prints how long Figma asks us to wait.
import fs from 'node:fs';
import path from 'node:path';

const FILE = 'CXVZXf46xf4GSvvutOF6FH'; // 7000 FREE UI ICONS (Community)
const PAGE = '1:5';                     // "Interface icons"
const root = path.dirname(path.dirname(new URL(import.meta.url).pathname));
const assets = path.join(root, 'assets/icons/iconsax');
const slug = (name) => name.toLowerCase().replace(/\s+/g, '-');

const map = Object.fromEntries(Object.entries(JSON.parse(fs.readFileSync(path.join(root, 'scripts/icon-map.json'), 'utf8')))
    .filter(([k]) => !k.startsWith('_'))
    .map(([k, v]) => [k, typeof v === 'string' ? { icon: v } : v]));

function token() {
    if (process.env.FIGMA_TOKEN) return process.env.FIGMA_TOKEN;
    const env = path.join(root, '.env.local');
    const line = fs.existsSync(env) && fs.readFileSync(env, 'utf8').split('\n').find(l => l.startsWith('FIGMA_TOKEN='));
    if (line) return line.slice('FIGMA_TOKEN='.length).trim();
    throw new Error('Set FIGMA_TOKEN (environment or .env.local)');
}

async function fetchSvgs(styles) {
    const headers = { 'X-Figma-Token': token() };
    const api = async (p) => {
        const res = await fetch(`https://api.figma.com/v1/${p}`, { headers });
        if (res.status === 429) {
            const wait = Number(res.headers.get('retry-after'));
            throw new Error(`Figma rate limit; retry in ${Math.ceil(wait / 3600)} h (${wait}s). Existing SVGs are unchanged.`);
        }
        if (!res.ok) throw new Error(`${p.split('?')[0]} → ${res.status} ${await res.text()}`);
        return res.json();
    };
    // Index every icon set on the page: name → { style → component id }. Figma names are the slugs
    // (e.g. "search-normal"), except the line arrow, which the file calls "Line arrow-left".
    const page = (await api(`files/${FILE}/nodes?ids=${encodeURIComponent(PAGE)}&depth=4`)).nodes[PAGE].document;
    const sets = {};
    (function walk(n) {
        if (n.type === 'COMPONENT_SET') {
            sets[slug(n.name)] ??= Object.fromEntries(n.children.filter(c => c.type === 'COMPONENT')
                .map(c => [c.name.split('=')[1].split(',')[0].trim().toLowerCase(), c.id]));
            return;
        }
        (n.children ?? []).forEach(walk);
    })(page);

    const wanted = [...new Set(Object.values(map).map(v => v.icon))];
    const missing = wanted.filter(n => !sets[n]);
    if (missing.length) throw new Error(`Not in the Figma file: ${missing.join(', ')}`);

    const exported = [];
    for (const style of styles) {
        fs.mkdirSync(path.join(assets, style), { recursive: true });
        const ids = wanted.map(n => [n, sets[n][style]]).filter(([, id]) => id);
        for (let i = 0; i < ids.length; i += 50) {
            const batch = ids.slice(i, i + 50);
            const q = new URLSearchParams({ ids: batch.map(([, id]) => id).join(','), format: 'svg', svg_simplify_stroke: 'true', svg_outline_text: 'false' });
            const { images } = await api(`images/${FILE}?${q}`);
            for (const [name, id] of batch) {
                fs.writeFileSync(path.join(assets, style, `${name}.svg`), await (await fetch(images[id])).text());
                if (style === 'linear') exported.push(name);
            }
        }
        console.log(`Fetched ${ids.length} ${style} SVGs`);
    }
    // Everything we just exported now comes from Figma.
    const sourcesFile = path.join(assets, 'SOURCES.json');
    const sources = JSON.parse(fs.readFileSync(sourcesFile, 'utf8'));
    sources.figma = [...new Set([...sources.figma, ...exported])].sort();
    sources.iconsax_package = sources.iconsax_package.filter(n => !exported.includes(n));
    fs.writeFileSync(sourcesFile, JSON.stringify(sources, null, 2) + '\n');
}

function build() {
    const styles = fs.readdirSync(assets).filter(d => fs.statSync(path.join(assets, d)).isDirectory());
    // Inner markup only, with the export's fixed colour swapped for currentColor so icons take the text colour.
    const inner = (svg) => svg
        .replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '')
        .replace(/(stroke|fill)="(?!none)[^"]*"/g, '$1="currentColor"')
        .replace(/\s+/g, ' ').replace(/>\s+</g, '><').trim();
    const out = {};
    for (const [app, { icon, viewBox, rotate }] of Object.entries(map)) {
        for (const style of styles) {
            const file = path.join(assets, style, `${slug(icon)}.svg`);
            if (!fs.existsSync(file)) continue;
            const svg = fs.readFileSync(file, 'utf8');
            const box = viewBox ?? svg.match(/viewBox="([^"]+)"/)?.[1] ?? '0 0 24 24';
            const [x, y, w, h] = box.split(/\s+/).map(Number);
            const body = inner(svg);
            out[app] ??= {};
            out[app][style] = {
                viewBox: box,
                body: rotate ? `<g transform="rotate(${rotate} ${x + w / 2} ${y + h / 2})">${body}</g>` : body,
            };
        }
        if (!out[app]?.linear) throw new Error(`No linear SVG for ${app} (${icon})`);
    }
    const dir = path.join(root, 'src/components/icons');
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'iconsax.data.ts'), `// Generated by scripts/figma-icons.mjs from assets/icons/iconsax (Iconsax SVGs). Do not edit.
// App icon name → SVG per style. Which Iconsax icon each name uses: scripts/icon-map.json.

export type IconStyle = ${styles.map(s => `'${s}'`).join(' | ')};
export interface IconData { viewBox: string; body: string }

export const ICONS: Record<string, Partial<Record<IconStyle, IconData>>> = ${JSON.stringify(out, null, 2)};
`);
    const names = Object.keys(out).sort();
    fs.writeFileSync(path.join(dir, 'iconsax.generated.ts'), `// Generated by scripts/figma-icons.mjs. Do not edit: add names to scripts/icon-map.json.
import { make } from './make';

${names.map(n => `export const ${n} = make('${n}');`).join('\n')}
`);
    const file = path.join(dir, 'iconsax.data.ts');
    console.log(`Built ${Object.keys(out).length} icons → ${path.relative(root, file)}`);
}

const [cmd, ...args] = process.argv.slice(2);
if (cmd === 'fetch') {
    await fetchSvgs(args.length ? args : ['linear']);
    build();
} else if (cmd === 'build') {
    build();
} else {
    console.error('Usage: node scripts/figma-icons.mjs build | fetch [linear|bold …]');
    process.exit(1);
}
