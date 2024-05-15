const express = require('express');

const router = express.Router();

const statsGetController = require('../controllers/stats/get');

router.get(
  '/',
    statsGetController
);

module.exports = router;