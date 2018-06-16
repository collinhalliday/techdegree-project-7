# Twitter Interface

An app that communicates with Twitter's API to retrieve information and display a user's 5 most recent tweets, 5 most recent friends (those followed by the user), and 5 most recent messages. Users can also tweet, retweet, like tweets, reply to tweets, and unfollow from the app.

This project was done in conjunction with my TeamTreehouse full-stack JavaScript TechDegree, as the seventh project of twelve. I was given the html for the app interface and was instructed to convert the html to pug and to program all of the app's functionality and communication with the Twitter API through use of Node.js and the Express framework.

## Installation:

With npm and node.js installed on your computer, entering the following command in your terminal will download all of the project's dependencies:
`npm install`

## Usage:

Once the project's dependencies are installed, the user must have an existing Twitter account, and through that account, the user must create a Twitter application [here](https://apps.twitter.com) Through this process, the user will generate keys and access tokens that must be placed in a config.js file in the project's root directory. The format for placement of the keys and access tokens is as follows:

`module.exports = {
  consumer_key: '*************************',
  consumer_secret: '*************************************************',
  access_token: '*************************************************',
  access_token_secret: '*************************************************',
  timeout_ms: 60 * 1000
};`

For more detailed instructions on this process, look [here](http://iag.me/socialmedia/how-to-create-a-twitter-app-in-8-easy-steps/)

To run the app, enter the following command in your terminal:
`npm start`

Open a browser window, visit the following link and you're ready to go.
http://localhost:3000
