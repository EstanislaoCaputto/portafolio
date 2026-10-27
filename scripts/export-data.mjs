import { readFile, writeFile } from 'node:fs/promises';

// Copia el seed a public/portfolio.json para que el sitio publicado ofrezca los
// datos también como archivo estático, sin depender de ejecutar JavaScript.
const seedUrl = new URL('../src/data/seed.json', import.meta.url);
const outputUrl = new URL('../public/portfolio.json', import.meta.url);

const seed = JSON.parse(await readFile(seedUrl, 'utf8'));
await writeFile(outputUrl, `${JSON.stringify(seed, null, 2)}\n`, 'utf8');

process.stdout.write('portfolio.json actualizado desde src/data/seed.json\n');
