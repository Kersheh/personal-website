interface MIMIconProps {
  className?: string;
}

const MIMIcon = ({ className = 'w-5 h-5' }: MIMIconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 32 32"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="16" cy="10" r="5" fill="currentColor" />
    <path
      d="M11 19.5c2.2-1 7.2-1 9.2 0L25 22l-2.6 1.8L19 21l-3 5-3-2-3.5 4L7 26l4-5.5Z"
      fill="currentColor"
    />
  </svg>
);

export default MIMIcon;
