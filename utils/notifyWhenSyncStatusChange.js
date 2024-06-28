const Cron = require('croner');

const makeLogger = require('./logger');
const writeNotificationToFile = require('./writeNotificationToFile');

const logger = makeLogger(__filename);

const NODE_STATUS_URL = 'http://localhost:26657/status';

let latestCatchingUpStatus = false;

module.exports = () => {
  Cron('*/10 * * * * *', () => {
    fetch(NODE_STATUS_URL)
      .then(response => response.json())
      .then(({ result: { sync_info: { catching_up } } }) => {
        if (catching_up != latestCatchingUpStatus) {
          writeNotificationToFile({
            title: catching_up ? 'notification-node-catching-up-title' : 'notification-node-synced-title',
            message: catching_up ? 'notification-node-catching-up-message' : 'notification-node-synced-message'
          });

          latestCatchingUpStatus = catching_up;
        };
      })
      .catch(err => {
        logger.error(err);
      });
  });
};