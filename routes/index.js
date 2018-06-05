const express = require('express');
const router = express.Router();
const functions = require('../functions.js');

const Twit = require('twit');
const Twitter = require('twitter');
const config = require('../config.js');
const T = new Twit(config);

let tweets = [];
let friends = [];
let messages = [];
let msgSenderIdArray = [];
let msgRecipientIdArray = [];
let msgSenderArray;
let msgRecipientArray;
let convoWithArray = [];
let convoWithScreenNameArray = [];
// let userInfo;

router.get('/', (req, res) => {
  if(tweets.length > 0)
    tweets = [];
  if(friends.length > 0)
    friends = [];
  if(messages.length > 0)
    messages = [];
  if(convoWithArray.length > 0) {
    convoWithArray = [];
    convoWithScreenNameArray = [];
  }
  T.get('search/tweets', { q: 'from:@CollinHalliday1', count: 5 }, (err, data, response) => {
    data.statuses.forEach(function(tweet) {
      tweet.postedValue = functions.compareDates(tweet.created_at);
      tweet.text = functions.createLinks(tweet);
      tweet.text = functions.createHashLinks(tweet);
      //tweet.hashLinkText = functions.createHashLinks(tweet);
      tweets.push(tweet);
    });
  }).then(function() {
      T.get('friends/list', { screen_name: '@CollinHalliday1', count: 5 }, (err, data, response) => {
        data.users.forEach(function(friend) {
          friends.push(friend);
        });
      }).then(function() {
          T.get('direct_messages/events/list', { count: 50 }, (err, data, response) => {
              //console.log(data.events);
              // console.log(data.events.length);
              data.events.forEach(function(message) {
                message.timeSent = functions.compareDates(functions.formatTimeStamp(message.created_timestamp), true);
                message.text = functions.createLinks(message.message_create.message_data);
                message.text = functions.createHashLinks(message);
                //message.text = functions.createHashLinks(message.message_create.message_data);
                msgSenderIdArray.push(message.message_create.sender_id);
                msgRecipientIdArray.push(message.message_create.target.recipient_id);
                messages.push(message);
                // for(let i = 0; i < friends.length; i++) {
                //   if(message.message_create.sender_id === friends[i].id_str)
                //     message.senderInfo = friends[i];
                // }
                // if(!message.senderInfo) {
                  // T.get('users/lookup', { user_id: message.message_create.sender_id }, (err, data, response) => {
                  //   message.senderInfo = data;
                  // }).then(function() {
                  //     messages.push(message);
                  // });
                // }
                // messages.push(message);
              });
          }).then(function() {
              T.get('users/lookup', { user_id: msgSenderIdArray.toString(' ') }, (err, data, response) => {
                msgSenderArray = data;
                messages.forEach(function(message) {
                  for(let i = 0; i < msgSenderArray.length; i++) {
                    if(message.message_create.sender_id === msgSenderArray[i].id_str) {
                      message.senderInfo = msgSenderArray[i];
                    }
                  }
                });
              }).then(function() {
                  T.get('users/lookup', { user_id: msgRecipientIdArray.toString(' ') }, (err, data, response) => {
                    msgRecipientArray = data;
                    messages.forEach(function(message) {
                      for(let i = 0; i < msgSenderArray.length; i++) {
                        if(message.message_create.target.recipient_id === msgRecipientArray[i].id_str) {
                          message.recipientInfo = msgRecipientArray[i];
                        }
                      }
                    });
                    messages.forEach(function(message) {
                      if(message.senderInfo.name !== 'Collin Halliday') {
                        message.convoWith = message.senderInfo.name;
                        message.convoWithScreenName = message.senderInfo.screen_name;
                      } else {
                        message.convoWith = message.recipientInfo.name;
                        message.convoWithScreenName = message.recipientInfo.screen_name;
                      }
                      if(!convoWithArray.includes(message.convoWith)) {
                        convoWithArray.push(message.convoWith);
                        convoWithScreenNameArray.push(message.convoWithScreenName);
                      }
                    });
                  }).then(function() {

                    console.log(messages);
                    // console.log(convoWithArray);
                    res.render("main", { tweets, friends, messages, convoWithArray, convoWithScreenNameArray });
                  });
              });
          });
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
