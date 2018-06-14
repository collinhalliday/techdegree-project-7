//App setup.
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));
app.set('view engine', 'pug');

//Route setup
const mainRoutes = require('./routes/');
app.use(mainRoutes);

//404 Route Not Found Error
app.use((req, res, next) => {
  const err = new Error('Sorry, that page does not exist');
  err.statusCode = 404;
  res.render('error', { err });
});

//Custom error handler
app.use((req, res, next) => {
  const err = new Error('Whoops! Something went wrong');
  err.statusCode = 500;
  res.render('error', { err });
});

app.listen(3000, () => console.log("The application is running on localhost:3000"));
