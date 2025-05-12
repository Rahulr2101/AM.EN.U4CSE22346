
const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stockController');


router.get('/', stockController.getAllStocks);

router.get('/correlation', stockController.getStockCorrelation);

router.get('/:ticker', stockController.getStockAverage);

module.exports = router; 