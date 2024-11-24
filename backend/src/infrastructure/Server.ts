
import express from 'express';
import fileRoutes from './routes/FileRoutes';
import cors from 'cors';

const app = express();
const PORT = 3001;
app.use(cors());

app.use('/api', fileRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
                