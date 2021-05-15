const express = require('express');
const http = require('http');
const https = require('https');
const fs = require('fs');
const app = express();
const routes = require('./routes');
const morgan = require('morgan');
const helmet = require('helmet');
const redisClient = require('redis').createClient()
const { SERVER_PORT } = require('./source/config/config');
const global = require('./source/global');
app.use(helmet());
app.use(morgan('dev'));

var limiter = require('express-limiter')(app, redisClient);
limiter({
  path: '*',
  method: 'all',
  lookup: ['connection.remoteAddress'],
  total: global.RATE_LIMITER.MAX_REQUEST,
  expire: global.RATE_LIMITER.LIMIT_EXPIRY_TIME,
  onRateLimited: (req, res, next) => {
    res.status(429);
    res.send('Please dont flood the server.')
  }
});

// const server = https.createServer({key: privateKey, cert: certificate},app);
app.use(routes);
const server = http.createServer(app);
// console.log(routes.stack.map(routesData => routesData.route.path))
server.listen(SERVER_PORT, () => {
  console.log(`Server started at port : ${SERVER_PORT}`);
});

