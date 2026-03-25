import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const sourceRoots = fs.existsSync(path.join(root, "src"))
  ? [path.join(root, "src")]
  : ["app", "components", "lib", "modules"].map((dir) => path.join(root, dir)).filter((dir) => fs.existsSync(dir));
const files = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(fullPath);
    else if (/\.(ts|tsx)$/.test(entry.name)) files.push(fullPath);
  }
}

for (const sourceRoot of sourceRoots) walk(sourceRoot);

const matches = [];
for (const file of files) {
  const relativePath = path.relative(root, file);
  const content = fs.readFileSync(file, "utf8");
  const lines = content.split(/\r?\n/);
  lines.forEach((line, index) => {
    if (/\bany\b/.test(line)) {
      matches.push({ file: relativePath, line: index + 1, content: line.trim() });
    }
  });
}

if (matches.length > 0) {
  console.error("Explicit any audit failed.");
  for (const match of matches) {
    console.error(`- ${match.file}:${match.line} -> ${match.content}`);
  }
  process.exit(1);
}

console.log("Explicit any audit clean.");
console.log(JSON.stringify({ filesScanned: files.length, explicitAnyCount: 0 }, null, 2));
