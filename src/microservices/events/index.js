const express = require('express');
const { Kafka } = require('kafkajs');

const app = express();
app.use(express.json());

const port = process.env.PORT || 8082;
const kafkaBrokers = (process.env.KAFKA_BROKERS || 'kafka:9092').split(',');

const kafka = new Kafka({
  clientId: 'events-service',
  brokers: kafkaBrokers,
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: 'events-service-group' });

async function initKafka() {
  await producer.connect();
  await consumer.connect();

  await consumer.subscribe({ topic: 'movie-events', fromBeginning: true });
  await consumer.subscribe({ topic: 'user-events', fromBeginning: true });
  await consumer.subscribe({ topic: 'payment-events', fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log(`Received message on topic ${topic}: ${message.value.toString()}`);
    },
  });
}

initKafka().catch((err) => {
  console.error('Error initializing Kafka:', err);
});

async function produceEvent(topic, payload) {
  await producer.send({
    topic: topic,
    messages: [
      { value: JSON.stringify(payload) },
    ],
  });
}

app.get('/api/events/health', (req, res) => {
  res.json({ status: true });
});

app.post('/api/events/movie', async (req, res) => {
  try {
    const payload = { type: 'MOVIE_EVENT', payload: req.body };
    await produceEvent('movie-events', payload);
    res.status(201).json({ status: 'success', message: 'Movie event created' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, error: 'Internal Server Error' });
  }
});

app.post('/api/events/user', async (req, res) => {
  try {
    const payload = { type: 'USER_EVENT', payload: req.body };
    await produceEvent('user-events', payload);
    res.status(201).json({ status: 'success', message: 'User event created' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, error: 'Internal Server Error' });
  }
});

app.post('/api/events/payment', async (req, res) => {
  try {
    const payload = { type: 'PAYMENT_EVENT', payload: req.body };
    await produceEvent('payment-events', payload);
    res.status(201).json({ status: 'success', message: 'Payment event created' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Events service listening at http://localhost:${port}`);
});