/**
 * Subject detection + PDF naming tests for notes pipeline.
 * Run: npx tsx scripts/test-notes-subject.ts
 */
import { detectNotesSubject, buildNotesPdfFileName, resolveNotesContext } from '../pipeline/notes/detect-subject.js';
import type { NotesStudyContext } from '../pipeline/notes/types.js';

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

const physicsText = `
Ohm's law states V = IR. Resistance R = 10 ohm. Voltage V = 5 volt.
Current flows in a circuit. Electric power P = VI.
`;

const bioText = `
Photosynthesis occurs in chloroplasts. Plants make food using sunlight.
Chlorophyll absorbs light. Carbon dioxide and water are raw materials.
`;

const cases: Array<{
  label: string;
  text: string;
  filename: string;
  context: NotesStudyContext;
  expectSubject: string;
  expectPdf: string;
}> = [
  {
    label: 'Photosynthesis fixture narrows to Biology',
    text: 'Photosynthesis is the process by which green plants convert light energy. Chlorophyll in chloroplast.',
    filename: 'typed-notes.pdf',
    context: { boardId: 'cbse', subjectId: 'science', classLevel: 10 },
    expectSubject: 'Biology',
    expectPdf: 'Biology-Class-10-Study-Notes.pdf',
  },
  {
    label: 'Physics notes with science chip selected',
    text: physicsText,
    filename: 'chapter-electricity.pdf',
    context: { boardId: 'cbse', subjectId: 'science', classLevel: 10 },
    expectSubject: 'Physics',
    expectPdf: 'Physics-Class-10-Study-Notes.pdf',
  },
  {
    label: 'Biology notes detected from content',
    text: bioText,
    filename: 'bio-notes.jpg',
    context: { boardId: 'cbse', subjectId: 'science', classLevel: 9 },
    expectSubject: 'Biology',
    expectPdf: 'Biology-Class-9-Study-Notes.pdf',
  },
  {
    label: 'Physics filename hint',
    text: 'Some lecture notes about motion.',
    filename: 'physics-ch3.pdf',
    context: { boardId: 'cbse', subjectId: 'physics', classLevel: 11, streamId: 'pcm' },
    expectSubject: 'Physics',
    expectPdf: 'Physics-Class-11-Study-Notes.pdf',
  },
];

console.log('Notes subject detection tests\n');

for (const c of cases) {
  const detection = detectNotesSubject(c.text, c.filename, c.context);
  const resolved = resolveNotesContext(c.text, c.filename, c.context);
  const built = buildNotesPdfFileName(detection.subjectLabel, c.context.classLevel);

  console.log(`── ${c.label}`);
  console.log(`   detected: ${detection.subjectLabel} (confidence ~${detection.confidence.toFixed(2)})`);
  console.log(`   pdf: ${resolved.pdfFileName}`);

  assert(detection.subjectLabel === c.expectSubject, `expected subject ${c.expectSubject}, got ${detection.subjectLabel}`);
  assert(resolved.pdfFileName === c.expectPdf, `expected pdf ${c.expectPdf}, got ${resolved.pdfFileName}`);
  assert(built === c.expectPdf, `buildNotesPdfFileName mismatch`);
  console.log('   ✓ pass\n');
}

console.log('PASS: subject detection and PDF naming\n');
