document.addEventListener("DOMContentLoaded", function(){
  //Grabbing elements and setting variables.
  const tweetList = document.getElementsByClassName('app--tweet--list')[0];
  const tweets = tweetList.children;
  const likeLinks = document.getElementsByClassName('app--like');
  const retweetLinks = document.getElementsByClassName('app--retweet');
  const replyLinks = document.getElementsByClassName('app--reply');
  const timeStamps = document.getElementsByClassName('time-stamp');
  const unfollowLinks = document.getElementsByClassName('unfollow');
  const friendNames = document.getElementsByClassName('friend-name');
  const friendUserNames = document.getElementsByClassName('screen-name');
  const tweetForm = document.getElementById('tweet-form');
  const tweetTextArea = document.getElementById('tweet-textarea');
  const tweetButton = document.getElementsByClassName('button-primary')[0];
  const tweetChar = document.getElementById('tweet-char');
  const pictureElements = document.getElementsByClassName('app--avatar');
  let pictureUrl;
  const names = document.getElementsByTagName('h4');
  let userName;
  const timesSent = document.getElementsByClassName('app--tweet--timestamp');;
  let message;

  //If user has friends, there will be unfollow links on the page. This function provides them
  //with functionality by adding event listeners that post to the /unfollow route on the server
  //when each link is clicked.
  if(unfollowLinks) {
    for(let i = 0; i < unfollowLinks.length; i++) {
      unfollowLinks[i].addEventListener('click', function() {
        post('/unfollow', { name: `${friendNames[i].textContent}`, screen_name: `${friendUserNames[i].textContent}` }, 'post');
      });
    }
  }

  //If user has tweets, there will be like links, retweet links and reply links on the page. This function provides each
  //of them with functionality by adding event listeners that, for like links and retweet links, post to the proper routes
  //on the server. For the reply links, however, a modal window is created similar to that appearing on twitter, allowing
  //users to type out and sumbit a reply tweet.
  if(likeLinks) {
    for(let i = 0; i < likeLinks.length; i++) {
      //Like link event listeners
      likeLinks[i].parentNode.addEventListener('click', function () {
        post('/like', { created_at: `${timeStamps[i].textContent}` }, 'post');
      });
      //Retweet link event listeners
      retweetLinks[i].parentNode.addEventListener('click', function () {
        post('/retweet', { created_at: `${timeStamps[i].textContent}` }, 'post');
      });
      //Reply link event listeners
      replyLinks[i].parentNode.addEventListener('click', function (event) {
        let index;
        if((event.target.tagName === 'path' && replyLinks[i] === event.target.parentNode.parentNode) ||
           (event.target.tagName === 'svg' && replyLinks[i] === event.target.parentNode)) {
              for(let i = 0; i < replyLinks.length; i++) {
                if(replyLinks[i] === event.target.parentNode.parentNode ||
                   replyLinks[i] === event.target.parentNode){
                      index = i;
                      //Creates modal window for reply tweets
                      let modalHTML = createModalWindow(index);
                      document.body.appendChild(modalHTML);
                      //Adds event listener to modal window that show and remove placeholder text, and validates the input, limiting
                      //it to 140 characters or less.
                      document.getElementById('modal-reply').addEventListener('input', function() {
                        document.getElementById('modal-reply').classList.remove('is-showPlaceholder');
                        if(document.getElementsByClassName('text-div')[0].textContent === '')
                          document.getElementById('modal-reply').className += ' is-showPlaceholder';
                        document.getElementsByClassName('char-div')[0].textContent = document.getElementsByClassName('text-div')[0].textContent.length;
                        validateFormInput(document.getElementsByClassName('text-div')[0].textContent,
                                          document.getElementsByClassName('modal-submit')[0],
                                          'modal-submit no-hover',
                                          document.getElementsByClassName('char-div')[0]);
                      });
                      //Adds event listener to the button on the modal window that submits the related form and post request upon
                      //each click, assuming user has typed something and that something is 140 characters or less.
                      document.getElementsByClassName('modal-submit')[0].addEventListener('click', function(event) {
                        let message = document.getElementsByClassName('text-div')[0].textContent;
                        document.getElementsByClassName('hidden-input-message')[0].value = message;
                        document.getElementsByTagName('form')[1].submit();
                      });
                      setOverlay();
                    }
              }
        }
      });
    }
  }

  //Form input validation for tweet form at bottom of app page.
  tweetTextArea.addEventListener('input', function() {
    tweetChar.textContent = tweetTextArea.value.length;
    validateFormInput(tweetTextArea.value, tweetButton, 'button-primary no-hover', tweetChar);
  });

  //Adds event listener to to button on tweet form that submits for assuming input is valid.
  tweetButton.addEventListener('click', function() {
    const tweetInput = document.getElementById('tweet-input');
    tweetInput.value = tweetTextArea.value;
    tweetForm.submit();
  });

//Post function that essentially creates hidden forms and inputs to perform post requests upon clicks of
//unfollow, like and retweet links. Forms are created and then submitted upon function execution.
function post(path, params, method) {
    var form = document.createElement("form");
    form.setAttribute("method", method);
    form.setAttribute("action", path);

    for(var key in params) {
        if(params.hasOwnProperty(key)) {
            var hiddenField = document.createElement("input");
            hiddenField.setAttribute("type", "hidden");
            hiddenField.setAttribute("name", key);
            hiddenField.setAttribute("value", params[key]);

            form.appendChild(hiddenField);
        }
    }

    document.body.appendChild(form);
    form.submit();
}

//Validates form input for both tweet and reply forms, enabling and disabling (greying out) related buttons
//appropriately, rendering the character counter red when input is 140 chars or greater.
function validateFormInput(inputText, button, buttonClassName, char) {
  if(inputText.length === 0) {
      button.disabled = true;
      button.style.opacity = .5;
      button.className = buttonClassName;
  } else if(inputText.length > 140) {
      button.disabled = true;
      button.style.opacity = .5;
      button.className = buttonClassName;
      char.style.color = 'red';
  } else {
      button.disabled = false;
      button.style.opacity = 1;
      button.classList.remove('no-hover');
      char.style.color = '';
  }
}

//Creates the modal window that appears upon click of reply button. Designed after the same window appearing on
//twitter for tweet replies.
function createModalWindow(index) {
  let pictureElement = pictureElements[index + 1];
  pictureUrl = pictureElement.style.backgroundImage.replace('url(', '').replace(')', '').replace('"', '').replace('"', '');
  let name = names[index].textContent;
  userName = names[index].nextSibling.textContent;
  let timeSent = timesSent[index].textContent;
  let messageElement = tweets[index].children[2];
  message = messageElement.textContent;
  let element = document.createElement('div');
  element.className = 'modal';
  element.id = 'myModal';
  let html = '<div class="modal-header">';
       html += '<span class="close">&times;</span>';
       html += '<h1>Add another Tweet</h1>';
       html += '</div>';
       html += '<div class="modal-content">';
       html += '<div class="modal-image"><img src="' +
               pictureUrl +
               '"/></div>';
       html += '<div class="modal-text">';
       html += '<p class="modal-name">' + name + '</p>';
       html += '<a href="' + tweets[index].children[1].href + '"><p class="modal-username">' + userName + '</p></a>';
       html += '<p class="modal-dot">.</p>';
       html += '<p class="modal-time-sent">' + timeSent + '</p>';
       //html += '<p class="modal-message">' + message + '</p>';
       html += '<p class="modal-message">' + createLinks(messageElement) + '</p>';
       html += '</div>';
       html += '<div class="form">';
       html += '<form action="/reply" method="post">';
       html += '<div name="reply" id="modal-reply" class="modal-reply is-showPlaceholder" contenteditable="true" spellcheck="true" ';
       html += 'role="textbox" aria-multiline="true"';
       html += 'data-placeholder-reply="Add another Tweet" dir="ltr"';
       html += 'aria-expanded="false" aria-owns="typeahead-dropdown-6"><div class="text-div"></div></div>';
       html += '<div class="char-div">0</div>';
       html += '<div><br></div>';
       html += '<input type="hidden" name="created_at" value="' + document.getElementsByClassName('time-stamp')[0].textContent + '">'
       html += '<input class="hidden-input-message" type="hidden" name="replyMessage" value="">';
       html += '<button type="button" class="modal-submit no-hover" style="opacity: 0.5;" disabled><span>Tweet</span></button>';
       html += '</form></div>';
  element.innerHTML = html;

  //Creates an event listener for the modal window and provides handlers for the close button.
  element.addEventListener('click', function(event) {
    modalWindow = document.getElementsByClassName('modal')[0];
    //Close button handler
    if(event.target.className === 'close') {
        modalWindow.parentNode.removeChild(modalWindow);
        removeOverlay();
    }
  });
  return element;
}

//Setting properties and values for the overlay div to provide lightbox effect when modal window appears.
function setOverlay() {
  let overlay = document.getElementById('overlay');
  overlay.style.position = 'fixed';
  overlay.style.top = '0px';
  overlay.style.left = '0px';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.background = '#000';
  overlay.style.opacity = '.50';
  overlay.style.filter = 'alpha(opacity=0)';
  overlay.style.zIndex = '50';
}

//Removing overlay div's property values to remove lightbox effect.
function removeOverlay() {
  let overlay = document.getElementById('overlay');
  overlay.style.position = '';
  overlay.style.top = '';
  overlay.style.left = '';
  overlay.style.width = '';
  overlay.style.height = '';
  overlay.style.background = '';
  overlay.style.opacity = '';
  overlay.style.filter = '';
  overlay.style.zIndex = '';
}

//Allows links and and hashtags in message text to appear as such, instead of just plain text.
function createLinks(messageElement) {
  if(messageElement.hasChildNodes()) {
    let messageArray = messageElement.textContent.split(' ');
    let alternativeText = '';
    for(let i = 0; i < messageArray.length; i++) {
      if(messageArray[i].indexOf('://') > -1)
        alternativeText += `<a class="links" href="${messageArray[i]}"> ${messageArray[i]}</a> `;
      else
        alternativeText += messageArray[i] + ' ';
    }
    messageArray = alternativeText.split(' ');
    alternativeText = '';
    for(let i = 0; i < messageArray.length; i++) {
      if(messageArray[i].indexOf('#') > -1) {
        messageArray[i] = messageArray[i].replace('#', '');
        alternativeText += `<a class="hashlinks" href="http://twitter.com/hashtag/${messageArray[i]}?src=hash"> #${messageArray[i]}</a> `;
      } else
          alternativeText += messageArray[i] + ' ';
    }
    return alternativeText;
  }
}

});
