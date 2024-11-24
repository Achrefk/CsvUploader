export const uploadChunk = async (
    chunk: Blob,
    chunkIndex: number,
    totalChunks: number,
    fileName: string,
    uploadId: string
  ) => {
    const formData = new FormData();
    formData.append('chunk', chunk);
    formData.append('chunkIndex', chunkIndex.toString());
    formData.append('totalChunks', totalChunks.toString());
    formData.append('fileName', fileName);
    formData.append('uploadId', uploadId);
  
    const response = await fetch('http://localhost:3001/api/upload-chunk', {
      method: 'POST',
      body: formData,
    });
  
    if (!response.ok) {
      throw new Error(`Chunk ${chunkIndex} upload failed.`);
    }
  
    return await response.json();
  };
  
  export const downloadZip = async (zipPath: string, setProgress: (progress: number) => void) => {
    const response: any = await fetch(`http://localhost:3001/api/download-zip?zipPath=${encodeURIComponent(zipPath)}`);
  
    if (!response.ok) {
      throw new Error('Failed to download ZIP.');
    }
  
    const reader = response.body?.getReader();
    if (reader) {
      const contentLength = +response.headers.get('Content-Length') || 0;
      let receivedLength = 0;
      const chunks: Uint8Array[] = [];
  
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
  
        if (value) {
          chunks.push(value);
          receivedLength += value.length;
          setProgress(Math.round((receivedLength / contentLength) * 100));
        }
      }
  
      const blob = new Blob(chunks);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'processed.zip';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    }
  };
  