const stockService = require('../services/stockService');
const mathUtils = require('../utils/mathUtils');

const getAllStocks = async (req, res) => {
    try {
        const stocks = await stockService.getAllStocks();
        res.json({
            stocks
        });
    } catch (error) {
        console.error('Error fetching all stocks:', error);
        res.status(500).json({ 
            error: error.message || 'Server error'
        });
    }
};


const getStockAverage = async (req, res) => {
    try {
        const { ticker } = req.params;
        const minutes = req.query.minutes ? parseInt(req.query.minutes) : null;
        const aggregation = req.query.aggregation || 'average';
        
        if (!ticker) {
            return res.status(400).json({ 
                error: 'Ticker is required'
            });
        }
        
        // Fetch stock price history
        const priceHistory = await stockService.getStockPriceHistory(ticker, minutes);
        
        if (!priceHistory || priceHistory.length === 0) {
            return res.status(404).json({ 
                error: 'No price data found for the specified ticker and time range'
            });
        }
        
        // Calculate average price
        const prices = priceHistory.map(record => record.price);
        const averageStockPrice = mathUtils.calculateAverage(prices);
        
        res.json({
            averageStockPrice,
            priceHistory
        });
    } catch (error) {
        console.error('Error in average stock price API:', error);
        res.status(500).json({ 
            error: error.message || 'Server error'
        });
    }
};

