/** Generate OCR test fixtures if missing. Run: npx tsx scripts/generate-notes-fixtures.ts */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createCanvas } from '@napi-rs/canvas';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, 'fixtures', 'notes');

function writeCleanNotes(): void {
  const canvas = createCanvas(800, 400);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#fffef8';
  ctx.fillRect(0, 0, 800, 400);
  ctx.fillStyle = '#1a1a1a';
  ctx.font = '22px sans-serif';
  ctx.fillText('Photosynthesis', 40, 50);
  ctx.font = '16px sans-serif';
  const lines = [
    'Plants make food using sunlight, water and carbon dioxide.',
    'Chlorophyll in leaves absorbs light energy.',
    'Glucose is produced; oxygen is released as a by-product.',
    'Equation: 6CO2 + 6H2O + light → C6H12O6 + 6O2',
  ];
  lines.forEach((line, i) => ctx.fillText(line, 40, 100 + i * 36));
  fs.writeFileSync(path.join(outDir, 'clean-notes.png'), canvas.toBuffer('image/png'));
}

function writeBlurryNotes(): void {
  const canvas = createCanvas(400, 200);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#e8e4dc';
  ctx.fillRect(0, 0, 400, 200);
  ctx.fillStyle = '#888';
  ctx.font = '8px sans-serif';
  ctx.fillText('??? smudged illegible scribble', 20, 100);
  fs.writeFileSync(path.join(outDir, 'blurry-notes.png'), canvas.toBuffer('image/png'));
}

fs.mkdirSync(outDir, { recursive: true });
writeCleanNotes();
writeBlurryNotes();
console.log('Wrote clean-notes.png and blurry-notes.png to', outDir);
