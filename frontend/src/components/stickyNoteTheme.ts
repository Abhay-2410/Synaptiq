const NOTE_TILTS = [-2, 1.8, -1.4, 2, -1.7, 1.3, -0.9, 1.6] as const;

const PAPER_RADIUS = [
  '2px 4px 3px 2px',
  '3px 2px 4px 2px',
  '2px 3px 2px 4px',
  '4px 2px 3px 3px',
  '2px 4px 4px 2px',
  '3px 3px 2px 4px',
] as const;

export const PAPERCLIP_PATH =
  'M7.2 1.4C3.1 1.4 1.6 4.6 1.6 7.8v11.8c0 3.2 2.7 5.2 5.6 5.2 2.8 0 4.7-1.9 4.7-4.4 0-2.4-2-4-4-4-1.7 0-3 1.1-3 2.7 0 1.4 1.2 2.4 2.6 2.4 1.1 0 2-.7 2-1.8 0-.9-.8-1.5-1.7-1.5-.6 0-1.1.3-1.1.8';

function noteHash(noteId: string, index: number): number {
  let hash = index * 31;
  for (let i = 0; i < noteId.length; i += 1) {
    hash = (hash + noteId.charCodeAt(i) * (i + 7)) | 0;
  }
  return Math.abs(hash);
}

export function getNoteTilt(noteId: string, index: number): number {
  return NOTE_TILTS[noteHash(noteId, index) % NOTE_TILTS.length];
}

export function getPaperRadius(noteId: string, index: number): string {
  return PAPER_RADIUS[noteHash(noteId, index) % PAPER_RADIUS.length];
}

export function getRuleSkew(noteId: string, index: number): number {
  const skews = [-0.4, 0.3, -0.2, 0.45, -0.35, 0.25];
  return skews[noteHash(noteId, index) % skews.length];
}

export function getNoteInkColor(noteColor: string): { main: string; sub: string } {
  const hex = noteColor.replace('#', '').toLowerCase();

  if (hex.startsWith('9b8e')) {
    return { main: '#261e34', sub: '#403050' };
  }
  if (hex.startsWith('6fbf') || hex.startsWith('7fa8')) {
    return { main: '#142420', sub: '#2a3f38' };
  }
  if (hex.startsWith('f279') || hex.startsWith('c486') || hex.startsWith('e8a8')) {
    return { main: '#2a160f', sub: '#452a22' };
  }
  if (hex.startsWith('c4a4') || hex.startsWith('d4a5')) {
    return { main: '#261c12', sub: '#3f3024' };
  }

  return { main: '#241f0f', sub: '#3d3518' };
}

export function getPaperclipColors(noteColor: string): { dark: string; light: string } {
  const hex = noteColor.replace('#', '').toLowerCase();

  if (hex.startsWith('6fbf') || hex.startsWith('7fa8')) {
    return { dark: '#2A5F52', light: '#6BB89A' };
  }
  if (hex.startsWith('9b8e')) {
    return { dark: '#4a3d62', light: '#b8a8d8' };
  }
  if (hex.startsWith('f279') || hex.startsWith('c486') || hex.startsWith('e8a8')) {
    return { dark: '#8B3D30', light: '#E8957A' };
  }
  if (hex.startsWith('c4a4') || hex.startsWith('d4a5')) {
    return { dark: '#6B4E38', light: '#C9A070' };
  }

  return { dark: '#7A6422', light: '#D4BC5A' };
}

export function getClipSide(index: number): 'left' | 'right' {
  return index % 2 === 0 ? 'left' : 'right';
}

export function getFoldCorner(index: number): 'bl' | 'br' {
  return index % 2 === 0 ? 'br' : 'bl';
}
