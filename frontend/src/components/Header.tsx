import { useEffect, useState } from 'react';
import { checkHealth } from '../api/client';
import { IntegrationStatusBar } from './IntegrationStatusBar';
import { SynaptiqLogo } from './SynaptiqLogo';
import type { StackHealthSnapshot } from '../types';

export function Header() {
  const [online, setOnline] = useState<boolean | null>(null);
  const [stack, setStack] = useState<StackHealthSnapshot | undefined>();

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

  return (
    <header className="header">
      <div className="header-brand">
        <div className="header-logo" aria-hidden="true">
          <SynaptiqLogo size={38} />
        </div>
        <div>
          <div className="header-title">Synaptiq</div>
          <div className="header-subtitle">CBSE &amp; ICSE · Classes 6–12 AI tutor</div>
        </div>
      </div>
      <div className="header-status">
        {stack && <IntegrationStatusBar stack={stack} compact />}
        <div
          className={`status-pill ${online === false ? 'offline' : ''} ${online === null ? 'pending' : ''} ${stack?.ready ? 'status-pill-ready' : ''}`}
          title={online === false ? 'Connecting…' : stack?.ready ? 'Mastra, Qdrant, and Enkrypt are all live' : 'Some integrations need attention'}
        >
          {online === false
            ? 'Reconnecting…'
            : online === null
              ? 'Starting up…'
              : stack?.ready
                ? '🟢 All 3 integrations live ✓'
                : '🟡 Partial'}
        </div>
      </div>
    </header>
  );
}
