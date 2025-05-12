const calculateAverage = (req, res) => {
    try {
        const { numbers } = req.body;
        
        if (!numbers || !Array.isArray(numbers)) {
            return res.status(400).json({ 
                success: false, 
                error: 'Please provide an array of numbers'
            });
        }

        if (numbers.length === 0) {
            return res.status(400).json({ 
                success: false, 
                error: 'Array cannot be empty'
            });
        }

        // Check if all elements are numbers
        const allNumbers = numbers.every(num => typeof num === 'number' && !isNaN(num));
        if (!allNumbers) {
            return res.status(400).json({ 
                success: false, 
                error: 'All elements must be numbers'
            });
        }

        // Calculate average
        const sum = numbers.reduce((acc, curr) => acc + curr, 0);
        const average = sum / numbers.length;

        // Send response
        res.json({
            success: true,
            input: numbers,
            average: average
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Server error'
        });
    }
};

module.exports = {
    calculateAverage
}; 