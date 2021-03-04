# Express app with MongoDB Redis and workers

This is the example where we add workers to our application.
You can copy the folder of the previous tutorial and start from there.

If you are using windows, then please download the latest [redis for windows](https://redislabs.com/blog/redis-on-windows-8-1-and-previous-versions/) version.

## Install required libraries
We will need to install some libraries to support the workers.

```cmd
cd E03_mongo_redis
npm install --save redis

```

## Update the code of the server
We will be working on the file app/controllers/home.js

First of all, we need to add the redis library and in line 5 and create a client:

```js
const redis = require('redis');

// make a connection to the local instance of redis
const client = redis.createClient(6379);

client.on("error", (error) => {
 console.error(error);
});
```
Note that we also provided an error handling for the connection to the client.

Next, we have to implement our logic. The idea is to use redis as a cache for MongoDB.
We will modify the code of the main router funtion. When that function is invoked we are going to:
 - First check if the redis cache contains that data.
 - If not, we will fetch that data from the MongoDB.
 
The logic is implemented in line 20 and on.

```js
router.get('/', (req, res, next) => {
	
	// Check the redis store for the data first
   client.get('articles', async (err, result) => {
     if (result) {
		... get data from redis.
	 }else{
		... get data from MongoDB.
		... store that data in Redis, so we can use the next time.
	 }


```

