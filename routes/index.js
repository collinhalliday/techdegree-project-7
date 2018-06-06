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
let msgSenderArray = [];
let msgRecipientArray = [];
let convoWithArray = [];
let convoWithScreenNameArray = [];
let userInfo;

// function getDirectMessages () {
//   let result;
//   T.get('direct_messages/events/list', { }, (err, data, response) => {
//       if(err)
//         result = err;
//       data.events.forEach(function(message) {
//         message.timeSent = functions.compareDates(functions.formatTimeStamp(message.created_timestamp), true);
//         message.text = functions.createLinks(message.message_create.message_data);
//         message.text = functions.createHashLinks(message);
//         msgSenderIdArray.push(message.message_create.sender_id);
//         msgRecipientIdArray.push(message.message_create.target.recipient_id);
//         messages.push(message);
//       });
//       result = data;
//   }).then(function() {
//       return result;
//   });
// }
//
// function getDMSenderInfo () {
//   if(messages.length > 0) {
//     T.get('users/lookup', { user_id: msgSenderIdArray.toString(' ') }, (err, data, response) => {
//       if(err)
//         return err;
//       msgSenderArray = data;
//       messages.forEach(function(message) {
//         for(let i = 0; i < msgSenderArray.length; i++) {
//           if(message.message_create.sender_id === msgSenderArray[i].id_str) {
//             message.senderInfo = msgSenderArray[i];
//           }
//         }
//       });
//       return data;
//     });
//   }
// }
//
// function getDMRecieverInfo() {
//   if(messages.length > 0) {
//     T.get('users/lookup', { user_id: msgRecipientIdArray.toString(' ') }, (err, data, response) => {
//       if(err)
//         return err;
//       msgRecipientArray = data;
//       messages.forEach(function(message) {
//         for(let i = 0; i < msgSenderArray.length; i++) {
//           if(message.message_create.target.recipient_id === msgRecipientArray[i].id_str) {
//             message.recipientInfo = msgRecipientArray[i];
//           }
//         }
//       });
//       messages.forEach(function(message) {
//         if(message.senderInfo.name !== userInfo.name) {
//           message.convoWith = message.senderInfo.name;
//           message.convoWithScreenName = message.senderInfo.screen_name;
//         } else {
//           message.convoWith = message.recipientInfo.name;
//           message.convoWithScreenName = message.recipientInfo.screen_name;
//         }
//         if(!convoWithArray.includes(message.convoWith)) {
//           convoWithArray.push(message.convoWith);
//           convoWithScreenNameArray.push(message.convoWithScreenName);
//         }
//       });
//       return data;
//     });
//   }
// }

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
  //Retrieving user account info.
  T.get('account/verify_credentials', { }, (err, data, response) => {
    if(err)
      return res.render('error', { err });
    userInfo = data;
  })
  //Retrieving tweet info.
  .then(function() {
    T.get('search/tweets', { q: `from:@${userInfo.screen_name}`, count: 5 }, (err, data, response) => {
      if(err)
        return res.render('error', { err });
      data.statuses.forEach(function(tweet) {
        tweet.postedValue = functions.compareDates(tweet.created_at);
        tweet.text = functions.createLinks(tweet);
        tweet.text = functions.createHashLinks(tweet);
        //tweet.hashLinkText = functions.createHashLinks(tweet);
        tweets.push(tweet);
      });
    })
  //Retrieving friends info.
  .then(function() {
      T.get('friends/list', { count: 5 }, (err, data, response) => {
        if(err)
          return res.render('error', { err });
        data.users.forEach(function(friend) {
          friends.push(friend);
        });
      })
  //Retrieving direct messages info.
  .then(function() {
    T.get('direct_messages/events/list', { }, (err, data, response) => {
        if(err)
          return res.render('error', { err });
        data.events.forEach(function(message) {
          message.timeSent = functions.compareDates(functions.formatTimeStamp(message.created_timestamp), true);
          message.text = functions.createLinks(message.message_create.message_data);
          message.text = functions.createHashLinks(message);
          msgSenderIdArray.push(message.message_create.sender_id);
          msgRecipientIdArray.push(message.message_create.target.recipient_id);
          messages.push(message);
        });
    })

  //Retrieving direct message sender info.
  .then(function() {
    if(messages.length < 1) {
        return res.render("main", { tweets, friends, messages, convoWithArray, convoWithScreenNameArray, userInfo });
    } else {
        T.get('users/lookup', { user_id: msgSenderIdArray.toString(' ') }, (err, data, response) => {
          if(err)
            return res.render('error', { err });
          msgSenderArray = data;
          messages.forEach(function(message) {
            for(let i = 0; i < msgSenderArray.length; i++) {
              if(message.message_create.sender_id === msgSenderArray[i].id_str) {
                message.senderInfo = msgSenderArray[i];
              }
            }
          });
        })
      //Retrieving direct message receiver info.
      .then(function() {
          T.get('users/lookup', { user_id: msgRecipientIdArray.toString(' ') }, (err, data, response) => {
            if(err)
              return res.render('error', { err });
            msgRecipientArray = data;
            messages.forEach(function(message) {
              for(let i = 0; i < msgRecipientArray.length; i++) {
                if(message.message_create.target.recipient_id === msgRecipientArray[i].id_str) {
                  message.recipientInfo = msgRecipientArray[i];
                }
              }
            });
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
          })
      //Rendering pug template with info retrieved above.
      .then(function() {
        //console.log(messages);
        // console.log(convoWithArray);
        return res.render("main", { tweets, friends, messages, convoWithArray, convoWithScreenNameArray, userInfo });
      });
      });
    }
});
});
});
});
});

router.post('/like', (req, res) => {
  for(let i = 0; i < tweets.length; i++) {
    if(tweets[i].created_at === req.body.created_at) {
      T.post('favorites/create', { id: `${tweets[i].id_str}` }, (err, data, response) => {
        if(err)
          return res.render('error', { err });
      }).then(function() {
        return res.redirect('/');
      });
    }
  }
});

router.post('/retweet', (req, res) => {
  for(let i = 0; i < tweets.length; i++) {
    if(tweets[i].created_at === req.body.created_at) {
      T.post('statuses/retweet/:id', { id: `${tweets[i].id_str}` }, (err, data, response) => {
          if(err)
            return res.render('error', { err });
      }).then(function() {
        return res.redirect('/');
      });
    }
  }
});

router.post('/reply', (req, res) => {
  for(let i = 0; i < tweets.length; i++) {
    if(tweets[i].created_at === req.body.created_at) {
      T.post('statuses/update', { status: req.body.replyMessage, in_reply_to_status_id: `${tweets[i].id_str}` }, (err, data, response) => {
          if(err)
            return res.render('error', { err });
      }).then(function() {
        return res.redirect('/');
      });
    }
  }
});

router.post('/unfollow', (req, res) => {
  T.post('friendships/destroy', { name: req.body.name, screen_name: req.body.screen_name }, (err, data, response) => {
      if(err)
        return res.render('error', { err });
  }).then(function() {
    return res.redirect('/');
  });
});

router.post('/tweet', (req, res) => {
  T.post('statuses/update', { status: req.body.tweet }, (err, data, response) => {
    if(err)
      return res.render('error', { err });
  }).then(function() {
    return res.redirect('/');
  });
});


module.exports = router;
