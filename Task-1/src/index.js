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


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
}); 