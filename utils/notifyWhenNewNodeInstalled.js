const Dockerode = require('dockerode');
const Cron = require('croner');

const makeLogger = require('./logger');
const writeNotificationToFile = require('./writeNotificationToFile');

const RECONNECT_ATTEMPT_INTERVAL = 10 * 1000;

let isRepeatingError = false;

const logger = makeLogger(__filename);

const retryConnectingDocker = () => {
  logger.error('Docker not found, retrying...', { is_repeating: isRepeatingError });
  isRepeatingError = true;
  return setTimeout(notifyWhenNewNodeInstalled, RECONNECT_ATTEMPT_INTERVAL);
};

const notifyWhenNewNodeInstalled = () => {
  const docker = new Dockerode();

  docker.listContainers((err, containers) => {
    if (err && err.code != 'ENOENT')
      return logger.error(err);

    if (err)
      return retryConnectingDocker();

    isRepeatingError = false;

    let lastContainers = containers.map(container => container.Id);

    Cron('*/5 * * * * *', () => {
      docker.listContainers((err, containers) => {
        if (err && err.code != 'ENOENT')
          return logger.error(err);

        if (err)
          return retryConnectingDocker();

        isRepeatingError = false;

        const newContainers = containers.filter(container => !lastContainers.includes(container.Id) && container.Image.includes('klein-node'));

        lastContainers = containers.map(container => container.Id);

        if (newContainers.length == 0)
          return;

        writeNotificationToFile({
          title: 'notification-node-installation-done-title',
          message: 'notification-node-installation-done-message'
        });
      });
    });
  });
};

module.exports = notifyWhenNewNodeInstalled;