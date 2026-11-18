'use client';

import { useMemo, useState } from 'react';
import {
  getStructure,
  STRUCTURE_COUNTS,
  STRUCTURES,
  type Region,
  type StructureInfo,
} from '@/data/anatomy';
import { lookupMuscleMeta } from '@/data/muscles/meta';
import { REGION_LABELS, SIDE_LABELS } from '@/lib/muscleColors';
import { formatPoint, getDerivedAttachments } from '@/lib/modelRegistry';

interface InfoPanelProps {
  selectedKey: string | null;
  onSelect: (key: string) => void;
  onFocus: (key: string) => void;
}

const LAYER_LABELS: Record<StructureInfo['layer'], string> = {
  skeleton: 'Skeleton',
  deep: 'Deep layer',
  superficial: 'Superficial layer',
};

const regionLabel = (structure: StructureInfo): string =>
  structure.region ? REGION_LABELS[structure.region] : 'Skeleton';

const matches = (structure: StructureInfo, needle: string): boolean => {
  const haystack = [
    structure.name,
    structure.region ? REGION_LABELS[structure.region] : 'skeleton',
    structure.group ?? '',
    structure.fma ?? '',
    structure.layer,
  ]
    .join(' ')
    .toLowerCase();
  return haystack.includes(needle);
};

export default function InfoPanel({ selectedKey, onSelect, onFocus }: InfoPanelProps) {
  const [query, setQuery] = useState('');
  const selected = getStructure(selectedKey);
  const meta = selected && !selected.isBone ? lookupMuscleMeta(selected.name) : null;
  const derived = selected && !selected.isBone ? getDerivedAttachments(selected.key) : null;

  const results = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return [];
    return STRUCTURES.filter((structure) => matches(structure, trimmed)).slice(0, 14);
  }, [query]);

  return (
    <div className="panel-body">
      <label className="search">
        <span className="search-label">Search {STRUCTURE_COUNTS.total} structures</span>
        <input
          type="search"
          value={query}
          placeholder="e.g. deltoid, femur, thigh…"
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>

      {query.trim() ? (
        <ul className="search-results">
          {results.length === 0 ? (
            <li className="muted">No structure matches “{query.trim()}”.</li>
          ) : (
            results.map((structure) => (
              <li key={structure.key}>
                <button
                  type="button"
                  className="result"
                  onClick={() => {
                    onSelect(structure.key);
                    onFocus(structure.key);
                    setQuery('');
                  }}
                >
                  <span>{structure.name}</span>
                  <span className="muted">
                    {regionLabel(structure)} · {SIDE_LABELS[structure.side]}
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
              <span className="pill">{regionLabel(selected)}</span>
              <span className="pill">{SIDE_LABELS[selected.side]}</span>
              <span className="pill">{LAYER_LABELS[selected.layer]}</span>
            </p>
          </header>

          <div className="detail-actions">
            <button type="button" className="chip" onClick={() => onFocus(selected.key)}>
              focus
            </button>
            {selected.fma ? <span className="pill pill-mono">{selected.fma}</span> : null}
            {selected.group ? <span className="pill">{selected.group}</span> : null}
          </div>

          {selected.isBone ? (
            <p className="muted empty">
              Skeletal structure. Attachments are recorded on the muscles that attach to
              it; select a muscle to read them.
            </p>
          ) : (
            <dl>
              <dt>Origin</dt>
              <dd>
                {meta ? (
                  meta.origin
                ) : derived ? (
                  <>
                    {formatPoint(derived.origin)} <em className="derived-badge">(derived)</em>
                  </>
                ) : (
                  <span className="missing">Origin not yet documented for this muscle.</span>
                )}
              </dd>

              <dt>Insertion</dt>
              <dd>
                {meta ? (
                  meta.insertion
                ) : derived ? (
                  <>
                    {formatPoint(derived.insertion)} <em className="derived-badge">(derived)</em>
                  </>
                ) : (
                  <span className="missing">Insertion not yet documented for this muscle.</span>
                )}
              </dd>

              <dt>Action</dt>
              <dd>
                {meta ? (
                  meta.action
                ) : (
                  <span className="missing">Action not yet documented for this muscle.</span>
                )}
              </dd>

              <dt>Innervation</dt>
              <dd>
                {meta ? (
                  meta.innervation
                ) : (
                  <span className="missing">
                    Innervation not yet documented for this muscle.
                  </span>
                )}
              </dd>
            </dl>
          )}

          {selected.isBone && selected.tissue ? (
            <p className="muted fineprint">Tissue: {selected.tissue}</p>
          ) : null}
          {!meta && !selected.isBone ? (
            <p className="muted fineprint">
              Attachment coordinates marked <em className="derived-badge">(derived)</em> are
              the ends of the mesh&apos;s longest axis, not dissected attachment sites. The
              curated record covers the major muscles only.
            </p>
          ) : null}
        </article>
      ) : (
        <p className="muted empty">
          Hover a muscle for its name, then click it (or use search) to pin its region,
          attachments, action and innervation here.
        </p>
      )}
    </div>
  );
}
