const bodyParser = require('body-parser');
const express = require('express');
const http = require('http');

const makeLogger = require('./utils/logger');
const notifyWhenNewNodeInstalled = require('./utils/notifyWhenNewNodeInstalled');
const notifyWhenSyncStatusChange = require('./utils/notifyWhenSyncStatusChange');
const writeLatestBlockInfoToFile = require('./utils/writeLatestBlockInfoToFile');

const app = express();
const server = http.createServer(app);

const statusRoute = require('./routes/status');
const statsRoute = require('./routes/stats');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/status', statusRoute);
app.use('/stats', statsRoute);

const logger = makeLogger(__filename);

server.listen(10101, () => {
  notifyWhenNewNodeInstalled();
  notifyWhenSyncStatusChange();
  writeLatestBlockInfoToFile();

  logger.activity('App started');
});