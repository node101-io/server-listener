const express = require('express');

const router = express.Router();

const statusGetController = require('../controllers/status/get');

router.get(
  '/',
    statusGetController
);

module.exports = router;