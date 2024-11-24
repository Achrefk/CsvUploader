import React from 'react';
import { ProgressBarWrapper, ProgressIndicator, ProgressText } from '../styles/ProgressBarStyles';

interface ProgressBarProps {
  progress: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  return (
    <div>
      <ProgressBarWrapper data-testid="progress-bar-wrapper">
        <ProgressIndicator data-testid="progress-indicator" progress={progress} />
      </ProgressBarWrapper>
      {progress <= 100 && progress > 0 && (
        <ProgressText data-testid="progress-text">{progress}% Completed</ProgressText>
      )}
    </div>
  );
};

export default ProgressBar;
