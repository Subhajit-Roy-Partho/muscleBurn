'use client';

import dynamic from 'next/dynamic';
import type { MuscleViewerProps } from './MuscleViewer';

const MuscleViewer = dynamic<MuscleViewerProps>(() => import('./MuscleViewer'), {
  ssr: false,
  loading: () => <div className="viewer-loading">Loading 3D muscle viewer…</div>,
});

export default MuscleViewer;
