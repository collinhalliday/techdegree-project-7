//Formats timestamp received from twitter api in response to request for direct messages into date
//format to be used in functions below.
function formatTimeStamp(timeStamp) {
  return new Date(parseInt(timeStamp)).toString();
}

//Formats the date posted displayed on the app for both messages and tweets. This is called when tweets
//Or messages are older than 2 days.
function formatDatePosted(dateAndTimePosted, isMessageDate, isYears) {
  isYears = isYears || false;
  function getMonthInt() {
    return new Date(dateAndTimePosted).getMonth() + 1;
  }
  function formatTime(timePosted) {
    let hourPosted = timePosted.split(':')[0];
    let minutePosted = timePosted.split(':')[1];
    if(hourPosted > 12) {
      hourPosted -= 12;
      return hourPosted + ':' + minutePosted + ' PM';
    }
    return hourPosted + ':' + minutePosted + ' AM';
  }
  if(isMessageDate) {
    let timePostedArray = dateAndTimePosted.split(' ');
    let monthPosted = timePostedArray[1];
    let dayPosted = timePostedArray[2];
    let timePosted = timePostedArray[4];
    let yearPosted = timePostedArray[3];
    return getMonthInt() + '/' + dayPosted + '/' + yearPosted + ', ' + formatTime(timePosted);
  } else {
      let timePostedArray = dateAndTimePosted.split(' ');
      let monthPosted = timePostedArray[1];
      let dayPosted = timePostedArray[2];
      let yearPosted = timePostedArray[5];
      if(isYears)
        return getMonthInt() + '/' + dayPosted + '/' + yearPosted;
      else
        return monthPosted + ' ' + dayPosted;
  }
}

//Compares the date posted of a tweet or direct message to get the amount of time that has passed
//since it was posted. Then displays the time since it was posted depending upon how much time
//has passed since posted. Follows format from twitter. Also, as explained above, it will post exact
//date and time for messages that are older than 2 days.
function compareDates(date, isMessageDate) {
  isMessageDate = isMessageDate || false;

  let timePostedString = '';
  let datePosted = date;
  let milliseconds = new Date() - new Date(date);
  let seconds = milliseconds/1000;
  let minutes = seconds/60;
  let hours = minutes/60;
  let days = hours/24;
  let years = days/365;
  if(days > 2) {
      if(years >= 1)
        timePostedString = formatDatePosted(date, isMessageDate, true);
      else
        timePostedString = formatDatePosted(date, isMessageDate);
  } else if(hours >= 24) {
      timePostedString = Math.round(days);
      if(isMessageDate) {
          if(timePostedString === 1)
            timePostedString += ' day ago';
          else
            timePostedString += ' days ago';
      } else
        timePostedString += 'd';
  } else if(minutes >= 60) {
      timePostedString = Math.round(hours);
      if(isMessageDate) {
          if(timePostedString === 1)
            timePostedString += ' hour ago';
          else
            timePostedString += ' hours ago';
      } else
        timePostedString += 'h';
  } else if(seconds >= 60) {
      timePostedString = Math.round(minutes);
      if(isMessageDate) {
        if(timePostedString === 1)
          timePostedString += ' minute ago';
        else
          timePostedString += ' minutes ago';
      } else
        timePostedString += 'm';
  } else if(milliseconds >= 1000) {
      timePostedString = Math.round(seconds);
      if(isMessageDate) {
          if(timePostedString === 1)
            timePostedString += ' second ago';
          else
            timePostedString += ' seconds ago';
      } else
        timePostedString += 's';
  } else {
      timePostedString = 'now';
  }
  return timePostedString;
}

//Creates hash links in text of tweets and direct messages.
function createHashLinks(data) {
    let messageArray = data.text.split(' ');
    let alternativeText = '';
    for(let i = 0; i < messageArray.length; i++) {
      if(messageArray[i].indexOf('#') > -1) {
        messageArray[i] = messageArray[i].replace('#', '');
        alternativeText += `<a class="hashlinks" href="http://twitter.com/hashtag/${messageArray[i]}?src=hash"> #${messageArray[i]}</a> `;
      } else
        alternativeText += messageArray[i] + ' ';
    }
    return alternativeText;
}

//Creates regular links in text of tweets and direct messages.
function createLinks(data) {
  let messageArray = data.text.split(' ');
  let alternativeText = '';
  for(let i = 0; i < messageArray.length; i++) {
    if(messageArray[i].indexOf('://') > -1)
      alternativeText += `<a class="links" href="${messageArray[i]}"> ${messageArray[i]}</a> `;
    else
      alternativeText += messageArray[i] + ' ';
  }
  return alternativeText;
}

//Creates and resturns an api call wrapped in a promise.
function createTweetPromise(twitObj, path, params) {
  return new Promise(function(resolve, reject) {
    twitObj.post(path, params, (err, data, response) => {
      if(err)
        reject(err);
      resolve(data);
      });
    });
}

//Formats new tweets received from api call and adds them to tweet array. Updates timePosted for
//tweets and messages in their corresponding arrays.
function addNewTweet(tweetArray, messageArray, tweet) {
  tweet.postedValue = compareDates(tweet.created_at);
  tweet.text = createLinks(tweet);
  tweet.text = createHashLinks(tweet);
  tweetArray.unshift(tweet);
  if(tweetArray.length > 5)
    tweetArray.pop();
  tweetArray.forEach(function(tweet) {
    tweet.postedValue = compareDates(tweet.created_at);
  });
  if(messageArray.length > 0) {
    messageArray.forEach(function(message) {
      message.timeSent = compareDates(formatTimeStamp(message.created_timestamp), true);
    });
  }
}

module.exports.createHashLinks = createHashLinks;
module.exports.createLinks = createLinks;
module.exports.compareDates = compareDates;
module.exports.formatTimeStamp = formatTimeStamp;
module.exports.createTweetPromise = createTweetPromise;
module.exports.addNewTweet = addNewTweet;
