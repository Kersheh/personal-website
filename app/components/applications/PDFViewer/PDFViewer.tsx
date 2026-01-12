'use client';

import { useEffect, useRef, useState } from 'react';
import ResumeDocument from './documents/resume';

// Fake PDF viewer: renders HTML documents per file instead of real PDFs

interface PDFViewerProps {
  height?: number;
  fileData?: {
    fileName: string;
    filePath: string;
  };
}

const DEFAULT_DOC_KEY = 'default';
const PAGE_WIDTH = 816; // 8.5in @ 96dpi
const PAGE_HEIGHT = 1056; // 11in @ 96dpi

const DOCUMENT_RENDERERS: Record<string, () => React.JSX.Element> = {
  resume: () => <ResumeDocument />,
  [DEFAULT_DOC_KEY]: () => (
    <p className="text-sm text-slate-700 leading-relaxed">
      This document preview is not available yet. Choose another file from the
      desktop or check back later.
    </p>
  )
};

const normalizeKey = (fileData?: PDFViewerProps['fileData']) => {
  if (!fileData) return DEFAULT_DOC_KEY;

  const stripExt = (value?: string) =>
    value ? value.replace(/\.[^/.]+$/, '') : '';
  const pathSegment = fileData.filePath?.split('/').pop();

  const candidates = [stripExt(pathSegment), stripExt(fileData.fileName)];
  const match = candidates.find(Boolean)?.toLowerCase();

  return match && DOCUMENT_RENDERERS[match] ? match : DEFAULT_DOC_KEY;
};

const PDFViewer = ({ height, fileData }: PDFViewerProps) => {
  const [scale, setScale] = useState(1);
  const viewportRef = useRef<HTMLDivElement>(null);

  const contentHeight = Math.max(160, height ?? 420);
  const docKey = normalizeKey(fileData);
  const DocumentBody = DOCUMENT_RENDERERS[docKey];

  useEffect(() => {
    const node = viewportRef.current;
    if (!node || typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? PAGE_WIDTH;
      const nextScale = width / PAGE_WIDTH;
      setScale((prevScale) => {
        // only update if scale changes significantly to prevent infinite loops
        if (Math.abs(nextScale - prevScale) > 0.001) {
          return nextScale;
        }
        return prevScale;
      });
    });

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const scaledWidth = PAGE_WIDTH * scale;
  const scaledHeight = PAGE_HEIGHT * scale;

  return (
    <div
      className="w-full overflow-y-scroll pt-6 px-6 flex justify-center bg-onyx text-white"
      style={{ height: contentHeight }}
    >
      <div className="w-full max-w-5xl" ref={viewportRef}>
        <div
          className="relative mx-auto"
          style={{ width: scaledWidth, height: scaledHeight }}
        >
          <div
            className="absolute top-0 left-0 bg-[#fdfaf5] text-slate-900 shadow-2xl shadow-black/30 rounded-md border border-black/5 overflow-hidden"
            style={{
              width: PAGE_WIDTH,
              height: PAGE_HEIGHT,
              transform: `scale(${scale})`,
              transformOrigin: 'top left'
            }}
          >
            <div className="border-b border-black/10 px-6 py-4 flex items-center justify-between bg-white/70">
              <div className="text-sm font-medium text-slate-700">
                {fileData?.fileName ?? 'Document'}
              </div>
              <div className="text-xs text-slate-500 font-mono">
                HTML preview (PDF stub)
              </div>
            </div>

            <div className="px-6 py-6 space-y-4 leading-relaxed">
              <DocumentBody />
            </div>
          </div>
        </div>
        <div style={{ height: 24 }} />
      </div>
    </div>
  );
};

export default PDFViewer;
