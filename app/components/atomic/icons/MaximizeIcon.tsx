interface MaximizeIconProps {
  className?: string;
  style?: React.CSSProperties;
}

const MaximizeIcon = ({ className = 'w-2 h-2', style }: MaximizeIconProps) => (
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
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

export default MaximizeIcon;
