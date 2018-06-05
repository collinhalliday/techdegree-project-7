//May not need this. If I do, it will be to limit the number of days in which the API searches back for tweets.
function getCurrentDate() {
  let date = new Date();
	let year = date.getFullYear();
	let month = date.getMonth();
	let day = date.getDate();
  day -= 1;
	return year + '-' + month + '-' + day;
}

function formatTimeStamp(timeStamp) {
  // let timeObj = {};
  // timeObj.timeInMs = Date.now();
  // timeObj.msDifference = timeObj.timeInMs - timeStamp;
  // timeObj.seconds = msDifference/1000;
  // timeObj.minutes = seconds/60;
  // timeObj.hours = minutes/60;
  // timeObj.days = hours/24;
  // return timeObj;
  return new Date(parseInt(timeStamp)).toString();
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

  let timePostedString = '';
  let datePosted = date;
  let milliseconds = new Date() - new Date(date);
  let seconds = milliseconds/1000;
  let minutes = seconds/60;
  let hours = minutes/60;
  let days = hours/24;
  if(days > 2) {
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

// function createHashLinks(tweet) {
//   if(tweet.entities.hashtags.length > 0) {
//     let messageArray = tweet.text.split('#');
//     let alternativeText = '';
//     for(let i = 0; i < messageArray.length; i++) {
//       if(i > 0)
//       //  alternativeText += `<a href="http://twitter.com/hashtag/${messageArray[i]}?src=hash">#${messageArray[i]}</a>`;
//         alternativeText += `<a class="hashlinks" href="http://twitter.com/hashtag/${messageArray[i]}?src=hash"> #${messageArray[i]}</a>`;
//       else
//         alternativeText += messageArray[i] + ' ';
//     }
//     return alternativeText;
//   }
// }

// function createHashLinks(data) {
//     let messageArray = data.text.split('#');
//     let alternativeText = '';
//     for(let i = 0; i < messageArray.length; i++) {
//       if(i > 0)
//       //  alternativeText += `<a href="http://twitter.com/hashtag/${messageArray[i]}?src=hash">#${messageArray[i]}</a>`;
//         alternativeText += `<a class="hashlinks" href="http://twitter.com/hashtag/${messageArray[i]}?src=hash"> #${messageArray[i]}</a>`;
//       else
//         alternativeText += messageArray[i] + ' ';
//     }
//     return alternativeText;
// }

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

// function createLinks(data) {
//   let messageArray = data.text.split('://');
//   let alternativeText = '';
//   for(let i = 0; i < messageArray.length; i++) {
//     if(i > 0)
//     //  alternativeText += `<a href="http://twitter.com/hashtag/${messageArray[i]}?src=hash">#${messageArray[i]}</a>`;
//       alternativeText += `<a class="links" href="http://${messageArray[i]}"> http://${messageArray[i]}</a>`;
//     else
//       alternativeText += messageArray[i] + ' ';
//   }
//   return alternativeText;
// }

function createLinks(data) {
  let messageArray = data.text.split(' ');
  let alternativeText = '';
  for(let i = 0; i < messageArray.length; i++) {
    if(messageArray[i].indexOf('://') > -1)
    //  alternativeText += `<a href="http://twitter.com/hashtag/${messageArray[i]}?src=hash">#${messageArray[i]}</a>`;
      alternativeText += `<a class="links" href="${messageArray[i]}"> ${messageArray[i]}</a> `;
    else
      alternativeText += messageArray[i] + ' ';
  }
  return alternativeText;
}

module.exports.createHashLinks = createHashLinks;
module.exports.createLinks = createLinks;
module.exports.compareDates = compareDates;
module.exports.formatTimeStamp = formatTimeStamp;
