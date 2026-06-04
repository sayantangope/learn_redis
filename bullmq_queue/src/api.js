import express from "express";
import { emailqueue } from "./queue.js";

const app = express();

app.use(express.json());

app.post("/welcome-email", async (req, res) => {
  try {
    const job = await emailqueue.add(
      "send-welcome-email",
      {
        to: req.body.to,
        name: req.body.name || "Learner",
      },
      {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 1000,
        },
      }
    );

    res.status(201).json({
      success: true,
      jobId: job.id,
      message: "Email job queued successfully",
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Failed to queue email job",
    });
  }
});
app.get("/queue-status", async (req, res) => {
  const counts = await emailqueue.getJobCounts(
    "waiting",
    "active",
    "completed",
    "failed",
    "delayed"
  );

  res.json(counts);
});

app.get("/job/:id", async (req, res) => {
  const job = await emailqueue.getJob(req.params.id);

  if (!job) {
    return res.status(404).json({
      message: "Job not found"
    });
  }

  const state = await job.getState();

  res.json({
    id: job.id,
    name: job.name,
    data: job.data,
    state
  });
});
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});