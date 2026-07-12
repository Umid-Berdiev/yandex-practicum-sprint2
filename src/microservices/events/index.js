const express = require('express');
const app = express();
app.use(express.json());
const port = process.env.PORT || 8082;
app.get('/api/events/health', (req, res) => {
  res.json({ status: true });
});
app.post('/api/events/movie', async (req, res) => {
  console.log('[MOCK] Event published to topic movie-events:', req.body);
  res.status(201).json({ status: 'success', message: 'Movie event created' });
});
app.post('/api/events/user', async (req, res) => {
  console.log('[MOCK] Event published to topic user-events:', req.body);
  res.status(201).json({ status: 'success', message: 'User event created' });
});
app.post('/api/events/payment', async (req, res) => {
  console.log('[MOCK] Event published to topic payment-events:', req.body);
  res.status(201).json({ status: 'success', message: 'Payment event created' });
});
app.listen(port, () => {
  console.log(`Events service listening at http://localhost:${port}`);
});
