const async = require('async');
const fs = require('fs');
const path = require('path');

const ERROR_FILE_PATH = path.join(__dirname, '../data/error.txt');
const LOG_FILE_PATH = path.join(__dirname, '../data/log.txt');
const MAX_LOGS = 20;

const logQueue = async.queue((data, callback) => {
  logToFile(data, (err, result) => {
    if (err)
      return callback(err);

    return callback(null);
  });
}, 1);

const incrementLogRepeatCount = log => {
  const logParts = log.split(' ');

  const count = Number(logParts[0].replace('[', '').replace(']', '')) + 1;

  return `[${count}] ${logParts[1].split('-----')[0]}-----${new Date().toISOString() } -> ${logParts.slice(3).join(' ')}`;
};

const logToFile = (data, callback) => {
  if (!fs.existsSync(LOG_FILE_PATH)) {
    fs.writeFile(LOG_FILE_PATH, '', err => {
      if (err)
        return callback('write_error');

      logToFile(data, callback);
    });
  } else {
    if (!data.logFile || typeof data.logFile != 'string')
      return callback('bad_request');

    if (!data.message || typeof data.message != 'string')
      return callback('bad_request');

    if (!data.currentFile || typeof data.currentFile != 'string')
      return callback('bad_request');

    const isRepeating = data && typeof data == 'object' ? !!data.is_repeating : false;

    if (isRepeating) {
      fs.readFile(data.logFile, (err, content) => {
        if (err)
          return callback('read_error');

        const logsByLine = content.toString().split('\n');
        const index = logsByLine.findLastIndex(line => line.includes(data.message));

        if (index == -1)
          return logToFile({ ...data, is_repeating: false }, callback);

        logsByLine[index] = incrementLogRepeatCount(logsByLine[index]);

        while (logsByLine.length > MAX_LOGS)
          logsByLine.shift();

        fs.writeFile(data.logFile, logsByLine.join('\n'), err => {
          if (err)
            return callback('write_error');

          return callback(null);
        });
      });
    } else {
      const log = `[0] ${new Date().toISOString()} -> ${data.message} ${data.currentFile}\n`;

      fs.appendFile(data.logFile, log, err => {
        if (err)
          return callback('write_error');

        return callback(null);
      });
    };
  };
};

const makeLogger = fileName => {
  return {
    activity: (message, options) => {
      logQueue.push({
        logFile: LOG_FILE_PATH,
        message: message,
        currentFile: path.basename(fileName),
        ...options
      });
    },
    error: (message, options) => {
      logQueue.push({
        logFile: ERROR_FILE_PATH,
        message: message,
        currentFile: path.basename(fileName),
        ...options
      });
    }
  };
};

module.exports = makeLogger;