'use client';
import { useEffect } from 'react';
import type { Link } from '@/lib/types';

interface Options {
  links: Link[];
  selectedId: string | null;
  enabled: boolean;
}

export function useLeaderLines({ links, selectedId, enabled }: Options) {
  useEffect(() => {
    if (!enabled) return;
    let mounted = true;
    const drawn: any[] = [];
    let reposition: (() => void) | null = null;

    (async () => {
      let LeaderLineClass: any;
      try {
        const mod = await import('leader-line');
        LeaderLineClass = (mod as any).default ?? mod;
      } catch (e) {
        console.warn('leader-line не загружен', e);
        return;
      }
      if (!mounted) return;

      const visible = links.filter(
        (l) => l.type === 'primary' ||
          (l.type === 'secondary' && selectedId && (l.source === selectedId || l.target === selectedId))
      );

      for (const link of visible) {
        const src = document.getElementById(`card-${link.source}`);
        const tgt = document.getElementById(`card-${link.target}`);
        if (!src || !tgt || src === tgt) continue;

        const isPrimary = link.type === 'primary';
        try {
          const line = new LeaderLineClass(src, tgt, {
            color: isPrimary ? '#22c55e' : '#eab308',
            size: isPrimary ? 3 : 2,
            opacity: isPrimary ? 0.9 : 0.35,
            path: 'grid',
            startPlug: 'disc',
            endPlug: 'arrow3',
            endPlugSize: isPrimary ? 1.4 : 1,
            dash: isPrimary ? false : { len: 6, gap: 4 },
            zIndex: 20,
          });
          drawn.push(line);
        } catch (e) {
          console.warn(e);
        }
      }

      reposition = () => drawn.forEach((l) => { try { l.position(); } catch {} });
      window.addEventListener('scroll', reposition, true);
      window.addEventListener('resize', reposition);
    })();

    return () => {
      mounted = false;
      if (reposition) {
        window.removeEventListener('scroll', reposition, true);
        window.removeEventListener('resize', reposition);
      }
      drawn.forEach((l) => { try { l.remove(); } catch {} });
    };
  }, [links, selectedId, enabled]);
}