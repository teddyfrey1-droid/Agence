import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const ts = require('typescript');

const ROOT = process.cwd();
const SRC = path.join(ROOT, 'src');
const EXTENSIONS = new Set(['.ts', '.tsx']);

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

const files = walk(SRC).filter((f) => EXTENSIONS.has(path.extname(f)));
const issues = [];

for (const file of files) {
  const source = fs.readFileSync(file, 'utf8');
  const result = ts.transpileModule(source, {
    fileName: file,
    reportDiagnostics: true,
    compilerOptions: {
      jsx: ts.JsxEmit.ReactJSX,
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
    },
  });

  for (const diagnostic of result.diagnostics ?? []) {
    if (diagnostic.category !== ts.DiagnosticCategory.Error) continue;
    issues.push({
      file: path.relative(ROOT, file),
      code: diagnostic.code,
      message: ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'),
    });
  }
}

console.log('TS syntax audit summary');
console.log(`- Source files scanned: ${files.length}`);
console.log(`- Syntax issues: ${issues.length}`);
if (issues.length) {
  for (const issue of issues) {
    console.log(`  - ${issue.file} [TS${issue.code}] ${issue.message}`);
  }
  process.exit(1);
}
