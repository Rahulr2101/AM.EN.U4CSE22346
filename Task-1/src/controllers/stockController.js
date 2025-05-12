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


const getStockCorrelation = async (req, res) => {
    try {
        const minutes = req.query.minutes ? parseInt(req.query.minutes) : null;
        const tickers = req.query.ticker;
        
        if (!tickers || !Array.isArray(tickers) || tickers.length !== 2) {
            return res.status(400).json({ 
                error: 'Exactly two tickers are required'
            });
        }
        
        const [ticker1, ticker2] = tickers;
        
     
        const [priceHistory1, priceHistory2] = await Promise.all([
            stockService.getStockPriceHistory(ticker1, minutes),
            stockService.getStockPriceHistory(ticker2, minutes)
        ]);
        
        if (!priceHistory1.length || !priceHistory2.length) {
            return res.status(404).json({ 
                error: 'No price data found for one or both tickers'
            });
        }
        const prices1 = priceHistory1.map(record => record.price);
        const prices2 = priceHistory2.map(record => record.price);
        
        const averagePrice1 = mathUtils.calculateAverage(prices1);
        const averagePrice2 = mathUtils.calculateAverage(prices2);
        
  
        const minLength = Math.min(prices1.length, prices2.length);
        const alignedPrices1 = prices1.slice(0, minLength);
        const alignedPrices2 = prices2.slice(0, minLength);
    
        const correlation = mathUtils.calculateCorrelation(alignedPrices1, alignedPrices2);
        
        res.json({
            correlation: parseFloat(correlation.toFixed(4)),
            stocks: {
                [ticker1]: {
                    averagePrice: averagePrice1,
                    priceHistory: priceHistory1
                },
                [ticker2]: {
                    averagePrice: averagePrice2,
                    priceHistory: priceHistory2
                }
            }
        });
    } catch (error) {
        console.error('Error in stock correlation API:', error);
        res.status(500).json({ 
            error: error.message || 'Server error'
        });
    }
};

module.exports = {
    getAllStocks,
    getStockAverage,
    getStockCorrelation
}; 