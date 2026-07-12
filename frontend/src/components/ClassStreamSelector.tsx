import type { ClassLevel, StreamId } from '../api/client';
import { StickyNoteButton } from './StickyNoteButton';

const CLASS_OPTIONS: ClassLevel[] = [6, 7, 8, 9, 10, 11, 12];
const STREAM_OPTIONS: StreamId[] = ['pcm', 'pcb', 'commerce', 'humanities'];

const CLASS_COLORS: Record<ClassLevel, string> = {
  6: '#E8D66B',
  7: '#6FBF9E',
  8: '#C4A484',
  9: '#E8A87C',
  10: '#F2795B',
  11: '#9B8EC4',
  12: '#7FA8C9',
};

const STREAM_COLORS: Record<StreamId, string> = {
  pcm: '#E8D66B',
  pcb: '#6FBF9E',
  commerce: '#F2795B',
  humanities: '#C4866A',
};

function streamLabel(id: StreamId) {
  switch (id) {
    case 'pcm':
      return 'PCM';
    case 'pcb':
      return 'PCB';
    case 'commerce':
      return 'Commerce';
    case 'humanities':
      return 'Humanities';
  }
}

export function ClassStreamSelector({
  classLevel,
  streamId,
  onClassChange,
  onStreamChange,
  disabled = false,
}: {
  classLevel: ClassLevel;
  streamId?: StreamId;
  onClassChange: (c: ClassLevel) => void;
  onStreamChange: (s: StreamId) => void;
  disabled?: boolean;
}) {
  const showStream = classLevel >= 11;

  return (
    <div className="class-strip">
      <div className="selector-head">
        <span className="selector-accent">Class</span>
      </div>

      <div className="class-options">
        {CLASS_OPTIONS.map((c, index) => {
          const active = c === classLevel;
          return (
            <StickyNoteButton
              key={c}
              noteId={`class-${c}`}
              index={index}
              color={CLASS_COLORS[c]}
              active={active}
              disabled={disabled}
              className="class-tab"
              onClick={() => onClassChange(c)}
            >
              <span className="class-tab-label">{c}</span>
            </StickyNoteButton>
          );
        })}
      </div>

      {showStream && (
        <>
          <div className="selector-head" style={{ marginTop: '0.85rem' }}>
            <span className="selector-accent">My stream</span>
          </div>
          <div className="stream-options">
            {STREAM_OPTIONS.map((s, index) => {
              const active = s === streamId;
              return (
                <StickyNoteButton
                  key={s}
                  noteId={`stream-${s}`}
                  index={index}
                  color={STREAM_COLORS[s]}
                  active={active}
                  disabled={disabled}
                  className="stream-tab"
                  onClick={() => onStreamChange(s)}
                >
                  <span className="stream-tab-label">{streamLabel(s)}</span>
                </StickyNoteButton>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
