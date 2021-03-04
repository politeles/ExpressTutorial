# Express app with MongoDB Redis and workers

This is the example where we add workers to our application.
You can copy the folder of the previous tutorial and start from there.

## Install required libraries
We will need to install some libraries to support the workers.

```cmd
cd E04mongoredisworkers
npm install --save bull
npm install --save throng
```

## Update the code of the server

The server will add to the queue of the worker new jobs.
We have to add the two new libraries  at the top:

In line 9 of the app/controllers/home.js file add:
```js
const Queue = require('bull');
let REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
```

### Connect to the work queue:

```js
// Create / Connect to a named work queue
let workQueue = new Queue('work', REDIS_URL);
```

### Add post and get handlers
We need to ue post and get handlers to add jobs to que queue and to retrieve the result.
Edit app/controllers/home.js, add to the bottom the following:

```js
// Kick off a new job by adding it to the work queue
router.post('/job', async (req, res) => {
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

```


## Create the worker code
See the file worker.js
