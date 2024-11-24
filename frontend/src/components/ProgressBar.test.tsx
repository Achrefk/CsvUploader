import React from 'react';
import { render, screen } from '@testing-library/react';
import ProgressBar from './ProgressBar';
import '@testing-library/jest-dom';

describe('ProgressBar Component', () => {
  it('renders the progress bar wrapper and indicator', () => {
    render(<ProgressBar progress={50} />);
    expect(screen.getByTestId('progress-bar-wrapper')).toBeInTheDocument();
    expect(screen.getByTestId('progress-indicator')).toBeInTheDocument();
  });

  it('applies the correct progress value to the indicator', () => {
    render(<ProgressBar progress={75} />);
    const indicator = screen.getByTestId('progress-indicator');
    expect(indicator).toHaveStyle(`width: 75%`);
  });

  it('displays the progress text for valid progress values', () => {
    render(<ProgressBar progress={50} />);
    const progressText = screen.getByTestId('progress-text');
    expect(progressText).toBeInTheDocument();
    expect(progressText).toHaveTextContent('50% Completed');
  });

  it('does not display progress text when progress is 0', () => {
    render(<ProgressBar progress={0} />);
    expect(screen.queryByTestId('progress-text')).not.toBeInTheDocument();
  });

  it('does not display progress text for invalid progress values', () => {
    render(<ProgressBar progress={-10} />);
    expect(screen.queryByTestId('progress-text')).not.toBeInTheDocument();
  });

  it('does not display progress text when progress exceeds 100', () => {
    render(<ProgressBar progress={110} />);
    expect(screen.queryByTestId('progress-text')).not.toBeInTheDocument();
  });
});
