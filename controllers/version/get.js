const { version } = require('../../package.json');

module.exports = (req, res) => {
  return res.json({ version });
};