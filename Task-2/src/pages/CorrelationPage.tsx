import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Container from '@mui/material/Container';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

interface StockData {
  price: number;
  lastUpdatedAt: string;
}

interface StockInfo {
  averagePrice: number;
  priceHistory: StockData[];
}

interface CorrelationResponse {
  correlation: number;
  stocks: {
    [ticker: string]: StockInfo;
  };
}

const TICKER_OPTIONS = [
  { label: "Apple Inc.", value: "AAPL" },
  { label: "Microsoft Corporation", value: "MSFT" },
  { label: "Alphabet Inc. Class A", value: "GOOGL" },
  { label: "Amazon.com, Inc.", value: "AMZN" },
  { label: "NVIDIA Corporation", value: "NVDA" },
  { label: "Tesla, Inc.", value: "TSLA" },
  { label: "PayPal Holdings, Inc.", value: "PYPL" },
];

const TIME_OPTIONS = [
  { label: "Last 10 minutes", value: "10" },
  { label: "Last 30 minutes", value: "30" },
  { label: "Last 60 minutes", value: "60" },
  { label: "Last 2 hours", value: "120" },
  { label: "Last 4 hours", value: "240" },
];

// Function to calculate standard deviation - used for tooltip info
const calculateStandardDeviation = (values: number[]): number => {
  if (!values || values.length < 2) return 0;
  
  const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
  const squareDiffs = values.map(value => {
    const diff = value - avg;
    return diff * diff;
  });
  
  const avgSquareDiff = squareDiffs.reduce((sum, val) => sum + val, 0) / squareDiffs.length;
  return Math.sqrt(avgSquareDiff);
};

// Function to fetch correlation data
const fetchCorrelationData = async (ticker1: string, ticker2: string, minutes: string): Promise<CorrelationResponse> => {
  const response = await fetch(`http://localhost:3000/stockcorrelation?minutes=${minutes}&ticker=${ticker1}&ticker=${ticker2}`);
  if (!response.ok) {
    throw new Error("Failed to fetch correlation data");
  }
  return response.json();
};

// Custom styled cell for the heatmap
interface HeatmapCellProps {
  correlation: number | null;
}

const StyledTableCell = styled(TableCell, {
  shouldForwardProp: (prop) => prop !== 'correlation',
})<HeatmapCellProps>(({ theme, correlation }) => {
  // Get color based on correlation value
  const getColor = () => {
    if (correlation === null || correlation === undefined) return '#e5e7eb'; // Gray for null
    
    if (correlation > 0.8) return '#059669'; // Strong positive
    if (correlation > 0.5) return '#10b981'; // Moderate positive
    if (correlation > 0.2) return '#a7f3d0'; // Weak positive
    if (correlation > -0.2) return '#e5e7eb'; // No correlation
    if (correlation > -0.5) return '#fecaca'; // Weak negative
    if (correlation > -0.8) return '#ef4444'; // Moderate negative
    return '#b91c1c'; // Strong negative
  };
  
  return {
    backgroundColor: getColor(),
    color: correlation > 0.5 || correlation < -0.5 ? 'white' : 'black',
    fontWeight: 'bold',
    textAlign: 'center',
    width: '80px',
    height: '80px',
    transition: 'all 0.3s ease',
    '&:hover': {
      opacity: 0.8,
      transform: 'scale(1.05)',
    },
  };
});

