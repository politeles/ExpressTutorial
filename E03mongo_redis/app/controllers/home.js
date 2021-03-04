const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Article = mongoose.model('Article');
const redis = require('redis');

// make a connection to the local instance of redis
const client = redis.createClient(6379);

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
