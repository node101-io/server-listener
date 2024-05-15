const getServerStats = require('../../utils/getServerStats');

module.exports = (req, res) => {
  return res.json(getServerStats());
};