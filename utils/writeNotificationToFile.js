import fs from 'fs';

export default (data, callback) => {
  fs.readFile('notifications.json', (err, content) => {
    if (err)
      return callback(err);

    let notifications = [];
    try {
      notifications = JSON.parse(content);
    } catch (err) {
      console.error(err);
    };

    notifications.push(data);

    fs.writeFile('notifications.json', JSON.stringify(notifications, null, 2), err => {
      if (err)
        return callback(err);

      return callback(null);
    });
  });
};