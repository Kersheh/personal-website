'use client';

interface ButtonPowerProps {
  on: boolean;
  onClickHandler: () => void;
}

export default function ButtonPower({ on, onClickHandler }: ButtonPowerProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/images/icons/icon-power.svg"
      alt=""
      className={`bg-white/70 border border-white/70 rounded-full hover:bg-white hover:border-white cursor-pointer ${
        on ? 'w-16 animate-pulse-button' : 'fixed w-6 h-6 top-5 right-5 opacity-50'
      }`}
      onClick={onClickHandler}
    />
  );
}
