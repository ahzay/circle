import express from 'express';
import cors from 'cors';
import { initDatabase } from './database';
import routes from './routes';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use(routes);

app.listen(PORT, async () => {
  await initDatabase();
  console.log(`Server running on port ${PORT}`);
});