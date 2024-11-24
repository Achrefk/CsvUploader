import request from 'supertest';
import express from 'express';
import fileRoutes from './routes/FileRoutes';
import cors from 'cors';
import fs from 'fs';
import path from 'path';

describe('Express Server', () => {
  let app: express.Application;
  const UPLOADS_DIR = path.join(__dirname, 'uploads');

  beforeAll(() => {
    app = express();
    app.use(cors());
    app.use('/api', fileRoutes);

    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }
  });

  afterEach(() => {
    if (fs.existsSync(UPLOADS_DIR)) {
      fs.readdirSync(UPLOADS_DIR).forEach((file) => {
        fs.unlinkSync(path.join(UPLOADS_DIR, file));
      });
    }
  });

  afterAll(() => {
    if (fs.existsSync(UPLOADS_DIR)) {
      fs.rmdirSync(UPLOADS_DIR, { recursive: true });
    }
  });

  it('should respond to /api with a 404 (not found)', async () => {
    const response = await request(app).get('/api');
    expect(response.status).toBe(404);
  });

  it('should return 404 for an undefined route', async () => {
    const response = await request(app).get('/undefined-route');
    expect(response.status).toBe(404);
  });

  it(
    'should handle a valid POST request to /api/upload-chunk',
    async () => {
      const response = await request(app)
        .post('/api/upload-chunk')
        .attach('chunk', Buffer.from('test content'), 'chunk_1')
        .field('chunkIndex', '0')
        .field('totalChunks', '1')
        .field('fileName', 'test.csv')
        .field('uploadId', '12345');
      expect(response.status).toBe(200);
    },
    10000 
  );

  it('should handle a GET request to /api/download-zip with missing query params', async () => {
    const response = await request(app).get('/api/download-zip');
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('ZIP file not found.');
  });
});
