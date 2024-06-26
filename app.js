const bodyParser = require('body-parser');
const express = require('express');
const http = require('http');

const makeLogger = require('./utils/logger');
const keepPreUpgradeScriptUpToDate = require('./utils/keepPreUpgradeScriptUpToDate');
// const notifyWhenNewNodeInstalled = require('./utils/notifyWhenNewNodeInstalled');
// const notifyWhenSyncStatusChange = require('./utils/notifyWhenSyncStatusChange');
// const writeLatestBlockInfoToFile = require('./utils/writeLatestBlockInfoToFile');

const app = express();
const server = http.createServer(app);

const statusRoute = require('./routes/statusRoute');
const statsRoute = require('./routes/statsRoute');
const versionRoute = require('./routes/versionRoute');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/status', statusRoute);
app.use('/stats', statsRoute);
app.use('/version', versionRoute);

const logger = makeLogger(__filename);

server.listen(10101, () => {
  keepPreUpgradeScriptUpToDate();
  // notifyWhenSyncStatusChange();
  // writeLatestBlockInfoToFile();
  // notifyWhenNewNodeInstalled();

  logger.activity('App started');
});