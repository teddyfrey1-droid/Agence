import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const SRC = path.join(ROOT, 'src');
const EXTENSIONS = new Set(['.ts', '.tsx']);
const FORBIDDEN_SPECIFIERS = new Set(['@prisma/client', '@/lib/prisma', 'fs', 'path', 'crypto']);

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

const issues = [];
for (const file of walk(SRC).filter((f) => EXTENSIONS.has(path.extname(f)))) {
  const content = fs.readFileSync(file, 'utf8');
  const trimmed = content.trimStart();
  const isClient = trimmed.startsWith('"use client"') || trimmed.startsWith("'use client'");
  if (!isClient) continue;

  for (const match of content.matchAll(/from\s+["']([^"']+)["']/g)) {
    const specifier = match[1];
    if (FORBIDDEN_SPECIFIERS.has(specifier)) {
      issues.push({ file: path.relative(ROOT, file), specifier });
    }
  }
}

console.log('Client boundary audit summary');
console.log(`- Issues: ${issues.length}`);
if (issues.length) {
  for (const issue of issues) {
    console.log(`  - ${issue.file} -> ${issue.specifier}`);
  }
  process.exit(1);
}
