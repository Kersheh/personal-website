'use client';

import {
  useState,
  useEffect,
  useRef,
  type MouseEvent as ReactMouseEvent,
  type TouchEvent as ReactTouchEvent
} from 'react';

interface IconProps {
  iconName: string;
  label: string;
  onDoubleClickHandler: () => void;
  position?: { x: number; y: number };
  onPositionChange?: (position: { x: number; y: number }) => void;
  occupiedPositions?: Array<{ x: number; y: number }>;
  currentIconId?: string;
}

const GRID_WIDTH = 104; // 80px icon + padding + gap
const GRID_HEIGHT = 120; // 80px icon + text + padding + gap
const GRID_START_X = 20;
const GRID_START_Y = 20;

const snapToGrid = (x: number, y: number): { x: number; y: number } => {
  const snappedX =
    Math.round((x - GRID_START_X) / GRID_WIDTH) * GRID_WIDTH + GRID_START_X;
  const snappedY =
    Math.round((y - GRID_START_Y) / GRID_HEIGHT) * GRID_HEIGHT + GRID_START_Y;

  return {
    x: Math.max(GRID_START_X, snappedX),
    y: Math.max(GRID_START_Y, snappedY)
  };
};

const isPositionOccupied = (
  targetPosition: { x: number; y: number },
  occupiedPositions: Array<{ x: number; y: number }>
) =>
  occupiedPositions.some(
    (occupied) =>
      occupied.x === targetPosition.x && occupied.y === targetPosition.y
  );

const Icon = ({
  iconName,
  label,
  onDoubleClickHandler,
  position,
  onPositionChange,
  occupiedPositions = []
}: IconProps) => {
  const [isSelected, setIsSelected] = useState(false);
  const [lastTap, setLastTap] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [tempPosition, setTempPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [parentRect, setParentRect] = useState<DOMRect | null>(null);
  const nodeRef = useRef<HTMLDivElement>(null);
  const lastTouchTimeRef = useRef(0);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (nodeRef.current && !nodeRef.current.contains(e.target as Node)) {
        setIsSelected(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  useEffect(() => {
    if (!isDragging) {
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!parentRect) {
        return;
      }

      // convert viewport coordinates to container-relative coordinates
      const containerRelativeX = e.clientX - parentRect.left;
      const containerRelativeY = e.clientY - parentRect.top;

      const newX = containerRelativeX - dragOffset.x;
      const newY = containerRelativeY - dragOffset.y;
      setTempPosition({ x: newX, y: newY });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!parentRect || e.touches.length === 0) {
        return;
      }

      // convert viewport coordinates to container-relative coordinates
      const touch = e.touches[0];
      const containerRelativeX = touch.clientX - parentRect.left;
      const containerRelativeY = touch.clientY - parentRect.top;

      const newX = containerRelativeX - dragOffset.x;
      const newY = containerRelativeY - dragOffset.y;
      setTempPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      if (tempPosition && onPositionChange) {
        const snappedPosition = snapToGrid(tempPosition.x, tempPosition.y);

        // check if the snapped position is already occupied
        const otherOccupiedPositions = occupiedPositions.filter(
          (occupied) =>
            !(occupied.x === position?.x && occupied.y === position?.y)
        );

        if (!isPositionOccupied(snappedPosition, otherOccupiedPositions)) {
          onPositionChange(snappedPosition);
        }
      }
      setTempPosition(null);
      setParentRect(null);
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchend', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchend', handleMouseUp);
    };
  }, [
    isDragging,
    dragOffset,
    tempPosition,
    onPositionChange,
    occupiedPositions,
    position,
    parentRect
  ]);

  const handleTouchStart = (e: ReactTouchEvent) => {
    if (e.touches.length === 0) {
      return;
    }

    lastTouchTimeRef.current = Date.now();
    setIsSelected(true);
    if (nodeRef.current && position) {
      const rect = nodeRef.current.getBoundingClientRect();
      const parentElement = nodeRef.current.parentElement;

      if (parentElement) {
        const parentRect = parentElement.getBoundingClientRect();
        setParentRect(parentRect);

        const touch = e.touches[0];
        setDragOffset({
          x: touch.clientX - rect.left,
          y: touch.clientY - rect.top
        });
        setIsDragging(true);
      }
    }
  };

  const handleMouseDown = (e: ReactMouseEvent) => {
    if (e.detail === 1) {
      setIsSelected(true);
      if (nodeRef.current && position) {
        const rect = nodeRef.current.getBoundingClientRect();
        const parentElement = nodeRef.current.parentElement;

        if (parentElement) {
          const parentRect = parentElement.getBoundingClientRect();
          setParentRect(parentRect);

          setDragOffset({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
          });
          setIsDragging(true);
        }
      }
    }
  };

  return (
    <div
      className={`w-fit flex flex-col items-center p-0.5 border-2 rounded-[5%] cursor-pointer ${
        isSelected ? 'border-[#3f3f3f]' : 'border-transparent'
      } ${isDragging ? 'opacity-80' : ''}`}
      style={
        position
          ? {
              position: 'absolute',
              left: `${tempPosition?.x ?? position.x}px`,
              top: `${tempPosition?.y ?? position.y}px`,
              userSelect: 'none',
              zIndex: isDragging ? 1000 : 0
            }
          : {}
      }
      ref={nodeRef}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onDoubleClick={() => {
        const timeSinceLastTouch = Date.now() - lastTouchTimeRef.current;

        if (timeSinceLastTouch < 500) {
          return;
        }

        onDoubleClickHandler();
      }}
      onTouchEnd={(e: ReactTouchEvent) => {
        const now = Date.now();
        const timeSinceLastTap = now - lastTap;

        if (timeSinceLastTap < 300 && timeSinceLastTap > 0) {
          e.preventDefault();
          onDoubleClickHandler();
        } else {
          setIsSelected(true);
        }

        lastTouchTimeRef.current = now;
        setLastTap(now);
      }}
    >
      <div
        className="w-20 h-20 bg-no-repeat bg-cover rounded-[5%]"
        style={{
          backgroundImage: `url(/images/icons/icon-${iconName})`,
          pointerEvents: 'none'
        }}
      />
      <span className="text-white/80 text-xs text-center max-w-20 wrap-break-word font-['Courier_new','Courier',monospace] drop-shadow-lg mt-1 select-none">
        {label}
      </span>
    </div>
  );
};

export default Icon;
