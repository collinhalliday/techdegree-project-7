//May not need this. If I do, it will be to limit the number of days in which the API searches back for tweets.
function getCurrentDate() {
  let date = new Date();
	let year = date.getFullYear();
	let month = date.getMonth();
	let day = date.getDate();
  day -= 1;
	return year + '-' + month + '-' + day;
}

function formatDatePosted(dateAndTimePosted, isMessageDate) {
  function getMonthInt() {
    return new Date(dateAndTimePosted).getMonth() + 1;
  }
  function formatTime() {
    let hourPosted = timePosted.split(':')[0];
    let minutePosted = timePosted.split(':')[1];
    if(hourPosted > 12) {
      hourPosted -= 12;
      return hourPosted + ':' + minutePosted + ' PM';
    }
    return hourPosted + ':' + minutePosted + ' AM';
  }
  let timePostedArray = dateAndTimePosted.split(' ');
  let monthPosted = timePostedArray[1];
  let dayPosted = timePostedArray[2];
  let timePosted = timePostedArray[3];
  let yearPosted = timePostedArray[5];
  if(isMessageDate)
    return getMonthInt() + '/' + dayPosted + '/' + yearPosted + ', ' + formatTime();
  else
    return monthPosted + ' ' + dayPosted;
}

function compareDates(date, isMessageDate) {
  isMessageDate = isMessageDate || false;

  let datePosted = date;
  let milliseconds = new Date() - new Date(date);
  let seconds = milliseconds/1000;
  let minutes = seconds/60;
  let hours = minutes/60;
  let days = hours/24;
  if(days > 2) {
      return formatDatePosted(date, isMessageDate);
  } else if(hours >= 24) {
      return Math.round(days) + 'd';
  } else if(minutes >= 60) {
      return Math.round(hours) + 'h';
  } else if(seconds >= 60) {
      return Math.round(minutes) + 'm';
  } else if(milliseconds >= 1000) {
      return Math.round(seconds) + 'm';
  } else {
      return 'now';
  }
}

function createHashLinks(tweet) {
  if(tweet.entities.hashtags.length > 0) {
    let messageArray = tweet.text.split('#');
    let alternativeText = '';
    for(let i = 0; i < messageArray.length; i++) {
      if(i > 0)
      //  alternativeText += `<a href="http://twitter.com/hashtag/${messageArray[i]}?src=hash">#${messageArray[i]}</a>`;
        alternativeText += `<a class="hashlinks" href="http://twitter.com/hashtag/${messageArray[i]}?src=hash"> #${messageArray[i]}</a>`;
      else
        alternativeText += messageArray[i] + ' ';
    }
    return alternativeText;
  }
}

module.exports.createHashLinks = createHashLinks;
module.exports.compareDates = compareDates;
