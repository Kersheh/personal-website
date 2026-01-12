interface CloseIconProps {
  className?: string;
  style?: React.CSSProperties;
}

const CloseIcon = ({ className = 'w-2 h-2', style }: CloseIconProps) => (
  <svg
    className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${className}`}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={style}
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export default CloseIcon;
