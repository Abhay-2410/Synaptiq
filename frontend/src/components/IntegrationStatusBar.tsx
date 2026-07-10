import type { StackHealthSnapshot } from '../types';

interface IntegrationStatusBarProps {
  stack?: StackHealthSnapshot;
  compact?: boolean;
}

const STATUS_DOT: Record<string, string> = {
  live: '🟢',
  degraded: '🟡',
  stub: '🟡',
  offline: '🔴',
};

const TOOLTIPS: Record<string, (stack: StackHealthSnapshot) => string> = {
  Mastra: (s) =>
    `Orchestrates retrieve → tutor → verify (${s.mastra.workflows.join(', ')})`,
  Qdrant: (s) =>
    `Searches ${s.qdrant.vectorCount} NCERT syllabus chunks via @mastra/qdrant`,
  Enkrypt: (s) =>
    `Live safety review before delivery (${s.enkrypt.policyName})`,
};

export function IntegrationStatusBar({ stack, compact }: IntegrationStatusBarProps) {
  if (!stack) return null;

  const items = [
    {
      label: 'Mastra',
      status: 'live' as const,
      detail: `${stack.mastra.workflows.length} workflow · ${stack.mastra.agents.length} agents`,
    },
    {
      label: 'Qdrant',
      status: stack.qdrant.status,
      detail: `${stack.qdrant.vectorCount} vectors`,
    },
    {
      label: 'Enkrypt',
      status: stack.enkrypt.status,
      detail: stack.enkrypt.policyName,
    },
  ];

  return (
    <div className={`integration-bar ${compact ? 'integration-bar-compact' : ''}`} role="status">
      {items.map((item) => (
        <span
          key={item.label}
          className={`integration-pill status-${item.status}`}
          title={TOOLTIPS[item.label]?.(stack) ?? item.detail}
        >
          {STATUS_DOT[item.status] ?? '⚪'} {item.label}
          {!compact && <span className="integration-pill-detail"> · {item.detail}</span>}
        </span>
      ))}
      {!stack.ready && (
        <span className="integration-warn" title={stack.warnings.join('\n')}>
          ⚠ Stack not fully live
        </span>
      )}
    </div>
  );
}
