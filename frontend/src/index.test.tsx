import React from 'react';
import * as ReactDOM from 'react-dom';
import { FileUploader } from './components/FileUploader';

jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  render: jest.fn(),
}));

describe('index.tsx', () => {
  it('renders the FileUploader component into the root element', () => {
    const root = document.createElement('div');
    root.id = 'root';
    document.body.appendChild(root);

    require('./index.tsx');

    expect(ReactDOM.render).toHaveBeenCalledWith(
      <React.StrictMode>
        <FileUploader />
      </React.StrictMode>,
      root
    );
  });
});
