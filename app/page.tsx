'use client';

import { useMemo, useState } from 'react';
import ViewerMount from '@/components/ViewerMount';
import InfoPanel from '@/components/InfoPanel';
import ExercisePanel from '@/components/ExercisePanel';
import ReferencesPanel from '@/components/ReferencesPanel';
import type { FocusRequest } from '@/components/MuscleViewer';
import { STRUCTURE_COUNTS } from '@/data/anatomy';
import { getExercise } from '@/data/exercises';
import { buildActivationMap, heatRampGradient } from '@/lib/heatmap';

type TabId = 'muscle' | 'exercises' | 'about';

const TABS: Array<{ id: TabId; label: string }> = [
  { id: 'muscle', label: 'Muscle' },
  { id: 'exercises', label: 'Exercises' },
  { id: 'about', label: 'About' },
];

export default function HomePage() {
  const [tab, setTab] = useState<TabId>('muscle');
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [focusRequest, setFocusRequest] = useState<FocusRequest | null>(null);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);
  const [selectedVariationId, setSelectedVariationId] = useState<string | null>(null);
  const [legendHidden, setLegendHidden] = useState(false);

  const handleSelect = (key: string | null) => {
    setSelectedKey(key);
    if (key) setTab('muscle');
  };

  const handleFocus = (key: string) => {
    setSelectedKey(key);
    setFocusRequest({ key, nonce: Date.now() });
  };

  const selectedExercise = selectedExerciseId ? getExercise(selectedExerciseId) : undefined;

  /**
   * Base-name → 0..1 activation map for the exercise on the stage. An exercise
   * whose research labels resolve to no atlas structure yields `null` (normal
   * region colours) rather than an all-dim body with no highlighted muscle.
   */
  const activation = useMemo(() => {
    if (!selectedExercise) return null;
    const map = buildActivationMap(selectedExercise, selectedVariationId ?? undefined);
    return map.size > 0 ? Object.fromEntries(map) : null;
  }, [selectedExercise, selectedVariationId]);

  const showLegend = Boolean(selectedExercise) && Boolean(activation) && !legendHidden;

  const handleSelectExercise = (exerciseId: string | null) => {
    setSelectedExerciseId(exerciseId);
    setSelectedVariationId(null);
    setLegendHidden(false);
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
          <div className="stage-frame">
            <ViewerMount
              selectedKey={selectedKey}
              onSelect={handleSelect}
              focusRequest={focusRequest}
              activation={activation}
            />
            {showLegend ? (
              <div
                className="stage-legend"
                role="group"
                aria-label="Activation heat map legend"
              >
                <div className="stage-legend-head">
                  <span>Activation</span>
                  <button
                    type="button"
                    className="stage-legend-dismiss"
                    onClick={() => setLegendHidden(true)}
                    aria-label="Hide activation legend"
                  >
                    ×
                  </button>
                </div>
                <span
                  className="stage-legend-bar"
                  style={{ background: heatRampGradient() }}
                  aria-hidden="true"
                />
                <div className="stage-legend-scale">
                  <span>Low</span>
                  <span>High</span>
                </div>
                <p className="stage-legend-note">
                  Relative score, group means · {selectedExercise?.name}
                </p>
              </div>
            ) : null}
          </div>
          <p className="stage-hint">
            Drag to orbit · scroll/pinch to zoom · right-drag or two-finger drag to pan ·
            click a structure to pin it — click empty space to deselect
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
              selectedKey={selectedKey}
              onSelect={handleSelect}
              onFocus={handleFocus}
            />
          ) : null}
          {tab === 'exercises' ? (
            <ExercisePanel
              selectedExerciseId={selectedExerciseId}
              selectedVariationId={selectedVariationId}
              onSelectExercise={handleSelectExercise}
              onSelectVariation={(_exerciseId, variationId) =>
                setSelectedVariationId(variationId)
              }
            />
          ) : null}
          {tab === 'about' ? (
            <div className="panel-body about">
              <h2>About this build</h2>
              <p>
                A static Next.js (App Router) app wrapped around the Écorché full-body atlas:
                one named mesh per anatomical structure, loaded as a meshopt-compressed glTF
                and shaded by body region.
              </p>
              <p>
                The model carries {STRUCTURE_COUNTS.total} structures —{' '}
                {STRUCTURE_COUNTS.bones} skeletal, {STRUCTURE_COUNTS.deep} deep and{' '}
                {STRUCTURE_COUNTS.superficial} superficial muscle meshes. Attachment text is
                curated for the muscles most often looked up; for the rest the two ends of
                the mesh are shown and labelled <em>(derived)</em>.
              </p>
              <h3>Data notes</h3>
              <ul>
                <li>Body space: metres, y up, soles at y = 0, figure faces +Z.</li>
                <li>The subject&apos;s left is +X, so the anterior view shows their left on your right.</li>
                <li>Mesh names and FMA ids come from the source atlas, not from this app.</li>
                <li>Citations live in <code>src/data/references.ts</code>; never invent a DOI.</li>
              </ul>
              <h3>Licenses</h3>
              <p>
                Application code: GNU Affero General Public License v3.0 (AGPL-3.0), see{' '}
                <code>LICENSE</code>.
              </p>
              <p>
                The 3D model is a third-party asset, included as-is and re-coloured at
                runtime: Écorché (github.com/Charleeh/ecorche) under{' '}
                <strong>CC BY-SA 4.0</strong>, derived from BodyParts3D (© The Database Center
                for Life Science, CC BY 4.0) and Z-Anatomy (Gauthier Kervyn, CC BY-SA 4.0).
                See <code>public/models/ATTRIBUTION.md</code>.
              </p>

              <h2>Sources &amp; method</h2>
              <p>
                Every exercise, form variation and activation claim in this build traces to a
                numbered reference. The list below is generated from{' '}
                <code>src/data/references.ts</code>; each entry carries its DOI/PMID and an
                evidence-grade badge.
              </p>
              <ReferencesPanel embedded />
            </div>
          ) : null}
        </aside>
      </section>

      <footer className="site-footer">
        <span>muscleBurn · Écorché atlas, CC BY-SA 4.0</span>
        <span>App code AGPL-3.0 · not medical advice</span>
      </footer>
    </main>
  );
}
