import Dockerode from 'dockerode';
import Cron from 'croner';

import writeNotificationToFile from './writeNotificationToFile.js';

let lastContainers;

export default () => {
  const docker = new Dockerode();

  docker.listContainers((err, containers) => {
    if (err)
      return console.error(err);

    lastContainers = containers.map(container => container.Id);
  });

  Cron('*/5 * * * * *', () => {
    docker.listContainers((err, containers) => {
      if (err)
        return console.error(err);

      const newContainers = containers.filter(container => !lastContainers.includes(container.Id) && container.Image.includes('klein-node'));

      if (newContainers.length > 0) {
        writeNotificationToFile({
          title: 'Node installation done!',
          message: 'Go on and explore your node.',
          publish_date: Date.now(),
          translations: {
            tr: {
              title: 'Node kurulumu tamamlandı!',
              message: 'Şimdi node\'unuzu keşfedin.'
            }
          }
        }, err => {
          if (err)
            console.error(err);
        });
      };
    });
  });
};