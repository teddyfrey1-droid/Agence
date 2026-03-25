import fs from 'fs';
import path from 'path';

const root = process.cwd();
const envPath = path.join(root, '.env');
const envExamplePath = path.join(root, '.env.example');

function parseEnv(content) {
  const values = {};
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    let value = trimmed.slice(eqIndex + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    values[key] = value;
  }
  return values;
}

const exampleEnv = fs.existsSync(envExamplePath)
  ? parseEnv(fs.readFileSync(envExamplePath, 'utf8'))
  : {};
const localEnv = fs.existsSync(envPath)
  ? parseEnv(fs.readFileSync(envPath, 'utf8'))
  : {};
const env = { ...exampleEnv, ...localEnv, ...process.env };

const issues = [];
const warnings = [];

const nodeMajor = Number(process.versions.node.split('.')[0]);
if (Number.isNaN(nodeMajor) || nodeMajor < 22) {
  issues.push(`Node.js ${process.versions.node} détecté. Le projet cible Node 22+.`);
}

for (const required of ['DATABASE_URL', 'APP_URL']) {
  if (!env[required]) issues.push(`${required} manquant.`);
}

const sessionSecret = env.SESSION_SECRET || env.NEXTAUTH_SECRET;
if (!sessionSecret) {
  issues.push('SESSION_SECRET ou NEXTAUTH_SECRET manquant.');
} else if (sessionSecret.length < 24) {
  warnings.push('Le secret de session est court. Utilise une valeur longue et aléatoire en prod.');
}

const storageDriver = (env.STORAGE_DRIVER || 'local').toLowerCase();
if (!['local', 's3'].includes(storageDriver)) {
  issues.push(`STORAGE_DRIVER invalide: ${storageDriver}. Attendu: local ou s3.`);
}

if (storageDriver === 's3') {
  for (const key of ['STORAGE_BUCKET', 'STORAGE_ENDPOINT', 'STORAGE_ACCESS_KEY', 'STORAGE_SECRET_KEY']) {
    if (!env[key]) issues.push(`${key} manquant pour STORAGE_DRIVER=s3.`);
  }
}

if ((env.NODE_ENV || 'development') === 'production' && storageDriver === 'local') {
  warnings.push('Production détectée avec STORAGE_DRIVER=local. Préfère un stockage objet compatible S3.');
}

if (!env.NEXT_PUBLIC_MAPBOX_TOKEN) {
  warnings.push('NEXT_PUBLIC_MAPBOX_TOKEN absent: la carte affichera le fallback non interactif.');
}

for (const file of ['package.json', 'tsconfig.json', 'prisma/schema.prisma']) {
  if (!fs.existsSync(path.join(root, file))) issues.push(`Fichier requis manquant: ${file}`);
}

console.log('Preflight summary');
console.log(`- Node: ${process.versions.node}`);
console.log(`- .env présent: ${fs.existsSync(envPath) ? 'oui' : 'non'}`);
console.log(`- Storage driver: ${storageDriver}`);
console.log(`- Mapbox token configuré: ${env.NEXT_PUBLIC_MAPBOX_TOKEN ? 'oui' : 'non'}`);
console.log(`- Issues: ${issues.length}`);
console.log(`- Warnings: ${warnings.length}`);

if (warnings.length) {
  console.log('\nWarnings:');
  for (const warning of warnings) console.log(`  - ${warning}`);
}

if (issues.length) {
  console.log('\nIssues:');
  for (const issue of issues) console.log(`  - ${issue}`);
  process.exit(1);
}
