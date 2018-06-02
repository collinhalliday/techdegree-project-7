const express = require('express');
const router = express.Router();
const functions = require('../functions.js');

const Twit = require('twit');
const Twitter = require('twitter');
const config = require('../config.js');
const T = new Twit(config);

let tweets = [];

router.get('/', (req, res) => {
  //This works. Post requests only do not work when I must use a tweet id
  // T.post('statuses/update', { status: 'hello world!' }, function(err, data, response) {
  // console.log(data)
  // });
  if(tweets.length > 0)
    tweets = [];
  T.get('search/tweets', { q: 'from:@CollinHalliday1', count: 5 }, (err, data, response) => {
    data.statuses.forEach(function(tweet) {
      tweet.postedValue = functions.compareDates(tweet.created_at);
      tweet.hashLinkText = functions.createHashLinks(tweet);
      tweets.push(tweet);
    });
    //console.log(formatDatePosted(tweets[0].created_at));
    // console.log(new Date(tweets[0].created_at));
    // console.log(new Date());
    // console.log(new Date() - new Date(tweets[0].created_at));
    // console.log(compareDates(tweets[0].created_at, getCurrentDate()));
    // for(let i = 0; i < tweets.length; i ++)
    //   console.log(tweets[i].text);
    // console.log(tweets);
  }).then(function() {
      res.render("main", { tweets });
  });
});

router.post('/like', (req, res) => {
  for(let i = 0; i < tweets.length; i++) {
    if(tweets[i].created_at === req.body.created_at) {
      console.log("ID: " + tweets[i].id);
      T.post('favorites/create', { id: `${tweets[i].id_str}` }, (err, data, response) => {
          console.log(data);
      }).then(function() {
        res.redirect('/');
      });
    }
  }
});

router.post('/retweet', (req, res) => {
  for(let i = 0; i < tweets.length; i++) {
    if(tweets[i].created_at === req.body.created_at) {
      console.log("ID: " + tweets[i].id);
      T.post('statuses/retweet/:id', { id: `${tweets[i].id_str}` }, (err, data, response) => {
          console.log(data);
      }).then(function() {
        res.redirect('/');
      });
    }
  }
});

router.post('/reply', (req, res) => {
  console.log(req.body.replyMessage);
  for(let i = 0; i < tweets.length; i++) {
    if(tweets[i].created_at === req.body.created_at) {
      console.log("ID: " + tweets[i].id);
      T.post('statuses/update', { status: req.body.replyMessage, in_reply_to_status_id: `${tweets[i].id_str}` }, (err, data, response) => {
          console.log(data);
      }).then(function() {
        res.redirect('/');
      });
    }
  }
});


module.exports = router;
