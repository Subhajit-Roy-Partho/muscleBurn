'use client';

import { useState } from 'react';
import ViewerMount from '@/components/ViewerMount';
import InfoPanel from '@/components/InfoPanel';
import ExercisePanel from '@/components/ExercisePanel';
import { MUSCLES, getMuscle } from '@/data/muscles/placeholder';
import type { MuscleDef } from '@/data/types';
import type { FocusRequest } from '@/components/MuscleViewer';

type TabId = 'muscle' | 'exercises' | 'about';

const TABS: Array<{ id: TabId; label: string }> = [
  { id: 'muscle', label: 'Muscle' },
  { id: 'exercises', label: 'Exercises' },
  { id: 'about', label: 'About' },
];

export default function HomePage() {
  const [tab, setTab] = useState<TabId>('muscle');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [focusRequest, setFocusRequest] = useState<FocusRequest | null>(null);

  const selected: MuscleDef | undefined = getMuscle(selectedId);

  const handleSelect = (def: MuscleDef) => {
    setSelectedId(def.id);
    setTab('muscle');
  };

  const handleFocus = (def: MuscleDef) => {
    setSelectedId(def.id);
    setFocusRequest({ id: def.id, nonce: Date.now() });
  };

  return (
    <main className="app">
      <header className="site-header">
        <div>
          <h1>
            muscle<span className="accent">Burn</span>
          </h1>
          <p className="tagline">
            Interactive 3D muscle viewer — attachments, actions, innervation, and how form
            variations shift the demand.
          </p>
        </div>
        <p className="disclaimer">
          Educational reference only. Not medical advice, diagnosis, or a training
          prescription.
        </p>
      </header>

      <section className="workspace">
        <div className="stage">
          <ViewerMount
            muscles={MUSCLES}
            selectedId={selectedId}
            onSelect={handleSelect}
            focusRequest={focusRequest}
          />
          <p className="stage-hint">
            Drag to orbit · scroll/pinch to zoom · right-drag or two-finger drag to pan ·
            click a muscle to pin it
          </p>
        </div>

        <aside className="side-panel">
          <nav className="tabs" role="tablist" aria-label="Side panel">
            {TABS.map((entry) => (
              <button
                key={entry.id}
                type="button"
                role="tab"
                aria-selected={tab === entry.id}
                className={tab === entry.id ? 'tab tab-active' : 'tab'}
                onClick={() => setTab(entry.id)}
              >
                {entry.label}
              </button>
            ))}
          </nav>

          {tab === 'muscle' ? (
            <InfoPanel
              muscles={MUSCLES}
              selectedId={selected ? selected.id : null}
              onSelect={handleSelect}
              onFocus={handleFocus}
            />
          ) : null}
          {tab === 'exercises' ? <ExercisePanel /> : null}
          {tab === 'about' ? (
            <div className="panel-body about">
              <h2>About this build</h2>
              <p>
                A static Next.js (App Router) app that renders each muscle as a swept
                Catmull-Rom fiber with parallel-transport frames, a tapered elliptical
                cross-section, and a procedural striation texture.
              </p>
              <p>
                Muscle, exercise, and reference records are typed in <code>src/data/</code>.
                The current anatomy is an approximation meant to validate the viewer
                pipeline; exercise effects are placeholders rather than measured values.
              </p>
              <h3>Data notes</h3>
              <ul>
                <li>Body space: y up, floor at y = 0, height ≈ 1.8, +x = subject’s right, +z = anterior.</li>
                <li>Each fiber: origin, optional intermediate path points, insertion, radius, flatten.</li>
                <li>Citations live in <code>src/data/references.ts</code>; never invent a DOI.</li>
              </ul>
              <h3>License</h3>
              <p>
                Source released under the GNU Affero General Public License v3.0 (AGPL-3.0);
                see <code>LICENSE</code>. Educational use only, with no warranty of
                anatomical accuracy.
              </p>
            </div>
          ) : null}
        </aside>
      </section>

      <footer className="site-footer">
        <span>muscleBurn · placeholder anatomy data</span>
        <span>AGPL-3.0 · not medical advice</span>
      </footer>
    </main>
  );
}
