const express = require('express');
const router = express.Router();
const Twit = require('twit');
const config = require('../config.js');
const T = new Twit(config);

function getDate() {
  let date = new Date();
	let year = date.getFullYear();
	let month = date.getMonth();
	let day = date.getDate();
  day -= 1;
	return year + '-' + month + '-' + day;
}

router.get('/', (req, res) => {
  console.log(getDate());
  let tweets;
  // T.get('search/tweets', { q: 'from:@CollinHalliday1', since: getDate(), count: 5 }, (err, data, response) => {
  T.get('search/tweets', { q: 'from:@CollinHalliday1', count: 5 }, (err, data, response) => {
    tweets = data.statuses;
    console.dir(tweets[0]);
  });
  res.render("main", { tweets });
});

module.exports = router;
