//Creates Express router used frequently below.
const express = require('express');
const router = express.Router();

//Requires helper function file.
const functions = require('../functions.js');

//Creates Twit object with user info entered into config file, and takes advantage of streaming
//capabilities of the twit module on tweet related functionality(soon to be deprecated)
const Twit = require('twit');
const config = require('../config.js');
const T = new Twit(config);

//Variable declarations and initializations.
let tweets = [];
let friends = [];
let messages = [];
let msgSenderIdArray = [];
let msgRecipientIdArray = [];
let msgSenderArray = [];
let msgRecipientArray = [];
let msgSenderAndRecipientArray = [];
let convoWithArray = [];
let convoWithScreenNameArray = [];
let userInfo;
let redirectedFromTweetRoute = false;

//Root route. Unless user is being redirected to this route from tweeting, either for regular tweets, retweets,
//or reply tweets, all page data is populated through calls to the twitter API for the user and the user's tweets,
//friends (individuals followed), messages, and message senders/recipients.
router.get('/', (req, res) => {
  //If redirected here from app tweet, page is simply rendered with updated tweet data
  if(redirectedFromTweetRoute) {
    redirectedFromTweetRoute = false;
    return res.render("main", { tweets, friends, messages, convoWithArray, convoWithScreenNameArray, userInfo });
  }
  //Tweet, friend, message and conversation data arrays are emptied.
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

  //Account info, friend info, and message info api calls below are each wrapped in a promise, placed in an array, and
  //passed to Promise.all(). This ensures that these api calls are completed and their data handled before the tweet info
  //and message sender/recipient info api calls are completed, as these calls rely on info obtained from the earlier api
  //calls.
  Promise.all([
    //Retrieving user account info.
    new Promise(function(resolve, reject) {
      T.get('account/verify_credentials', { }, (err, data, response) => {
        userInfo = data;
        if(err)
          reject(err);
        resolve(data);
      });
    }),
    //Retrieving friends info.
    new Promise(function(resolve, reject) {
      T.get('friends/list', { count: 5 }, (err, data, response) => {
        data.users.forEach(function(friend) {
          friends.push(friend);
        });
        if(err)
          reject(err);
        resolve(data);
      });
    }),
    //Retrieving direct messages info.
    new Promise(function(resolve, reject) {
      T.get('direct_messages/events/list', { }, (err, data, response) => {
        data.events.forEach(function(message) {
          //formatting direct message data.
          message.timeSent = functions.compareDates(functions.formatTimeStamp(message.created_timestamp), true);
          message.text = functions.createLinks(message.message_create.message_data);
          message.text = functions.createHashLinks(message);
          msgSenderIdArray.push(message.message_create.sender_id);
          msgRecipientIdArray.push(message.message_create.target.recipient_id);
          messages.push(message);
        });
        if(err)
          reject(err);
        resolve(data);
      });
    })
  ])
    .then(function() {
      //To ensure that all api calls are completed before the page is rendered, Promise.all() is called again on the
      //second round of api calls.
      Promise.all([
        //Retrieving tweet info.
        new Promise(function(resolve, reject) {
          T.get('statuses/user_timeline', { screen_name: userInfo.screen_name, count: 5 }, (err, data, response) => {
            //formatting tweet info.
            data.forEach(function(tweet) {
              tweet.postedValue = functions.compareDates(tweet.created_at);
              tweet.text = functions.createLinks(tweet);
              tweet.text = functions.createHashLinks(tweet);
              tweets.push(tweet);
            });
            if(err)
              reject(err);
            resolve(data);
          });
        }),
        //retrieving message sender and recipient data
        new Promise(function(resolve, reject) {
          T.get('users/lookup', { user_id: msgSenderIdArray.toString(' ') + msgRecipientIdArray.toString(' ') }, (err, data, response) => {
            msgSenderAndRecipientArray = data;
            messages.forEach(function(message) {
              for(let i = 0; i < msgSenderAndRecipientArray.length; i++) {
                if(message.message_create.sender_id === msgSenderAndRecipientArray[i].id_str) {
                  message.senderInfo = msgSenderAndRecipientArray[i];
                } else if(message.message_create.target.recipient_id === msgSenderAndRecipientArray[i].id_str) {
                  message.recipientInfo = msgSenderAndRecipientArray[i];
                }
              }
            });
            //Sets up information related to whom each message conversation is with for display purposes.
            messages.forEach(function(message) {
              if(message.senderInfo.name !== userInfo.name) {
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
            if(err)
              reject(err);
            resolve(data);
          });
        })
      ])
      //assuming no errors, after each api call is completed and its data handled, the page is rendered.
      .then(function() {
        return res.render("main", { tweets, friends, messages, convoWithArray, convoWithScreenNameArray, userInfo });
      })
      //If error on second set of api calls, error page is rendered with error data.
      .catch(function(err) {
          return res.render('error', { err });
      });
    })
    //If error on first set of api calls, error page is rendered with error data.
    .catch(function(err) {
        return res.render('error', { err });
    });
});

//Retweets a particular tweet when the user clicks on the retweet button. Redirects to root route after to display
//new tweet and existing tweets.
router.post('/retweet', (req, res) => {
  for(let i = 0; i < tweets.length; i++) {
    //matches button clicked by comparing date created of the tweet related to the button clicked with the dates
    //of the tweets in the tweet array.
    if(tweets[i].created_at === req.body.created_at) {
      //Wraps api call in a promise to ensure that calls is comleted and data handled before page is rendered.
      functions.createTweetPromise(T, 'statuses/retweet/:id', { id: tweets[i].id_str })
        .then(function(tweet) {
          //formats new tweet data and reformats timePosted data of existing tweets and messages.
          functions.addNewTweet(tweets, messages, tweet);
          //set to true to ensure that entire page is not repopulate upon redirection to root route.
          redirectedFromTweetRoute = true;
          return res.redirect('/');
        })
        .catch(function(err) {
            return res.render('error', { err });
        });
    }
  }
});

//Perform's user's reply tweets. Then redirects to root route to display new tweet and existing tweets.
router.post('/reply', (req, res) => {
  for(let i = 0; i < tweets.length; i++) {
    //matches button clicked by comparing date created of the tweet related to the button clicked with the dates
    //of the tweets in the tweet array.
    if(tweets[i].created_at === req.body.created_at) {
      //Wraps api call in a promise to ensure that calls is comleted and data handled before page is rendered.
      functions.createTweetPromise(T, 'statuses/update', { status: req.body.replyMessage })
        .then(function(tweet) {
          //formats new tweet data and reformats timePosted data of existing tweets and messages.
          functions.addNewTweet(tweets, messages, tweet);
          //set to true to ensure that entire page is not repopulate upon redirection to root route.
          redirectedFromTweetRoute = true;
          return res.redirect('/');
        })
        .catch(function(err) {
            return res.render('error', { err });
        });
    }
  }
});

//Performs the user's tweets from the app. Then, redirects to root route to display new tweet and existing
//tweets.
router.post('/tweet', (req, res) => {
  //Wraps api call in a promise to ensure that calls is comleted and data handled before page is rendered.
  functions.createTweetPromise(T, 'statuses/update', { status: req.body.tweet })
    .then(function(tweet) {
      //formats new tweet data and reformats timePosted data of existing tweets and messages.
      functions.addNewTweet(tweets, messages, tweet);
      //set to true to ensure that entire page is not repopulate upon redirection to root route.
      redirectedFromTweetRoute = true;
      return res.redirect('/');
    })
    .catch(function(err) {
        return res.render('error', { err });
    });
});

//Unfollows a particular friend of user if related link is clicked. Redirects to root route, repopulating and displaying
//data on app page.
router.post('/unfollow', (req, res) => {
  //Post request to api.
  T.post('friendships/destroy', { name: req.body.name, screen_name: req.body.screen_name }, (err, data, response) => {
      if(err)
        return res.render('error', { err });
  }).then(function() {
    return res.redirect('/');
  });
});

//Like a particular tweet of user if related link is clicked. Redirects to root route, repopulating and displaying
//data on app page.
router.post('/like', (req, res) => {
  for(let i = 0; i < tweets.length; i++) {
    if(tweets[i].created_at === req.body.created_at) {
      //Post request to api.
      T.post('favorites/create', { id: `${tweets[i].id_str}` }, (err, data, response) => {
        if(err)
          return res.render('error', { err });
      }).then(function() {
        return res.redirect('/');
      });
    }
  }
});

module.exports = router;
