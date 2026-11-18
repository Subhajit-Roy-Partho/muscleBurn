'use client';

import dynamic from 'next/dynamic';

const MuscleViewer = dynamic(() => import('./MuscleViewer'), {
  ssr: false,
  loading: () => <div className="viewer-loading">Loading 3D muscle viewer…</div>,
});

export default MuscleViewer;
