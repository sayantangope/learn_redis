import express from 'express';
import Redis from 'ioredis';

const app = express();
app.use(express.json());

const publisher = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');


app.post("/notification", async (req, res) => {
    const payload = {
        title: req.body.title || "Default Title",
        createdAt: new Date().toISOString()
    }
    const receiver = await publisher.publish("notification", JSON.stringify(payload));
    
    res.json({
        success: true,
        message: `Notification published to ${receiver} subscriber(s)`,
        payload
    })
})


app.listen(3000, () => {
  console.log('Server is running on port 3000');
});