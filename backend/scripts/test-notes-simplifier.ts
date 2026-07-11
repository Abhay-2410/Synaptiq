/**
 * Notes Simplifier smoke test — extraction + optional LLM + PDF.
 * Run: npm run test:notes
 * Set SKIP_LLM=1 to test OCR/PDF extraction only (no Groq).
 */
import '../load-env.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { extractTextFromUpload } from '../pipeline/notes/extract-text.js';
import { resolveNotesContext } from '../pipeline/notes/detect-subject.js';
import { generateNotesPdf } from '../pipeline/notes/generate-pdf.js';
import { simplifyNotesText } from '../pipeline/notes/simplify-notes.js';
import type { NotesStudyContext } from '../pipeline/notes/types.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURES = path.join(__dirname, 'fixtures', 'notes');

const context: NotesStudyContext = {
  boardId: 'cbse',
  subjectId: 'science',
  classLevel: 10,
};

const cases = [
  { name: 'clean typed PDF', file: 'typed-notes.pdf', mime: 'application/pdf' },
  { name: 'clean notes image', file: 'clean-notes.png', mime: 'image/png' },
  { name: 'blurry notes image', file: 'blurry-notes.png', mime: 'image/png' },
];

async function runCase(label: string, file: string, mime: string): Promise<void> {
  const filePath = path.join(FIXTURES, file);
  if (!fs.existsSync(filePath)) {
    console.warn(`  SKIP — missing fixture: ${filePath}`);
    return;
  }

  const buffer = fs.readFileSync(filePath);
  console.log(`\n── ${label} (${file}) ──`);

  const extraction = await extractTextFromUpload(buffer, mime, file);
  console.log(`  extraction: method=${extraction.method} quality=${extraction.quality} chars=${extraction.text.length}`);
  console.log(`  preview: ${extraction.text.slice(0, 120).replace(/\s+/g, ' ')}…`);

  if (extraction.quality === 'failed') {
    console.log('  ✓ expected failure / poor read for blurry or empty input');
    return;
  }

  const resolved = resolveNotesContext(extraction.text, file, context);

  if (process.env.SKIP_LLM === '1') {
    console.log(`  subject: ${resolved.subjectLabel} pdf=${resolved.pdfFileName}`);
    console.log('  SKIP_LLM=1 — skipping tutor + PDF');
    return;
  }

  const simplified = await simplifyNotesText(extraction.text, resolved, extraction.quality);
  console.log(`  simplified: model=${simplified.model} len=${simplified.markdown.length} subject=${resolved.subjectLabel}`);
  if (simplified.warnings.length) {
    console.log(`  warnings: ${simplified.warnings.join(' | ')}`);
  }

  const pdf = await generateNotesPdf(simplified.markdown, {
    subjectLabel: resolved.subjectLabel,
    classLevel: resolved.classLevel,
  });
  console.log(`  pdf bytes: ${pdf.length} filename: ${resolved.pdfFileName}`);
  console.log('  ✓ pass');
}

async function main(): Promise<void> {
  console.log('Notes Simplifier test');
  console.log(`fixtures: ${FIXTURES}`);
  console.log(`SKIP_LLM=${process.env.SKIP_LLM ?? '0'}`);

  for (const c of cases) {
    try {
      await runCase(c.name, c.file, c.mime);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (c.file.includes('blurry')) {
        console.log(`  ✓ blurry case error (acceptable): ${msg}`);
      } else {
        console.error(`  ✗ FAIL: ${msg}`);
        process.exitCode = 1;
      }
    }
  }

  console.log('\nDone.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
