import fs from 'fs';
import path from 'path';
import module from 'module';

const ROOT = process.cwd();
const SCAN_DIRS = ['src', 'scripts'];
const CODE_EXTS = new Set(['.ts', '.tsx', '.js', '.mjs', '.cjs']);
const BUILTINS = new Set([
  ...module.builtinModules,
  ...module.builtinModules.map((m) => `node:${m}`),
]);

const packageJson = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
const dependencies = new Set(Object.keys(packageJson.dependencies ?? {}));
const devDependencies = new Set(Object.keys(packageJson.devDependencies ?? {}));
const allDeclared = new Set([...dependencies, ...devDependencies]);

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
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

function normalizePackage(specifier) {
  if (
    specifier.startsWith('.') ||
    specifier.startsWith('@/') ||
    specifier.startsWith('/') ||
    specifier.startsWith('http://') ||
    specifier.startsWith('https://')
  ) {
    return null;
  }

  if (BUILTINS.has(specifier)) return null;
  if (specifier.startsWith('node:')) return null;

  if (specifier.startsWith('@')) {
    const [scope, name] = specifier.split('/');
    return scope && name ? `${scope}/${name}` : specifier;
  }

  return specifier.split('/')[0];
}

const usage = new Map();

for (const relDir of SCAN_DIRS) {
  const absDir = path.join(ROOT, relDir);
  for (const file of walk(absDir).filter((f) => CODE_EXTS.has(path.extname(f)))) {
    const source = fs.readFileSync(file, 'utf8');
    const specs = [
      ...source.matchAll(/from\s+['"]([^'"]+)['"]/g),
      ...source.matchAll(/import\s+['"]([^'"]+)['"]/g),
      ...source.matchAll(/require\(\s*['"]([^'"]+)['"]\s*\)/g),
    ].map((m) => m[1]);

    for (const specifier of specs) {
      const pkg = normalizePackage(specifier);
      if (!pkg) continue;

      if (!usage.has(pkg)) {
        usage.set(pkg, { src: 0, scripts: 0, files: new Set() });
      }

      const bucket = usage.get(pkg);
      if (relDir === 'src') bucket.src += 1;
      else bucket.scripts += 1;
      bucket.files.add(path.relative(ROOT, file));
    }
  }
}

const missing = [];
const misplaced = [];
for (const [pkg, meta] of usage.entries()) {
  if (!allDeclared.has(pkg)) {
    missing.push({ pkg, files: [...meta.files] });
    continue;
  }

  if (meta.src > 0 && !dependencies.has(pkg)) {
    misplaced.push({ pkg, expected: 'dependencies', files: [...meta.files] });
  }
}

const allowedUnused = new Set([
  'next',
  'react',
  'react-dom',
  'tailwindcss',
  'postcss',
  'autoprefixer',
  'typescript',
  'tsx',
  'prisma',
  '@types/node',
  '@types/react',
  '@types/react-dom',
]);

const unused = [...allDeclared]
  .filter((pkg) => !usage.has(pkg) && !allowedUnused.has(pkg))
  .sort();

if (missing.length) {
  console.error('Missing packages for imports:');
  for (const item of missing) {
    console.error(`- ${item.pkg}`);
    for (const file of item.files) console.error(`  • ${file}`);
  }
}

if (misplaced.length) {
  console.error('Packages used in src but not declared in dependencies:');
  for (const item of misplaced) {
    console.error(`- ${item.pkg} -> expected ${item.expected}`);
    for (const file of item.files) console.error(`  • ${file}`);
  }
}

if (unused.length) {
  console.warn('Declared packages currently unused (manual review advised):');
  for (const pkg of unused) console.warn(`- ${pkg}`);
}

if (!missing.length && !misplaced.length) {
  console.log('Dependency audit clean.');
}

console.log(JSON.stringify({
  importedPackages: [...usage.keys()].sort(),
  missingCount: missing.length,
  misplacedCount: misplaced.length,
  unusedCount: unused.length,
}, null, 2));

process.exit(missing.length || misplaced.length ? 1 : 0);
