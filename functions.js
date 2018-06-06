function formatTimeStamp(timeStamp) {
  return new Date(parseInt(timeStamp)).toString();
}

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

module.exports.createHashLinks = createHashLinks;
module.exports.createLinks = createLinks;
module.exports.compareDates = compareDates;
module.exports.formatTimeStamp = formatTimeStamp;
