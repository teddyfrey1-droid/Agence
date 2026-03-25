import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const ROOT = process.cwd();
const SRC = path.join(ROOT, 'src');
const EXTENSIONS = new Set(['.ts', '.tsx']);

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(fullPath));
    else files.push(fullPath);
  }
  return files;
}

function resolveImport(fromFile, specifier) {
  const candidates = [];
  if (specifier.startsWith('@/')) {
    const base = path.join(SRC, specifier.slice(2));
    candidates.push(base, `${base}.ts`, `${base}.tsx`, path.join(base, 'index.ts'), path.join(base, 'index.tsx'));
  } else if (specifier.startsWith('.')) {
    const base = path.resolve(path.dirname(fromFile), specifier);
    candidates.push(base, `${base}.ts`, `${base}.tsx`, path.join(base, 'index.ts'), path.join(base, 'index.tsx'));
  }

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

function sha(content) {
  return crypto.createHash('sha256').update(content).digest('hex');
}

const sourceFiles = walk(SRC).filter((file) => EXTENSIONS.has(path.extname(file)));
const importGraph = new Map();
const missingImports = [];
const duplicateContent = new Map();

for (const file of sourceFiles) {
  const content = fs.readFileSync(file, 'utf8');
  const hash = sha(content);
  if (!duplicateContent.has(hash)) duplicateContent.set(hash, []);
  duplicateContent.get(hash).push(file);

  const imports = new Set();
  for (const match of content.matchAll(/from\s+["']([^"']+)["']/g)) {
    const specifier = match[1];
    const resolved = resolveImport(file, specifier);
    if (resolved) imports.add(resolved);
    else if (specifier.startsWith('@/') || specifier.startsWith('.')) missingImports.push({ file, specifier });
  }
  importGraph.set(file, imports);
}

const roots = sourceFiles.filter((file) => file.includes(`${path.sep}app${path.sep}`) || file.endsWith(`${path.sep}middleware.ts`));
const reachable = new Set();
const stack = [...roots];

while (stack.length) {
  const current = stack.pop();
  if (!current || reachable.has(current)) continue;
  reachable.add(current);
  for (const imported of importGraph.get(current) ?? []) stack.push(imported);
}

const orphanFiles = sourceFiles.filter((file) => !reachable.has(file));
const duplicateFiles = [...duplicateContent.values()].filter((group) => group.length > 1);

console.log('Project audit summary');
console.log(`- Source files scanned: ${sourceFiles.length}`);
console.log(`- Missing local imports: ${missingImports.length}`);
console.log(`- Orphan source files: ${orphanFiles.length}`);
console.log(`- Duplicate-content groups: ${duplicateFiles.length}`);

if (missingImports.length) {
  console.log('\nMissing imports:');
  for (const item of missingImports) console.log(`  - ${path.relative(ROOT, item.file)} -> ${item.specifier}`);
}

if (orphanFiles.length) {
  console.log('\nOrphan files:');
  for (const file of orphanFiles) console.log(`  - ${path.relative(ROOT, file)}`);
}

if (duplicateFiles.length) {
  console.log('\nDuplicate groups:');
  for (const group of duplicateFiles) {
    console.log('  -');
    for (const file of group) console.log(`    * ${path.relative(ROOT, file)}`);
  }
}

if (missingImports.length || orphanFiles.length || duplicateFiles.length) {
  process.exit(1);
}
