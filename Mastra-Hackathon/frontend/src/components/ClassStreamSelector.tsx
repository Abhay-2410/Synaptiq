import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import type { ClassLevel, StreamId } from '../api/client';

const CLASS_OPTIONS: ClassLevel[] = [6, 7, 8, 9, 10, 11, 12];
const STREAM_OPTIONS: StreamId[] = ['pcm', 'pcb', 'commerce', 'humanities'];

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
}: {
  classLevel: ClassLevel;
  streamId?: StreamId;
  onClassChange: (c: ClassLevel) => void;
  onStreamChange: (s: StreamId | undefined) => void;
}) {
  const showStream = classLevel >= 11;
  const [settleTick, setSettleTick] = useState(0);

  useEffect(() => {
    // tiny state bump to trigger CSS settle animation in a controlled way
    setSettleTick((t) => t + 1);
  }, [classLevel, streamId]);

  const tiltClass = useMemo(() => {
    return settleTick % 2 === 0 ? 'chip-settle' : 'chip-settle alt';
  }, [settleTick]);

  return (
    <div className="class-strip">
      <div className="selector-head">
        <span className="selector-accent">Class</span>
      </div>

      <div className="class-options">
        {CLASS_OPTIONS.map((c) => {
          const active = c === classLevel;
          return (
            <button
              key={c}
              type="button"
              className={`class-tab note-chip ${active ? 'active' : ''} ${tiltClass}`}
              style={
                {
                  '--subject-color': active ? '#E8D66B' : 'rgba(232, 214, 107, 0.25)',
                } as CSSProperties
              }
              onClick={() => {
                onClassChange(c);
                if (c < 11) onStreamChange(undefined);
              }}
            >
              {c}
            </button>
          );
        })}
      </div>

      {showStream && (
        <>
          <div className="selector-head" style={{ marginTop: '0.85rem' }}>
            <span className="selector-accent">My stream</span>
          </div>
          <div className="stream-options">
            {STREAM_OPTIONS.map((s) => {
              const active = s === streamId;
              return (
                <button
                  key={s}
                  type="button"
                  className={`stream-tab note-chip ${active ? 'active' : ''}`}
                  style={
                    {
                      '--subject-color': active ? '#F2795B' : 'rgba(242, 121, 91, 0.25)',
                    } as CSSProperties
                  }
                  onClick={() => onStreamChange(s)}
                >
                  {streamLabel(s)}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

