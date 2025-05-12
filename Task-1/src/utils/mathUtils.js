function calculateAverage(values) {
    if (!values || values.length === 0) return 0;
    const sum = values.reduce((acc, val) => acc + val, 0);
    return sum / values.length;
}

function calculateStandardDeviation(values, mean) {
    if (!values || values.length < 2) return 0;
    
    const avg = mean !== undefined ? mean : calculateAverage(values);
    const squareDiffs = values.map(value => {
        const diff = value - avg;
        return diff * diff;
    });
    
    const avgSquareDiff = calculateAverage(squareDiffs);
    return Math.sqrt(avgSquareDiff);
}

function calculateCovariance(xValues, yValues, xMean, yMean) {
    if (!xValues || !yValues || xValues.length !== yValues.length || xValues.length < 2) {
        return 0;
    }
    
    const n = xValues.length;
    const xAvg = xMean !== undefined ? xMean : calculateAverage(xValues);
    const yAvg = yMean !== undefined ? yMean : calculateAverage(yValues);
    
    let covariance = 0;
    for (let i = 0; i < n; i++) {
        covariance += (xValues[i] - xAvg) * (yValues[i] - yAvg);
    }
    
    return covariance / (n - 1);
}



function calculateCorrelation(xValues, yValues) {
    if (!xValues || !yValues || xValues.length !== yValues.length || xValues.length < 2) {
        return 0;
    }
    
    const xAvg = calculateAverage(xValues);
    const yAvg = calculateAverage(yValues);
    
    const covariance = calculateCovariance(xValues, yValues, xAvg, yAvg);
    const xStdDev = calculateStandardDeviation(xValues, xAvg);
    const yStdDev = calculateStandardDeviation(yValues, yAvg);
    

    if (xStdDev === 0 || yStdDev === 0) {
        return 0;
    }
    
    return covariance / (xStdDev * yStdDev);
}
   


module.exports = {
    calculateAverage,
    calculateCorrelation,
    calculateStandardDeviation,
    calculateCovariance,
}; 