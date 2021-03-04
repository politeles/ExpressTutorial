const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Article = mongoose.model('Article');
const redis = require('redis');

// make a connection to the local instance of redis
const client = redis.createClient(6379);


const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const Queue = require('bull');

// Create / Connect to a named work queue
let workQueue = new Queue('work', REDIS_URL);

client.on("error", (error) => {
 console.error(error);
});



module.exports = (app) => {
  app.use('/', router);
};

router.get('/', (req, res, next) => {
	
	// Check the redis store for the data first
   client.get('articles', async (err, result) => {
     if (result) {
		 if (err) return next(err);
		 console.log("found");
		 console.log(JSON.parse(result));
       return res.render('index', {
      title: 'Generator-Express MVC',
      articles: JSON.parse(result)
    });

   
     } else { // When the data is not found in the cache then we can make request to the server
 	
  Article.find((err, articles) => {
	  client.setex('articles', 1440, JSON.stringify(articles));
    if (err) return next(err);
    res.render('index', {
      title: 'Generator-Express MVC',
      articles: articles
    });
  });
	 }
   });

});



// Kick off a new job by adding it to the work queue
router.get('/job', async (req, res) => {
  // This would be where you could pass arguments to the job
  // Ex: workQueue.add({ url: 'https://www.heroku.com' })
  // Docs: https://github.com/OptimalBits/bull/blob/develop/REFERENCE.md#queueadd
  let job = await workQueue.add();
  res.json({ id: job.id });
});

// Allows the client to query the state of a background job
router.get('/job/:id', async (req, res) => {
  let id = req.params.id;
  let job = await workQueue.getJob(id);

  if (job === null) {
    res.status(404).end();
  } else {
    let state = await job.getState();
    let progress = job._progress;
    let reason = job.failedReason;
    res.json({ id, state, progress, reason });
  }
});

// You can listen to global events to get notified when jobs are processed
workQueue.on('global:completed', (jobId, result) => {
  console.log(`Job completed with result ${result}`);
});