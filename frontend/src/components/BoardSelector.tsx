import type { BoardId } from '../curriculum';
import { BOARD_META } from '../curriculum';
import { StickyNoteButton } from './StickyNoteButton';

const BOARD_COLOR = '#E8D66B';

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
        {(['cbse', 'icse'] as BoardId[]).map((board, index) => {
          const meta = BOARD_META[board];
          const active = board === boardId;
          return (
            <StickyNoteButton
              key={board}
              noteId={board}
              index={index}
              color={BOARD_COLOR}
              active={active}
              disabled={disabled}
              className="board-tab"
              title={`${meta.label} — ${meta.syllabus} syllabus`}
              onClick={() => onBoardChange(board)}
            >
              <span className="board-tab-label">{meta.label}</span>
              <span className="board-tab-sub">{meta.syllabus}</span>
            </StickyNoteButton>
          );
        })}
      </div>
    </div>
  );
}
