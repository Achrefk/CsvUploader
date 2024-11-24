import styled from 'styled-components';

export const ProgressBarWrapper = styled.div`
  width: 100%;
  background-color: #ddd;
  border-radius: 10px;
  overflow: hidden;
  margin-top: 20px;
`;

export const ProgressIndicator = styled.div<{ progress: number }>`
  height: 20px;
  width: ${(props) => props.progress}%;
  background-color: #4caf50;
  transition: width 0.3s ease;
`;

export const ProgressText = styled.p`
  text-align: center;
  margin-top: 10px;
  font-size: 14px;
  color: #555;
`;
