const async = require('async');
const fs = require('fs');

const json = require('./json');
const makeLogger = require('./logger');

const logger = makeLogger(__filename);

const MAX_NOTIFICATIONS = 10;

const notificationQueue = async.queue((data, callback) => {
  writeNotificationToFile(data, (err, result) => {
    if (err)
      return callback(err);

    return callback(null);
  });
}, 1);

const writeNotificationToFile = data => {
  if (!data || typeof data != 'object')
    return logger.error('bad_request');

  if (!data.title && typeof data.title != 'string')
    return logger.error('bad_request');

  if (!data.message && typeof data.message != 'string')
    return logger.error('bad_request');

  fs.readFile('notifications.json', (err, content) => {
    if (err)
      return logger.error(err);

    const notifications = json.jsonify(content) || [];

    data.publish_date = Date.now();
    notifications.push(data);

    while (notifications.length > MAX_NOTIFICATIONS)
      notifications.shift();

    fs.writeFile('notifications.json', json.stringify(notifications), err => {
      if (err)
        return logger.error(err);

      return logger.activity('Notification saved to notifications.json');
    });
  });
};

module.exports = data => {
  notificationQueue.push(data, err => {
    if (err)
      return logger.error(err);

    return logger.activity('Notification queued');
  });
};