const Cron = require('croner');
const fs = require('fs');

const makeLogger = require('./logger');

const logger = makeLogger(__filename);

const KLEIN_NODE_ROUTE_FILE_PATH = '/app/klein-node-volume/klein-node-route.txt';
const PRE_UPGRADE_SCRIPT_FILE_PATH = '/app/klein-node-volume/cosmovisor/pre-upgrade.sh';

module.exports = () => {
  Cron('*/5 * * * *', () => {
    fs.access(KLEIN_NODE_ROUTE_FILE_PATH, fs.constants.F_OK, err => {
      if (err) return;

      fs.readFile(KLEIN_NODE_ROUTE_FILE_PATH, 'utf8', (err, klein_node_route) => {
        if (err)
          return logger.error(err);

        fetch(`https://raw.githubusercontent.com/node101-io/klein-scripts-v1/main/${klein_node_route.trim()}/pre-upgrade.sh`)
          .then(pre_upgrade_script => {
            fs.writeFile(PRE_UPGRADE_SCRIPT_FILE_PATH, pre_upgrade_script, err => {
              if (err)
                return logger.error(err);

              logger.activity('pre-upgrade script updated');
            });
          })
          .catch(err => {
            logger.error(err);
          });
      });
    });
  });
};