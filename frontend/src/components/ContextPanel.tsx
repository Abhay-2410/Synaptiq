import { useState } from 'react';
import type { RetrievedChunk } from '../types';

interface ContextPanelProps {
  chunks: RetrievedChunk[];
}

export function ContextPanel({ chunks }: ContextPanelProps) {
  const [open, setOpen] = useState(false);

  if (!chunks.length) return null;

  return (
    <div>
      <button
        className={`panel-toggle ${open ? 'open' : ''}`}
        onClick={() => setOpen(!open)}
      >
        {open ? '▼' : '▶'} Textbook context ({chunks.length} source{chunks.length === 1 ? '' : 's'})
      </button>
      {open && (
        <div className="panel-content">
          {chunks.map((chunk) => (
            <div key={chunk.id} className="context-chunk">
              <div className="chunk-meta">
                {chunk.metadata.subject && (
                  <span className="chunk-tag">{chunk.metadata.subject}</span>
                )}
                {chunk.metadata.topic && (
                  <span className="chunk-tag">{chunk.metadata.topic}</span>
                )}
                <span className="chunk-score">score: {chunk.score.toFixed(2)}</span>
              </div>
              <div className="chunk-text">{chunk.content}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
