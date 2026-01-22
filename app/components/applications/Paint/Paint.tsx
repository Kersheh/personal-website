'use client';

import { useRef, useState, useEffect, MouseEvent, TouchEvent } from 'react';

type BrushType = 'round' | 'square' | 'spray';

interface PaintProps {
  height?: number;
}

const COLORS = [
  '#000000', // Black
  '#FFFFFF', // White
  '#FF0000', // Red
  '#FF6B00', // Orange
  '#FFFF00', // Yellow
  '#00FF00', // Green
  '#00FFFF', // Cyan
  '#0000FF', // Blue
  '#FF00FF', // Magenta
  '#8B4513', // Brown
  '#808080', // Gray
  '#FFC0CB' // Pink
];

const BRUSH_SIZES = [2, 5, 10, 20, 40];

const Paint = ({ height }: PaintProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const [brushType, setBrushType] = useState<BrushType>('round');
  const [lastPos, setLastPos] = useState<{ x: number; y: number } | null>(null);
  const historyRef = useRef<Array<ImageData>>([]);
  const redoStackRef = useRef<Array<ImageData>>([]);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const contentHeight = Math.max(200, (height ?? 400) - 60);

  const saveToHistory = () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    historyRef.current.push(imageData);

    // limit history to 50 states
    if (historyRef.current.length > 50) {
      historyRef.current.shift();
    }

    // clear redo stack when new action is performed
    redoStackRef.current = [];
    setCanUndo(true);
    setCanRedo(false);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    // fill with white background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (!parent) {
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return;
      }

      // save current canvas content
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      // resize
      canvas.width = parent.clientWidth;
      canvas.height = contentHeight;

      // fill with white and restore content
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.putImageData(imageData, 0, 0);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [contentHeight]);

  const getCanvasCoords = (
    e: MouseEvent<HTMLCanvasElement> | globalThis.MouseEvent
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return { x: 0, y: 0 };
    }

    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const getTouchCoords = (e: TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return { x: 0, y: 0 };
    }

    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    return {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    };
  };

  const draw = (x: number, y: number, fromX?: number, fromY?: number) => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (brushType === 'spray') {
      // spray paint effect
      const density = brushSize * 2;

      for (let i = 0; i < density; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * brushSize;
        const offsetX = Math.cos(angle) * radius;
        const offsetY = Math.sin(angle) * radius;
        ctx.fillRect(x + offsetX, y + offsetY, 1, 1);
      }
    } else if (brushType === 'square') {
      ctx.fillRect(x - brushSize / 2, y - brushSize / 2, brushSize, brushSize);
      if (fromX !== undefined && fromY !== undefined) {
        // draw squares along the line
        const dist = Math.sqrt((x - fromX) ** 2 + (y - fromY) ** 2);
        const steps = Math.ceil(dist / (brushSize / 2));

        for (let i = 0; i < steps; i++) {
          const t = i / steps;
          const px = fromX + (x - fromX) * t;
          const py = fromY + (y - fromY) * t;
          ctx.fillRect(
            px - brushSize / 2,
            py - brushSize / 2,
            brushSize,
            brushSize
          );
        }
      }
    } else {
      // round brush
      if (fromX !== undefined && fromY !== undefined) {
        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(x, y);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-200">
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-2 bg-gray-300 border-b border-gray-400 flex-wrap select-none">
        {/* Brush Type */}
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-700 mr-1">Brush:</span>
          {(['round', 'square', 'spray'] as Array<BrushType>).map((type) => (
            <button
              key={type}
              onClick={() => setBrushType(type)}
              className={`px-2 py-1 text-xs border rounded capitalize ${
                brushType === type
                  ? 'bg-blue-500 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-400 hover:bg-gray-100'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        <div className="w-px h-6 bg-gray-400" />

        {/* Brush Size */}
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-700 mr-1">Size:</span>
          {BRUSH_SIZES.map((size) => (
            <button
              key={size}
              onClick={() => setBrushSize(size)}
              className={`w-7 h-7 flex items-center justify-center border rounded ${
                brushSize === size
                  ? 'bg-blue-500 border-blue-600'
                  : 'bg-white border-gray-400 hover:bg-gray-100'
              }`}
            >
              <div
                className="rounded-full bg-black"
                style={{
                  width: Math.min(size, 20),
                  height: Math.min(size, 20)
                }}
              />
            </button>
          ))}
        </div>

        <div className="w-px h-6 bg-gray-400" />

        {/* Colors */}
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-700 mr-1">Color:</span>
          <div className="flex gap-0.5 flex-wrap">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-5 h-5 border-2 ${
                  color === c ? 'border-blue-500' : 'border-gray-400'
                }`}
                style={{ backgroundColor: c }}
                title={c}
              />
            ))}
          </div>
        </div>

        <div className="w-px h-6 bg-gray-400" />

        {/* Undo/Redo */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              const canvas = canvasRef.current;
              if (!canvas || historyRef.current.length === 0) {
                return;
              }

              const ctx = canvas.getContext('2d');
              if (!ctx) {
                return;
              }

              // save current state to redo stack
              const currentState = ctx.getImageData(
                0,
                0,
                canvas.width,
                canvas.height
              );
              redoStackRef.current.push(currentState);

              // restore previous state
              const previousState = historyRef.current.pop()!;
              ctx.putImageData(previousState, 0, 0);

              setCanUndo(historyRef.current.length > 0);
              setCanRedo(true);
            }}
            disabled={!canUndo}
            className={`w-7 h-7 flex items-center justify-center border rounded ${
              canUndo
                ? 'bg-white border-gray-400 hover:bg-gray-100'
                : 'bg-gray-200 border-gray-300 cursor-not-allowed opacity-50'
            }`}
            title="Undo"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M4 7L1 10l3 3v-2h5c2.2 0 4-1.8 4-4s-1.8-4-4-4H6v2h3c1.1 0 2 .9 2 2s-.9 2-2 2H4V7z" />
            </svg>
          </button>
          <button
            onClick={() => {
              const canvas = canvasRef.current;
              if (!canvas || redoStackRef.current.length === 0) {
                return;
              }

              const ctx = canvas.getContext('2d');
              if (!ctx) {
                return;
              }

              // save current state to history
              const currentState = ctx.getImageData(
                0,
                0,
                canvas.width,
                canvas.height
              );
              historyRef.current.push(currentState);

              // restore redo state
              const redoState = redoStackRef.current.pop()!;
              ctx.putImageData(redoState, 0, 0);

              setCanUndo(true);
              setCanRedo(redoStackRef.current.length > 0);
            }}
            disabled={!canRedo}
            className={`w-7 h-7 flex items-center justify-center border rounded ${
              canRedo
                ? 'bg-white border-gray-400 hover:bg-gray-100'
                : 'bg-gray-200 border-gray-300 cursor-not-allowed opacity-50'
            }`}
            title="Redo"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M12 7l3 3-3 3v-2H7c-2.2 0-4-1.8-4-4s1.8-4 4-4h3v2H7c-1.1 0-2 .9-2 2s.9 2 2 2h5V7z" />
            </svg>
          </button>
        </div>

        <div className="w-px h-6 bg-gray-400" />

        {/* Clear button */}
        <button
          onClick={() => {
            const canvas = canvasRef.current;
            if (!canvas) {
              return;
            }

            const ctx = canvas.getContext('2d');
            if (!ctx) {
              return;
            }

            saveToHistory();
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }}
          className="px-2 py-1 text-xs bg-red-500 text-white border border-red-600 rounded hover:bg-red-600"
        >
          Clear
        </button>
      </div>

      {/* Canvas */}
      <div className="flex-1 overflow-hidden">
        <canvas
          ref={canvasRef}
          className="cursor-crosshair"
          style={{ height: contentHeight }}
          onMouseDown={(e: MouseEvent<HTMLCanvasElement>) => {
            if (e.button !== 0) {
              return;
            }
            saveToHistory();
            setIsDrawing(true);
            const pos = getCanvasCoords(e);
            setLastPos(pos);
            draw(pos.x, pos.y);
          }}
          onMouseMove={(e: MouseEvent<HTMLCanvasElement>) => {
            if (!isDrawing) {
              return;
            }
            const pos = getCanvasCoords(e);
            draw(pos.x, pos.y, lastPos?.x, lastPos?.y);
            setLastPos(pos);
          }}
          onMouseUp={() => {
            setIsDrawing(false);
            setLastPos(null);
          }}
          onMouseLeave={() => {
            setIsDrawing(false);
            setLastPos(null);
          }}
          onTouchStart={(e: TouchEvent<HTMLCanvasElement>) => {
            e.preventDefault();
            saveToHistory();
            setIsDrawing(true);
            const pos = getTouchCoords(e);
            setLastPos(pos);
            draw(pos.x, pos.y);
          }}
          onTouchMove={(e: TouchEvent<HTMLCanvasElement>) => {
            e.preventDefault();
            if (!isDrawing) {
              return;
            }
            const pos = getTouchCoords(e);
            draw(pos.x, pos.y, lastPos?.x, lastPos?.y);
            setLastPos(pos);
          }}
          onTouchEnd={() => {
            setIsDrawing(false);
            setLastPos(null);
          }}
        />
      </div>
    </div>
  );
};

export default Paint;
