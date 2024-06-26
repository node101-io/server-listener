const Cron = require('croner');
const fs = require('fs');

const makeLogger = require('./logger');

const logger = makeLogger(__filename);

const PROJECT_ROUTE_FILE_PATH = '../data/project-route.txt';
const PRE_UPGRADE_SCRIPT_FILE_PATH = '/var/lib/docker/volumes/klein-node_klein-node-volume/_data/cosmovisor/pre-upgrade.sh';

module.exports = () => {
  Cron('0 * * * *', () => {
    fs.access(PROJECT_ROUTE_FILE_PATH, fs.constants.F_OK, err => {
      if (err) return;

      fs.readFile(PROJECT_ROUTE_FILE_PATH, (err, project_route) => {
        if (err)
          return logger.error(err);

        fetch(`https://raw.githubusercontent.com/node101-io/klein-scripts-v1/main/${project_route.trim()}/pre-upgrade.sh`)
          .then(pre_upgrade_script => {
            fs.writeFile(PRE_UPGRADE_SCRIPT_FILE_PATH, pre_upgrade_script, err => {
              if (err)
                return logger.error(err);
            });
          })
          .catch(err => {
            logger.error(err);
          });
      });
    });
  });
};