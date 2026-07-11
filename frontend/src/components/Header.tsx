import { useEffect, useState } from 'react';
import { checkHealth } from '../api/client';
import { IntegrationStatusBar } from './IntegrationStatusBar';
import { SynaptiqLogo } from './SynaptiqLogo';
import type { StackHealthSnapshot } from '../types';
import { isTouchMobile } from '../utils/device';

export function Header() {
  const [online, setOnline] = useState<boolean | null>(null);
  const [stack, setStack] = useState<StackHealthSnapshot | undefined>();
  const [compact, setCompact] = useState(isTouchMobile);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 720px)');
    const update = () => setCompact(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const health = await checkHealth();
        if (!cancelled) {
          setOnline(true);
          setStack(health.stack);
        }
      } catch {
        if (!cancelled) {
          setOnline(false);
          setStack(undefined);
        }
      }
    }

    poll();
    const id = setInterval(poll, 15000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const statusLabel =
    online === false
      ? 'Offline'
      : online === null
        ? '…'
        : stack?.ready
          ? compact
            ? '🟢 Live'
            : '🟢 All integrations live ✓'
          : compact
            ? '🟡 Partial'
            : '🟡 Partial';

  return (
    <header className="header">
      <div className="header-brand">
        <div className="header-logo" aria-hidden="true">
          <SynaptiqLogo size={38} />
        </div>
        <div className="header-brand-text">
          <div className="header-title">Synaptiq</div>
          {!compact && (
            <div className="header-subtitle">CBSE &amp; ICSE · Classes 6–12 AI tutor</div>
          )}
        </div>
      </div>
      <div className="header-status">
        {stack && !compact && <IntegrationStatusBar stack={stack} compact />}
        <div
          className={`status-pill ${online === false ? 'offline' : ''} ${online === null ? 'pending' : ''} ${stack?.ready ? 'status-pill-ready' : ''}`}
          title={
            online === false
              ? 'Connecting…'
              : stack?.ready
                ? 'Mastra, Qdrant, Enkrypt, and Groq are all live'
                : 'Some integrations need attention'
          }
        >
          {statusLabel}
        </div>
      </div>
    </header>
  );
}
