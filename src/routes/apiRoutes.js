const express = require('express');
const router = express.Router();
const systemController = require('../controllers/systemController');

// root
router.get('/', systemController.getHealthCheck);

// health
router.get('/health', systemController.getHealthCheck);

module.exports = router;