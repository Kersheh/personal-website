'use client';

import { useEffect, useRef, useState } from 'react';
import ResumeDocument from './documents/resume';
import {
  PrintIcon,
  ZoomOutIcon,
  ZoomInIcon
} from '@/app/components/atomic/icons';

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
  if (!fileData) {
    return DEFAULT_DOC_KEY;
  }

  const stripExt = (value?: string) =>
    value ? value.replace(/\.[^/.]+$/, '') : '';
  const pathSegment = fileData.filePath?.split('/').pop();

  const candidates = [stripExt(pathSegment), stripExt(fileData.fileName)];
  const match = candidates.find(Boolean)?.toLowerCase();

  return match && DOCUMENT_RENDERERS[match] ? match : DEFAULT_DOC_KEY;
};

const PDFViewer = ({ height, fileData }: PDFViewerProps) => {
  const [scale, setScale] = useState(1);
  const [zoomInput, setZoomInput] = useState('100');
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const viewportRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const contentHeight = Math.max(160, height ?? 420);
  const docKey = normalizeKey(fileData);
  const DocumentBody = DOCUMENT_RENDERERS[docKey];

  const applyZoomInput = () => {
    const value = parseInt(zoomInput, 10);
    if (isNaN(value) || value < 50 || value > 300) {
      setZoomInput(Math.round(scale * 100).toString());
      return;
    }
    const newScale = value / 100;
    setScale(newScale);
    setZoomInput(Math.round(newScale * 100).toString());
  };

  const handleMouseUp = () => setIsDragging(false);

  useEffect(() => {
    const node = viewportRef.current;
    if (!node || typeof ResizeObserver === 'undefined') {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? PAGE_WIDTH;
      const nextScale = width / PAGE_WIDTH;
      setScale((prevScale) => {
        // only update if scale changes significantly to prevent infinite loops
        if (Math.abs(nextScale - prevScale) > 0.001) {
          setZoomInput(Math.round(nextScale * 100).toString());
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
    <div className="w-full h-full flex flex-col bg-onyx text-white">
      <div className="flex items-center gap-2 px-4 py-2 bg-onyx/50 border-b border-white/10 select-none">
        <span className="text-sm font-medium text-white/90 mr-auto">
          {fileData?.fileName ?? 'Document'}
        </span>
        <button
          onClick={() => {
            // TODO: Implement print functionality
          }}
          className="flex items-center justify-center w-8 h-8 rounded hover:bg-white/10 transition-colors"
          aria-label="Print document"
        >
          <PrintIcon />
        </button>
        <div className="w-px h-5 bg-white/20" />
        <button
          onClick={() => {
            setScale((prev) => {
              const newScale = Math.max(prev - 0.1, 0.5);
              setZoomInput(Math.round(newScale * 100).toString());
              return newScale;
            });
          }}
          className="flex items-center justify-center w-8 h-8 rounded hover:bg-white/10 transition-colors"
          aria-label="Zoom out"
        >
          <ZoomOutIcon />
        </button>
        <button
          onClick={() => {
            setScale((prev) => {
              const newScale = Math.min(prev + 0.1, 3);
              setZoomInput(Math.round(newScale * 100).toString());
              return newScale;
            });
          }}
          className="flex items-center justify-center w-8 h-8 rounded hover:bg-white/10 transition-colors"
          aria-label="Zoom in"
        >
          <ZoomInIcon />
        </button>
        <input
          type="text"
          value={zoomInput}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value.replace(/[^0-9]/g, '');
            setZoomInput(value);
          }}
          onBlur={applyZoomInput}
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') {
              applyZoomInput();
              (e.target as HTMLInputElement).blur();
            }
          }}
          className="w-12 text-xs text-white/90 bg-white/10 border border-white/20 rounded px-1.5 py-0.5 text-center ml-2 focus:outline-none focus:border-white/40"
          aria-label="Zoom percentage"
        />
        <span className="text-xs text-white/60">%</span>
      </div>
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-scroll pt-6 pl-6 flex justify-center select-none"
        style={{
          height: contentHeight - 44,
          cursor: isDragging ? 'move' : 'default'
        }}
        onMouseDown={(e: React.MouseEvent) => {
          const container = scrollContainerRef.current;
          if (!container) {
            return;
          }

          setIsDragging(true);
          setDragStart({
            x: e.clientX + container.scrollLeft,
            y: e.clientY + container.scrollTop
          });
        }}
        onMouseMove={(e: React.MouseEvent) => {
          if (!isDragging) {
            return;
          }

          const container = scrollContainerRef.current;
          if (!container) {
            return;
          }

          container.scrollLeft = dragStart.x - e.clientX;
          container.scrollTop = dragStart.y - e.clientY;
        }}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div className="w-full max-w-5xl flex justify-center" ref={viewportRef}>
          <div
            className="relative"
            style={{
              width: scaledWidth,
              height: scaledHeight,
              marginRight: 30,
              marginBottom: 30
            }}
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
              <div className="px-6 py-6 space-y-4 leading-relaxed">
                <DocumentBody />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;
