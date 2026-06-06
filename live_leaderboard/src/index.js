import express from 'express';
import Redis from 'ioredis';
const app = express();
const port = 3000;
app.use(express.json());

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');


const LEADERBOARD_KEY = 'leaderboard';
const VIEWS_KEY = 'views';

app.post("/post/:id/view",async(req,res)=> {
    const userid = req.params.id;

    const views = await redis.hincrby(
        VIEWS_KEY,
        userid,
        1
    );
    res.json({
        success : true,
        userid,
        views
    })
})

app.post("/leaderboard/score",async (req,res) => {
    const userId = req.body;
    const score = await redis.zincrby(
        LEADERBOARD_KEY,
        userId,
        10
    )

     res.json({
        success : true,
        userid,
        score
    })

})

app.get("/leaderboard",async (req,res) => {
    
    const data = await redis.zrange(
  LEADERBOARD_KEY,
  0,
  9,
  'REV',
  'WITHSCORES'
);
const leaderboard = [];

  for (let i = 0; i < data.length; i += 2) {
    leaderboard.push({
      rank: i / 2 + 1,
      userId: data[i],
      score: Number(data[i + 1])
    });
  }

  res.json(leaderboard);

})


app.get('/rank/:userId', async (req, res) => {
  const { userId } = req.params;

  const rank = await redis.zrevrank(
    LEADERBOARD_KEY,
    userId
  );

  if (rank === null) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  const score = await redis.zscore(
    LEADERBOARD_KEY,
    userId
  );

  res.json({
    userId,
    rank: rank + 1,
    score: Number(score)
  });
});


app.listen(port, () => console.log(`Example app listening on port ${port}!`));
