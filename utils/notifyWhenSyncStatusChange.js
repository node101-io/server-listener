import Cron from 'croner';

import writeNotificationToFile from './writeNotificationToFile.js';

const NODE_STATUS_URL = 'https://cosmos-rpc.onivalidator.com/status';

let latestCatchingUpStatus = false;

export default () => {
  Cron('*/10 * * * * *', () => {
    fetch(NODE_STATUS_URL)
      .then(response => response.json())
      .then(({ result: { sync_info: { catching_up } } }) => {
        if (catching_up != latestCatchingUpStatus) {
          writeNotificationToFile({
            title: catching_up ? 'Node is catching up' : 'Node is synced',
            message: catching_up ? 'Node is catching up with the latest blocks.' : 'Node is synced with the latest blocks.',
            publish_date: Date.now(),
            translations: {
              tr: {
                title: catching_up ? 'Node senkronize oluyor' : 'Node senkronize',
                message: catching_up ? 'Node en son bloklarla senkronize oluyor.' : 'Node en son bloklarla senkronize.'
              }
            }
          }, err => {
            if (err)
              console.error(err);
          });

          latestCatchingUpStatus = catching_up;
        };
      })
      .catch(err => {
        console.error(err);
      });
  });
};