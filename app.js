const notifyWhenNewNodeInstalled = require('./utils/notifyWhenNewNodeInstalled');
const notifyWhenSyncStatusChange = require('./utils/notifyWhenSyncStatusChange');
const writeLatestBlockInfoToFile = require('./utils/writeLatestBlockInfoToFile');
const makeLogger = require('./utils/logger');

const logger = makeLogger(__filename);

notifyWhenNewNodeInstalled();
notifyWhenSyncStatusChange();
writeLatestBlockInfoToFile();

logger.activity('App started');