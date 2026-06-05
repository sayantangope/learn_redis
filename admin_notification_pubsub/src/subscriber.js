import Redis from "ioredis";

const subscriber = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

subscriber.subscribe("notification", (err, count) => {
  if (err) {
    console.error("Failed to subscribe: ", err);
    return;
  }
  console.log("Subscriber succesfully");
});

subscriber.on("message", (channel, message) => {
  console.log(`Received message from channel ${channel}: ${message}`);
});
