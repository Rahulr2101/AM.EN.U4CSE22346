const axios = require('axios');
const cacheService = require('../utils/cacheService');
require('dotenv').config();


const API_BASE_URL = 'http://20.244.56.144/evaluation-service';
let authToken = null;
let tokenExpiry = 0;


const credentials = {
    email: process.env.API_EMAIL || "", 
    name: process.env.API_NAME || "", 
    rollNo: process.env.API_ROLL_NO || "", 
    accessCode: process.env.API_ACCESS_CODE || "", 
    clientID: process.env.API_CLIENT_ID || "", 
    clientSecret: process.env.API_CLIENT_SECRET || ""
};


async function getAuthToken() {
    const currentTime = Math.floor(Date.now() / 1000);
    
    if (authToken && tokenExpiry > currentTime + 300) {
        return authToken;
    }
    
    try {
        const response = await axios.post(`${API_BASE_URL}/auth`, credentials);
        authToken = response.data.access_token;
        tokenExpiry = response.data.expires_in;
        return authToken;
    } catch (error) {
        console.error('Error getting auth token:', error.message);
        throw new Error('Failed to get authorization token');
    }
}


async function getAllStocks() {
    // Check cache first
    const cacheKey = 'all_stocks';
    const cachedStocks = cacheService.get(cacheKey);
    
    if (cachedStocks) {
        console.log('Using cached stocks data');
        return cachedStocks;
    }
    
    try {
        const token = await getAuthToken();
        const response = await axios.get(`${API_BASE_URL}/stocks`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        cacheService.set(cacheKey, response.data.stocks, 10 * 60 * 1000);
        
        return response.data.stocks;
    } catch (error) {
        console.error('Error fetching stocks:', error.message);
        throw new Error('Failed to fetch stocks');
    }
}

async function getStockPriceHistory(ticker, minutes) {
   
    const cacheKey = `stock_${ticker}_${minutes || 'latest'}`;
    const cachedData = cacheService.get(cacheKey);
    

    const cacheTTL = minutes ? 60000 : 20000; 
    
    if (cachedData) {
        console.log(`Using cached price data for ${ticker}`);
        return cachedData;
    }
    
    try {
        const token = await getAuthToken();
        const url = minutes 
            ? `${API_BASE_URL}/stocks/${ticker}?minutes=${minutes}`
            : `${API_BASE_URL}/stocks/${ticker}`;
            
        const response = await axios.get(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        let result;
        
        if (Array.isArray(response.data)) {
            result = response.data;
        } else if (response.data.stock) {
            result = [response.data.stock];
        } else {
            result = [];
        }
        
        cacheService.set(cacheKey, result, cacheTTL);
        
        return result;
    } catch (error) {
        console.error(`Error fetching stock price for ${ticker}:`, error.message);
        throw new Error(`Failed to fetch stock price for ${ticker}`);
    }
}

module.exports = {
    getAllStocks,
    getStockPriceHistory
}; 