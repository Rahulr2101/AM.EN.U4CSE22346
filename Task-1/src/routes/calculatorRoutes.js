
const express = require('express');
const router = express.Router();
const calculatorController = require('../controllers/calculatorController');

router.post('/calculate-average', calculatorController.calculateAverage);

module.exports = router; 