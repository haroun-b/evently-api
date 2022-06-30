const express = require(`express`),
  app = express(),
  logger = require('morgan');


// provides access to environment variables/settings
require('dotenv/config');

// connects to the database
require('./db/connect')();

// provides logging in the development environment
app.use(logger('dev'));

// provides access to the `body` property in the request
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// adds routing
app.use(`/`, require(`./routers/index.router.js`));



// adds error handling
app.use(require(`./middleware/errorHandling.middleware`));


// starts the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});