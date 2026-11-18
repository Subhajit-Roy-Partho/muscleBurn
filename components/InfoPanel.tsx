'use client';

import { useMemo, useState } from 'react';
import type { MuscleDef, Vec3 } from '@/data/types';
import { GROUP_LABELS, SIDE_LABELS } from '@/lib/muscleColors';

interface InfoPanelProps {
  muscles: MuscleDef[];
  selectedId: string | null;
  onSelect: (def: MuscleDef) => void;
  onFocus: (def: MuscleDef) => void;
}

const formatPoint = ([x, y, z]: Vec3): string =>
  `x ${x.toFixed(2)} · y ${y.toFixed(2)} · z ${z.toFixed(2)}`;

export default function InfoPanel({ muscles, selectedId, onSelect, onFocus }: InfoPanelProps) {
  const [query, setQuery] = useState('');
  const selected = muscles.find((m) => m.id === selectedId) ?? null;

  const results = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return [];
    return muscles
      .filter(
        (m) =>
          m.name.toLowerCase().includes(trimmed) ||
          GROUP_LABELS[m.group].toLowerCase().includes(trimmed) ||
          m.id.includes(trimmed),
      )
      .slice(0, 12);
  }, [muscles, query]);

  return (
    <div className="panel-body">
      <label className="search">
        <span className="search-label">Search muscles</span>
        <input
          type="search"
          value={query}
          placeholder="e.g. deltoid, thigh…"
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>

      {query.trim() ? (
        <ul className="search-results">
          {results.length === 0 ? (
            <li className="muted">No muscle matches “{query.trim()}”.</li>
          ) : (
            results.map((muscle) => (
              <li key={muscle.id}>
                <button
                  type="button"
                  className="result"
                  onClick={() => {
                    onSelect(muscle);
                    onFocus(muscle);
                    setQuery('');
                  }}
                >
                  <span>{muscle.name}</span>
                  <span className="muted">
                    {GROUP_LABELS[muscle.group]} · {SIDE_LABELS[muscle.side]}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      ) : null}

      {selected ? (
        <article className="muscle-detail">
          <header>
            <h2>{selected.name}</h2>
            <p className="pill-row">
              <span className="pill">{GROUP_LABELS[selected.group]}</span>
              <span className="pill">{SIDE_LABELS[selected.side]}</span>
            </p>
          </header>

          <dl>
            <dt>Origin</dt>
            <dd>{formatPoint(selected.origin)}</dd>
            <dt>Insertion</dt>
            <dd>{formatPoint(selected.insertion)}</dd>
            {selected.path?.length ? (
              <>
                <dt>Fiber path</dt>
                <dd>{selected.path.map(formatPoint).join(' → ')}</dd>
              </>
            ) : null}
            <dt>Action</dt>
            <dd>{selected.action}</dd>
            <dt>Innervation</dt>
            <dd>{selected.innervation}</dd>
          </dl>
        </article>
      ) : (
        <p className="muted empty">
          Hover a muscle for its name, click it (or use search) to pin its attachments,
          action and innervation here.
        </p>
      )}
    </div>
  );
}
