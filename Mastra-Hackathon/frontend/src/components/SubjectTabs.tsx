import type { CSSProperties } from 'react';
import {
  getSubjectMeta,
  SUBJECT_GROUPS,
  type SubjectKey,
} from '../curriculum';
import type { MasteryState } from '../types';

interface SubjectTabsProps {
  selected: SubjectKey;
  onSelect: (id: SubjectKey) => void;
  masteryBySubject: Partial<Record<SubjectKey, MasteryState>>;
  subjects: SubjectKey[];
  streamSubjects?: SubjectKey[];
}

function SubjectButton({
  subjectKey,
  active,
  mastery,
  onSelect,
}: {
  subjectKey: SubjectKey;
  active: boolean;
  mastery?: MasteryState;
  onSelect: (id: SubjectKey) => void;
}) {
  const subject = getSubjectMeta(subjectKey);
  const fill = mastery?.score ?? 0;

  return (
    <button
      type="button"
      className={`subject-tab ${active ? 'active' : ''}`}
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
  selected,
  onSelect,
  masteryBySubject,
  subjects,
  streamSubjects = [],
}: SubjectTabsProps) {
  const useGroups = subjects.length > 4;

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
          />
        ))}
      </nav>
    );
  }

  return (
    <nav className="subject-tabs grouped" aria-label="All subjects">
      <p className="subject-tabs-hint">All Class 11–12 NCERT subjects</p>
      {SUBJECT_GROUPS.map((group) => {
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
