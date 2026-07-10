import type { CSSProperties } from 'react';
import {
  getBoardMeta,
  getSubjectMeta,
  subjectGroups,
  type BoardId,
  type ClassLevel,
  type SubjectKey,
} from '../curriculum';
import type { MasteryState } from '../types';

interface SubjectTabsProps {
  boardId: BoardId;
  classLevel: ClassLevel;
  selected: SubjectKey;
  onSelect: (id: SubjectKey) => void;
  masteryBySubject: Partial<Record<SubjectKey, MasteryState>>;
  subjects: SubjectKey[];
  streamSubjects?: SubjectKey[];
  disabled?: boolean;
}

function SubjectButton({
  subjectKey,
  active,
  mastery,
  onSelect,
  disabled,
}: {
  subjectKey: SubjectKey;
  active: boolean;
  mastery?: MasteryState;
  onSelect: (id: SubjectKey) => void;
  disabled?: boolean;
}) {
  const subject = getSubjectMeta(subjectKey);
  const fill = mastery?.score ?? 0;

  return (
    <button
      type="button"
      className={`subject-tab ${active ? 'active' : ''}`}
      disabled={disabled}
      style={
        {
          '--subject-color': subject.color,
          '--mastery-fill': `${fill}%`,
        } as CSSProperties
      }
      onClick={() => onSelect(subjectKey)}
      title={subject.label}
    >
      <span className="subject-tab-label">{subject.label}</span>
    </button>
  );
}

export function SubjectTabs({
  boardId,
  classLevel,
  selected,
  onSelect,
  masteryBySubject,
  subjects,
  streamSubjects = [],
  disabled = false,
}: SubjectTabsProps) {
  const groups = subjectGroups(boardId, classLevel);
  const useGroups = subjects.length > 4 || groups.length > 1;
  const syllabus = getBoardMeta(boardId).syllabus;

  if (!useGroups) {
    return (
      <nav className="subject-tabs" aria-label="Subjects">
        {subjects.map((key) => (
          <SubjectButton
            key={key}
            subjectKey={key}
            active={key === selected}
            mastery={masteryBySubject[key]}
            onSelect={onSelect}
            disabled={disabled}
          />
        ))}
      </nav>
    );
  }

  return (
    <nav className="subject-tabs grouped" aria-label="All subjects">
      <p className="subject-tabs-hint">
        {classLevel >= 11
          ? `All Class 11–12 ${syllabus} subjects`
          : boardId === 'icse'
            ? 'ICSE junior subjects'
            : 'Subjects'}
      </p>
      {groups.map((group) => {
        const keys = group.keys.filter((k) => subjects.includes(k));
        if (keys.length === 0) return null;

        return (
          <div key={group.label} className="subject-group">
            <div className="subject-group-label">{group.label}</div>
            {keys.map((key) => (
              <SubjectButton
                key={key}
                subjectKey={key}
                active={key === selected}
                mastery={masteryBySubject[key]}
                onSelect={onSelect}
                disabled={disabled}
              />
            ))}
          </div>
        );
      })}
      {streamSubjects.length > 0 && (
        <p className="subject-stream-note">
          Stream picks: {streamSubjects.map((k) => getSubjectMeta(k).label).join(', ')}
        </p>
      )}
    </nav>
  );
}
