import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    message: 'RationalRage backend is online',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/rules', (_req, res) => {
  res.json({
    rules: [
      'Start every conversation by saying Hi',
      'End every conversation by saying Bye, it was nice talking to you.',
      'Stay anonymous and keep the room private',
    ],
  });
});

app.listen(PORT, () => {
  console.log(`RationalRage backend running on http://localhost:${PORT}`);
});
