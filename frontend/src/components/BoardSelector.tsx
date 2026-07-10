import type { CSSProperties } from 'react';
import type { BoardId } from '../curriculum';
import { BOARD_META } from '../curriculum';

export function BoardSelector({
  boardId,
  onBoardChange,
  disabled = false,
}: {
  boardId: BoardId;
  onBoardChange: (board: BoardId) => void;
  disabled?: boolean;
}) {
  return (
    <div className="board-strip">
      <div className="selector-head">
        <span className="selector-accent">Board</span>
      </div>
      <div className="board-options">
        {(['cbse', 'icse'] as BoardId[]).map((board) => {
          const meta = BOARD_META[board];
          const active = board === boardId;
          return (
            <button
              key={board}
              type="button"
              className={`board-tab note-chip ${active ? 'active' : ''}`}
              disabled={disabled}
              title={`${meta.label} — ${meta.syllabus} syllabus`}
              style={
                {
                  '--subject-color': active ? '#E8D66B' : 'rgba(232, 214, 107, 0.25)',
                } as CSSProperties
              }
              onClick={() => onBoardChange(board)}
            >
              <span className="board-tab-label">{meta.label}</span>
              <span className="board-tab-sub">{meta.syllabus}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
