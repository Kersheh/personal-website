interface ZoomOutIconProps {
  width?: number;
  height?: number;
  className?: string;
}

const ZoomOutIcon = ({
  width = 18,
  height = 18,
  className
}: ZoomOutIconProps) => (
  <svg
    width={width}
    height={height}
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <path d="M21 21l-4.35-4.35" />
    <line x1="8" y1="11" x2="14" y2="11" />
  </svg>
);

export default ZoomOutIcon;
