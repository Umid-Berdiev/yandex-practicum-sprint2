const express = require("express");
const { Kafka } = require("kafkajs");

const app = express();
app.use(express.json());

const port = process.env.PORT || 8082;
const brokers = process.env.KAFKA_BROKERS
  ? process.env.KAFKA_BROKERS.split(",")
  : ["kafka:9092"];

const kafka = new Kafka({
  clientId: "events-service",
  brokers: brokers,
});

const producer = kafka.producer();

app.get("/api/events/health", (req, res) => {
  res.json({ status: true });
});

app.post("/api/events/movie", async (req, res) => {
  try {
    await producer.send({
      topic: "movie-events",
      messages: [{ value: JSON.stringify(req.body) }],
    });
    console.log("Event published to topic movie-events:", req.body);
    res.status(201).json({ status: "success", message: "Movie event created" });
  } catch (error) {
    console.error("Error publishing movie event", error);
    res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
});

app.post("/api/events/user", async (req, res) => {
  try {
    await producer.send({
      topic: "user-events",
      messages: [{ value: JSON.stringify(req.body) }],
    });
    console.log("Event published to topic user-events:", req.body);
    res.status(201).json({ status: "success", message: "User event created" });
  } catch (error) {
    console.error("Error publishing user event", error);
    res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
});

app.post("/api/events/payment", async (req, res) => {
  try {
    await producer.send({
      topic: "payment-events",
      messages: [{ value: JSON.stringify(req.body) }],
    });
    console.log("Event published to topic payment-events:", req.body);
    res
      .status(201)
      .json({ status: "success", message: "Payment event created" });
  } catch (error) {
    console.error("Error publishing payment event", error);
    res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
});

async function start() {
  try {
    await producer.connect();
    console.log("Connected to Kafka successfully");
  } catch (error) {
    console.error("Could not connect to Kafka", error);
  }

  app.listen(port, () => {
    console.log(`Events service listening at http://localhost:${port}`);
  });
}

start();
