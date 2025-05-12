function calculateAverage(values) {
    if (!values || values.length === 0) return 0;
    const sum = values.reduce((acc, val) => acc + val, 0);
    return sum / values.length;
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
    calculateCorrelation
}; 