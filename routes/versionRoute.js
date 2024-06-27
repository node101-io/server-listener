const express = require('express');

const router = express.Router();

const versionGetController = require('../controllers/version/get');

router.get(
  '/',
    versionGetController
);

module.exports = router;