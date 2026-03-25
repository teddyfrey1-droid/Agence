import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const SRC = path.join(ROOT, 'src');
const APP = path.join(SRC, 'app');
const TSX_EXTS = new Set(['.ts', '.tsx']);

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(full));
    else files.push(full);
  }
  return files;
}

function collectPageRoutes() {
  const routes = new Set();
  for (const file of walk(APP).filter((f) => path.basename(f) === 'page.tsx')) {
    const rel = path.relative(APP, file);
    const parts = rel.split(path.sep).slice(0, -1).filter((p) => !(p.startsWith('(') && p.endsWith(')')));
    routes.add('/' + parts.join('/'));
  }
  routes.add('/');
  return routes;
}

function collectApiRoutes() {
  const apiDir = path.join(APP, 'api');
  const routes = new Set();
  for (const file of walk(apiDir).filter((f) => path.basename(f) === 'route.ts')) {
    const rel = path.relative(apiDir, file);
    const parts = rel.split(path.sep).slice(0, -1);
    routes.add('/api/' + parts.join('/'));
  }
  return routes;
}

function routeExists(target, routeSet) {
  if (routeSet.has(target)) return true;
  for (const route of routeSet) {
    const routeParts = route.split('/').filter(Boolean);
    const targetParts = target.split('/').filter(Boolean);
    if (routeParts.length !== targetParts.length) continue;
    let ok = true;
    for (let i = 0; i < routeParts.length; i++) {
      const p = routeParts[i];
      if (p.startsWith('[') && p.endsWith(']')) continue;
      if (p !== targetParts[i]) {
        ok = false;
        break;
      }
    }
    if (ok) return true;
  }
  return false;
}

const pageRoutes = collectPageRoutes();
const apiRoutes = collectApiRoutes();
const issues = [];

for (const file of walk(SRC).filter((f) => TSX_EXTS.has(path.extname(f)))) {
  const content = fs.readFileSync(file, 'utf8');

  for (const match of content.matchAll(/href=\{?["']([^"']+)["']\}?/g)) {
    const target = match[1];
    if (!target.startsWith('/') || target.startsWith('/api/')) continue;
    if (target.includes('${') || target.includes('http')) continue;
    if (!routeExists(target, pageRoutes)) {
      issues.push({ type: 'page', file: path.relative(ROOT, file), target });
    }
  }

  for (const match of content.matchAll(/fetch\(\s*["']([^"']+)["']/g)) {
    const target = match[1];
    if (!target.startsWith('/api/')) continue;
    if (!routeExists(target, apiRoutes)) {
      issues.push({ type: 'api', file: path.relative(ROOT, file), target });
    }
  }
}

console.log('Route audit summary');
console.log(`- Page routes indexed: ${pageRoutes.size}`);
console.log(`- API routes indexed: ${apiRoutes.size}`);
console.log(`- Broken static route references: ${issues.length}`);

if (issues.length) {
  for (const issue of issues) {
    console.log(`  - [${issue.type}] ${issue.file} -> ${issue.target}`);
  }
  process.exit(1);
}
