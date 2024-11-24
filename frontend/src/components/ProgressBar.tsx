import React from 'react';
import { ProgressBarWrapper, ProgressIndicator, ProgressText } from '../styles/ProgressBarStyles';

interface ProgressBarProps {
  progress: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  return (
    <div>
      <ProgressBarWrapper>
        <ProgressIndicator progress={progress} />
      </ProgressBarWrapper>
      {progress <= 100 && progress > 0 && <ProgressText>{progress}% Completed</ProgressText>}
    </div>
  );
};

export default ProgressBar;
