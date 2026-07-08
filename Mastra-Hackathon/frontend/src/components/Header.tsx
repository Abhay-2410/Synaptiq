import { useEffect, useState } from 'react';
import { checkHealth } from '../api/client';

export function Header() {
  const [online, setOnline] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        await checkHealth();
        if (!cancelled) setOnline(true);
      } catch {
        if (!cancelled) setOnline(false);
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
          ✦
        </div>
        <div>
          <div className="header-title">Synaptiq</div>
          <div className="header-subtitle">Your friendly study buddy · CBSE Classes 6–12</div>
        </div>
      </div>
      <div
        className={`status-pill ${online === false ? 'offline' : ''} ${online === null ? 'pending' : ''}`}
        title={online === false ? 'Connecting…' : 'Ready to learn'}
      >
        {online === false ? 'Reconnecting…' : online === null ? 'Starting up…' : '🟢 Ready'}
      </div>
    </header>
  );
}
