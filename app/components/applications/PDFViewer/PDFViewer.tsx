'use client';

interface PDFViewerProps {
  height?: number;
  fileData?: {
    fileName: string;
    filePath: string;
  };
}

const PDFViewer = ({ height, fileData }: PDFViewerProps) => {
  const contentHeight = Math.max(120, height ?? 360);

  return (
    <div
      className="w-full flex items-center justify-center bg-onyx text-white overflow-hidden"
      style={{ height: contentHeight }}
    >
      <div className="text-center">
        <h2 className="text-2xl mb-2">
          {fileData ? fileData.fileName : 'PDF Viewer'}
        </h2>
        <p className="text-sm opacity-60">Coming soon...</p>
      </div>
    </div>
  );
};

export default PDFViewer;
