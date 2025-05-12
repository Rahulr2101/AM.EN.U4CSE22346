const express = require('express');
const app = express();
const PORT = 3000;


const calculatorRoutes = require('./routes/calculatorRoutes');
const stockRoutes = require('./routes/stockRoutes');

app.use(express.json());
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    next();
});

app.use('/api', calculatorRoutes);
app.use('/stocks', stockRoutes);

// Get stock correlation - special route outside of /stocks/* to match the required URL pattern
app.get('/stockcorrelation', async (req, res) => {
    const stockController = require('./controllers/stockController');
    await stockController.getStockCorrelation(req, res);
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
}); 