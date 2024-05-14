const makeLogger = require("./logger");

const logger = makeLogger(__filename);

module.exports = {
  jsonify: (data) => {
    try {
      return JSON.parse(data || null);
    } catch (err) {
      logger.error('jsonify_error');
      return null;
    };
  },
  stringify: (data) => {
    try {
      return JSON.stringify(data, (key, value) => {
        if (typeof value == 'bigint')
          return value.toString();

        return value;
      }, 2);
    } catch (err) {
      logger.error('stringify_error');
      return null;
    };
  }
};