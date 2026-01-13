'use client';

interface ButtonPowerProps {
  on: boolean;
  onClickHandler: () => void;
}

const ButtonPower = ({ on, onClickHandler }: ButtonPowerProps) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img
    src="/images/icons/icon-power.svg"
    alt=""
    className={`bg-white/70 border border-white/70 rounded-full hover:bg-white hover:border-white cursor-pointer select-none ${
      on
        ? 'w-20 animate-pulse-ring'
        : 'fixed w-8 h-8 top-5 right-5 opacity-50'
    }`}
    onClick={onClickHandler}
  />
);

export default ButtonPower;
