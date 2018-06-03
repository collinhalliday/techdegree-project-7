const express = require('express');
const router = express.Router();
const functions = require('../functions.js');

const Twit = require('twit');
const Twitter = require('twitter');
const config = require('../config.js');
const T = new Twit(config);

let tweets = [];
let friends = [];

router.get('/', (req, res) => {
  if(tweets.length > 0)
    tweets = [];
  if(friends.length > 0)
    friends = [];
  T.get('search/tweets', { q: 'from:@CollinHalliday1', count: 5 }, (err, data, response) => {
    data.statuses.forEach(function(tweet) {
      tweet.postedValue = functions.compareDates(tweet.created_at);
      tweet.hashLinkText = functions.createHashLinks(tweet);
      console.log(tweet);
      tweets.push(tweet);
    });
  }).then(function() {
      T.get('friends/list', { screen_name: '@CollinHalliday1', count: 5 }, (err, data, response) => {
        data.users.forEach(function(friend) {
          friends.push(friend);
        });
      }).then(function() {
          res.render("main", { tweets, friends });
      });
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

router.post('/unfollow', (req, res) => {
  T.post('friendships/destroy', { name: req.body.name, screen_name: req.body.screen_name }, (err, data, response) => {
      console.log(data);
  }).then(function() {
    res.redirect('/');
  });
});


module.exports = router;