const CorrelationPage = () => {
  const [selectedTicker1, setSelectedTicker1] = useState<string>("AAPL");
  const [selectedTicker2, setSelectedTicker2] = useState<string>("MSFT");
  const [selectedTime, setSelectedTime] = useState<string>("30");
  const [allCorrelations, setAllCorrelations] = useState<{[key: string]: {[key: string]: number | null}}>({});

  // Fetch correlation data using React Query
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["correlationData", selectedTicker1, selectedTicker2, selectedTime],
    queryFn: () => fetchCorrelationData(selectedTicker1, selectedTicker2, selectedTime),
    refetchInterval: 60000, // Refetch every minute
    enabled: selectedTicker1 !== selectedTicker2, // Only run if different tickers are selected
  });

  // Update correlation matrix when data changes
  useEffect(() => {
    if (data && selectedTicker1 !== selectedTicker2) {
      setAllCorrelations(prev => ({
        ...prev,
        [selectedTicker1]: {
          ...prev[selectedTicker1],
          [selectedTicker2]: data.correlation
        },
        [selectedTicker2]: {
          ...prev[selectedTicker2],
          [selectedTicker1]: data.correlation
        }
      }));
    }
  }, [data, selectedTicker1, selectedTicker2]);

  // Calculate standard deviations for both stocks
  const getStandardDeviation = (ticker: string): number => {
    if (!data || !data.stocks[ticker]) return 0;
    
    const prices = data.stocks[ticker].priceHistory.map(item => item.price);
    return calculateStandardDeviation(prices);
  };

  // Initialize the correlation matrix with all tickers
  const initializeCorrelationMatrix = () => {
    const tickers = TICKER_OPTIONS.map(option => option.value);
    let matrix: {[key: string]: {[key: string]: number | null}} = {};
    
    tickers.forEach(ticker1 => {
      matrix[ticker1] = {};
      tickers.forEach(ticker2 => {
        if (ticker1 === ticker2) {
          matrix[ticker1][ticker2] = 1.0; // Perfect correlation with self
        } else {
          matrix[ticker1][ticker2] = allCorrelations[ticker1]?.[ticker2] || null;
        }
      });
    });
    
    return matrix;
  };

  const correlationMatrix = initializeCorrelationMatrix();

  // Get text description for correlation value
  const getCorrelationDescription = (correlation: number): string => {
    if (correlation > 0.8) return "Strong positive correlation";
    if (correlation > 0.5) return "Moderate positive correlation";
    if (correlation > 0.2) return "Weak positive correlation";
    if (correlation > -0.2) return "No significant correlation";
    if (correlation > -0.5) return "Weak negative correlation";
    if (correlation > -0.8) return "Moderate negative correlation";
    return "Strong negative correlation";
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Stock Correlation Analysis
      </Typography>
      
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ mb: 4 }}>
        <Box sx={{ width: { xs: '100%', md: '25%' } }}>
          <Card elevation={3} sx={{ height: '100%' }}>
            <CardHeader title="First Stock" />
            <CardContent>
              <FormControl fullWidth>
                <InputLabel id="ticker1-select-label">First Ticker</InputLabel>
                <Select
                  labelId="ticker1-select-label"
                  id="ticker1-select"
                  value={selectedTicker1}
                  label="First Ticker"
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === selectedTicker2) {
                      // Swap tickers if same is selected
                      setSelectedTicker1(selectedTicker2);
                      setSelectedTicker2(value);
                    } else {
                      setSelectedTicker1(value);
                    }
                  }}
                >
                  {TICKER_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label} ({option.value})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ width: { xs: '100%', md: '25%' } }}>
          <Card elevation={3} sx={{ height: '100%' }}>
            <CardHeader title="Second Stock" />
            <CardContent>
              <FormControl fullWidth>
                <InputLabel id="ticker2-select-label">Second Ticker</InputLabel>
                <Select
                  labelId="ticker2-select-label"
                  id="ticker2-select"
                  value={selectedTicker2}
                  label="Second Ticker"
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === selectedTicker1) {
                      // Swap tickers if same is selected
                      setSelectedTicker2(selectedTicker1);
                      setSelectedTicker1(value);
                    } else {
                      setSelectedTicker2(value);
                    }
                  }}
                >
                  {TICKER_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label} ({option.value})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ width: { xs: '100%', md: '25%' } }}>
          <Card elevation={3} sx={{ height: '100%' }}>
            <CardHeader title="Time Range" />
            <CardContent>
              <FormControl fullWidth>
                <InputLabel id="time-select-label">Time Period</InputLabel>
                <Select
                  labelId="time-select-label"
                  id="time-select"
                  value={selectedTime}
                  label="Time Period"
                  onChange={(e) => setSelectedTime(e.target.value)}
                >
                  {TIME_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ width: { xs: '100%', md: '25%' } }}>
          <Card elevation={3} sx={{ height: '100%' }}>
            <CardHeader title="Correlation Value" />
            <CardContent>
              <Typography variant="h4" fontWeight="bold" color={
                selectedTicker1 === selectedTicker2 ? "success.main" :
                isLoading ? "text.secondary" :
                isError ? "error.main" :
                data && data.correlation > 0 ? "success.main" : "error.main"
              }>
                {selectedTicker1 === selectedTicker2 ? (
                  "1.0000"
                ) : isLoading ? (
                  <CircularProgress size={24} />
                ) : isError ? (
                  "Error"
                ) : (
                  data.correlation.toFixed(4)
                )}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Stack>

      {selectedTicker1 !== selectedTicker2 && data && (
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ mb: 4 }}>
          <Box sx={{ width: { xs: '100%', md: '33.33%' } }}>
            <Card elevation={3}>
              <CardHeader title={`${selectedTicker1} Stats`} />
              <CardContent>
                <Typography variant="body1" paragraph>
                  <strong>Average Price:</strong> ${data.stocks[selectedTicker1].averagePrice.toFixed(2)}
                </Typography>
                <Typography variant="body1" paragraph>
                  <strong>Standard Deviation:</strong> ${getStandardDeviation(selectedTicker1).toFixed(2)}
                </Typography>
                <Typography variant="body1">
                  <strong>Data Points:</strong> {data.stocks[selectedTicker1].priceHistory.length}
                </Typography>
              </CardContent>
            </Card>
          </Box>

          <Box sx={{ width: { xs: '100%', md: '33.33%' } }}>
            <Card elevation={3}>
              <CardHeader title={`${selectedTicker2} Stats`} />
              <CardContent>
                <Typography variant="body1" paragraph>
                  <strong>Average Price:</strong> ${data.stocks[selectedTicker2].averagePrice.toFixed(2)}
                </Typography>
                <Typography variant="body1" paragraph>
                  <strong>Standard Deviation:</strong> ${getStandardDeviation(selectedTicker2).toFixed(2)}
                </Typography>
                <Typography variant="body1">
                  <strong>Data Points:</strong> {data.stocks[selectedTicker2].priceHistory.length}
                </Typography>
              </CardContent>
            </Card>
          </Box>

          <Box sx={{ width: { xs: '100%', md: '33.33%' } }}>
            <Card elevation={3}>
              <CardHeader title="Correlation Interpretation" />
              <CardContent>
                <Typography variant="body1">
                  {getCorrelationDescription(data.correlation)}: {
                    data.correlation > 0.8 ? (
                      "The stocks tend to move strongly together in the same direction."
                    ) : data.correlation > 0.5 ? (
                      "The stocks tend to move moderately together in the same direction."
                    ) : data.correlation > 0.2 ? (
                      "The stocks have a weak tendency to move in the same direction."
                    ) : data.correlation > -0.2 ? (
                      "The stocks don't show a significant relationship in their price movements."
                    ) : data.correlation > -0.5 ? (
                      "The stocks have a weak tendency to move in opposite directions."
                    ) : data.correlation > -0.8 ? (
                      "The stocks tend to move moderately in opposite directions."
                    ) : (
                      "The stocks tend to move strongly in opposite directions."
                    )
                  }
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Stack>
      )}

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Correlation Heatmap
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          This heatmap shows the correlation between pairs of stocks. Green indicates positive correlation, red indicates negative correlation.
          Click on any cell to select that pair for detailed analysis.
        </Typography>

        <Box sx={{ overflowX: 'auto' }}>
          <TableContainer component={Paper} elevation={0} sx={{ maxWidth: '100%', mb: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Ticker</TableCell>
                  {TICKER_OPTIONS.map(option => (
                    <TableCell key={option.value} sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                      {option.value}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {TICKER_OPTIONS.map(row => (
                  <TableRow key={row.value}>
                    <TableCell sx={{ fontWeight: 'bold' }}>{row.value}</TableCell>
                    {TICKER_OPTIONS.map(col => {
                      const correlation = correlationMatrix[row.value][col.value];
                      return (
                        <Tooltip
                          key={`${row.value}-${col.value}`}
                          title={
                            row.value === col.value ? 
                            "Perfect correlation (same stock)" : 
                            correlation === null ? 
                            "No data available yet. Click to analyze." :
                            `${getCorrelationDescription(correlation)}: ${correlation.toFixed(4)}`
                          }
                          arrow
                        >
                          <StyledTableCell 
                            correlation={correlation}
                            onClick={() => {
                              if (row.value !== col.value) {
                                setSelectedTicker1(row.value);
                                setSelectedTicker2(col.value);
                              }
                            }}
                            sx={{ cursor: 'pointer' }}
                          >
                            {correlation !== null ? correlation.toFixed(2) : 'N/A'}
                          </StyledTableCell>
                        </Tooltip>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Typography variant="body2" color="text.secondary">
          Note: The heatmap updates as you select different stock pairs and time ranges. For a full analysis of all pairs, 
          you need to select each combination individually.
        </Typography>
      </Paper>

      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Understanding Correlation Values
        </Typography>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <Box sx={{ width: { xs: '100%', md: '33.33%' } }}>
            <Paper 
              elevation={1} 
              sx={{ 
                p: 2, 
                bgcolor: '#a7f3d0', 
                borderLeft: '6px solid #059669' 
              }}
            >
              <Typography variant="subtitle1" fontWeight="bold">
                Positive Correlation (0 to 1)
              </Typography>
              <Typography variant="body2">
                Stocks tend to move in the same direction. A correlation of 1 means perfect positive correlation - 
                when one stock goes up, the other goes up proportionally.
              </Typography>
            </Paper>
          </Box>
          <Box sx={{ width: { xs: '100%', md: '33.33%' } }}>
            <Paper 
              elevation={1} 
              sx={{ 
                p: 2, 
                bgcolor: '#e5e7eb', 
                borderLeft: '6px solid #6b7280' 
              }}
            >
              <Typography variant="subtitle1" fontWeight="bold">
                No Correlation (Near 0)
              </Typography>
              <Typography variant="body2">
                Stocks move independently of each other. There is no discernible pattern between the price movements of the stocks.
              </Typography>
            </Paper>
          </Box>
          <Box sx={{ width: { xs: '100%', md: '33.33%' } }}>
            <Paper 
              elevation={1} 
              sx={{ 
                p: 2, 
                bgcolor: '#fecaca', 
                borderLeft: '6px solid #b91c1c' 
              }}
            >
              <Typography variant="subtitle1" fontWeight="bold">
                Negative Correlation (-1 to 0)
              </Typography>
              <Typography variant="body2">
                Stocks tend to move in opposite directions. A correlation of -1 means perfect negative correlation - 
                when one stock goes up, the other goes down proportionally.
              </Typography>
            </Paper>
          </Box>
        </Stack>
      </Paper>
    </Container>
  );
};

export default CorrelationPage; 