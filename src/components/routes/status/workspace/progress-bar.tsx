import React from 'react';

interface ProgressBarProps {
  progress: number;
  total: number;
  foregroundCssColor: string;
  backgroundCssColor: string;
  className: string;
  text?: string;
}

const ProgressBar = ({
  progress,
  total,
  foregroundCssColor,
  backgroundCssColor,
  className,
  text,
}: ProgressBarProps) => {
  const syncPercentage = Math.floor((progress / total) * 100);

  // gradient has to be flipped once percentage passes 50,
  // otherwise it will create an actual gradient instead of a hard line.
  const background =
    syncPercentage &&
    (syncPercentage < 50
      ? `linear-gradient(to left, ${backgroundCssColor} ${
          100 - syncPercentage
        }%, ${foregroundCssColor} ${syncPercentage}%)`
      : `linear-gradient(to right, ${foregroundCssColor} ${syncPercentage}%, ${backgroundCssColor} ${
          100 - syncPercentage
        }%)`);

  return (
    <div
      className={className}
      style={{
        background,
      }}
    >
      {text}
    </div>
  );
};

export default ProgressBar;
