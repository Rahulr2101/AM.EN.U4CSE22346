import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer,
  ReferenceLine,
  Area
} from "recharts";
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Container from '@mui/material/Container';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { useTheme } from '@mui/material/styles';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import TimelineIcon from '@mui/icons-material/Timeline';
import Chip from '@mui/material/Chip';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import Skeleton from '@mui/material/Skeleton';

interface StockData {
  price: number;
  lastUpdatedAt: string;
}

interface StockResponse {
  averageStockPrice: number;
  priceHistory: StockData[];
}

interface ChartData {
  time: string;
  price: number;
  formattedTime: string;
}

const TICKER_OPTIONS = [
  { label: "Apple Inc.", value: "AAPL" },
  { label: "Microsoft Corporation", value: "MSFT" },
  { label: "Alphabet Inc. Class A", value: "GOOGL" },
  { label: "Amazon.com, Inc.", value: "AMZN" },
  { label: "NVIDIA Corporation", value: "NVDA" },
  { label: "Tesla, Inc.", value: "TSLA" },
];

const TIME_OPTIONS = [
  { label: "Last 10 minutes", value: "10" },
  { label: "Last 30 minutes", value: "30" },
  { label: "Last 60 minutes", value: "60" },
  { label: "Last 2 hours", value: "120" },
  { label: "Last 4 hours", value: "240" },
];

// Function to fetch stock data
const fetchStockData = async (ticker: string, minutes: string): Promise<StockResponse> => {
  const response = await fetch(`http://localhost:3000/stocks/${ticker}?minutes=${minutes}&aggregation=average`);
  if (!response.ok) {
    throw new Error("Failed to fetch stock data");
  }
  return response.json();
};

// Custom tooltip for the chart
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <Paper elevation={3} sx={{ p: 2, bgcolor: 'rgba(255, 255, 255, 0.95)' }}>
        <Typography variant="subtitle2" color="text.secondary">
          {payload[0].payload.formattedTime}
        </Typography>
        <Typography variant="body1" fontWeight="bold">
          ${payload[0].value.toFixed(2)}
        </Typography>
      </Paper>
    );
  }
  return null;
};

const StockPage = () => {
  const theme = useTheme();
  const [selectedTicker, setSelectedTicker] = useState<string>("AAPL");
  const [selectedTime, setSelectedTime] = useState<string>("30");
  const [selectedPoint, setSelectedPoint] = useState<ChartData | null>(null);
  const [chartType, setChartType] = useState<string>("line");

  // Fetch stock data using React Query
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["stockData", selectedTicker, selectedTime],
    queryFn: () => fetchStockData(selectedTicker, selectedTime),
    refetchInterval: 60000, // Refetch every minute
  });

  // Transform the data for the chart
  const chartData: ChartData[] = data?.priceHistory.map((item) => {
    const date = new Date(item.lastUpdatedAt);
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");
    const timeLabel = `${hours}:${minutes}`;
    const formattedTime = `${date.toLocaleDateString()} ${hours}:${minutes}:${seconds}`;
    
    return {
      time: timeLabel,
      price: item.price,
      formattedTime,
    };
  }) || [];

  // Calculate price change and percentage
  const calculatePriceChange = () => {
    if (!chartData || chartData.length < 2) return { change: 0, percentage: 0 };
    
    const firstPrice = chartData[0].price;
    const lastPrice = chartData[chartData.length - 1].price;
    const change = lastPrice - firstPrice;
    const percentage = (change / firstPrice) * 100;
    
    return { change, percentage };
  };

  const priceChange = calculatePriceChange();
  const isPositiveChange = priceChange.change >= 0;

  const handleChartTypeChange = (event: React.MouseEvent<HTMLElement>, newChartType: string) => {
    if (newChartType !== null) {
      setChartType(newChartType);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Stock Price Analysis
      </Typography>
      
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ mb: 4 }}>
        <Box sx={{ width: { xs: '100%', md: '25%' } }}>
          <Card elevation={3} sx={{ height: '100%' }}>
            <CardHeader title="Select Stock" />
            <CardContent>
              <FormControl fullWidth>
                <InputLabel id="ticker-select-label">Ticker Symbol</InputLabel>
                <Select
                  labelId="ticker-select-label"
                  id="ticker-select"
                  value={selectedTicker}
                  label="Ticker Symbol"
                  onChange={(e) => setSelectedTicker(e.target.value)}
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
            <CardHeader title="Average Price" />
            <CardContent>
              {isLoading ? (
                <Skeleton variant="text" width="80%" height={60} />
              ) : isError ? (
                <Alert severity="error">Error loading data</Alert>
              ) : (
                <Typography variant="h4" fontWeight="bold" color="primary.main">
                  ${data.averageStockPrice.toFixed(2)}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ width: { xs: '100%', md: '25%' } }}>
          <Card elevation={3} sx={{ height: '100%' }}>
            <CardHeader title="Price Change" />
            <CardContent>
              {isLoading ? (
                <Skeleton variant="text" width="80%" height={60} />
              ) : isError ? (
                <Alert severity="error">Error loading data</Alert>
              ) : (
                <Box>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                    {isPositiveChange ? (
                      <TrendingUpIcon color="success" />
                    ) : (
                      <TrendingDownIcon color="error" />
                    )}
                    <Typography 
                      variant="h5" 
                      fontWeight="bold" 
                      color={isPositiveChange ? "success.main" : "error.main"}
                    >
                      {isPositiveChange ? "+" : ""}{priceChange.change.toFixed(2)}
                    </Typography>
                  </Stack>
                  <Chip 
                    label={`${isPositiveChange ? "+" : ""}${priceChange.percentage.toFixed(2)}%`} 
                    color={isPositiveChange ? "success" : "error"}
                    variant="outlined"
                  />
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      </Stack>

      <Card elevation={3} sx={{ mb: 4 }}>
        <CardHeader 
          title={`Price Chart for ${selectedTicker}`}
          action={
            <ToggleButtonGroup
              value={chartType}
              exclusive
              onChange={handleChartTypeChange}
              aria-label="chart type"
              size="small"
            >
              <ToggleButton value="line" aria-label="line chart">
                <ShowChartIcon />
              </ToggleButton>
              <ToggleButton value="area" aria-label="area chart">
                <TimelineIcon />
              </ToggleButton>
            </ToggleButtonGroup>
          }
        />
        <CardContent>
          {isLoading ? (
            <Box sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CircularProgress />
            </Box>
          ) : isError ? (
            <Box sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Alert severity="error">
                Error: {(error as Error).message}
              </Alert>
            </Box>
          ) : (
            <Box sx={{ height: 400, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
                  onMouseMove={(e) => {
                    if (e.activePayload && e.activePayload.length) {
                      setSelectedPoint(e.activePayload[0].payload);
                    }
                  }}
                  onMouseLeave={() => setSelectedPoint(null)}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                  <XAxis 
                    dataKey="time" 
                    tick={{ fill: theme.palette.text.secondary }}
                    tickLine={{ stroke: theme.palette.divider }}
                  />
                  <YAxis 
                    tick={{ fill: theme.palette.text.secondary }}
                    tickLine={{ stroke: theme.palette.divider }}
                    domain={['dataMin - 5', 'dataMax + 5']}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend />
                  <ReferenceLine
                    y={data.averageStockPrice}
                    label={{
                      value: "Average",
                      fill: theme.palette.text.secondary,
                      fontSize: 12
                    }}
                    stroke={theme.palette.warning.main}
                    strokeDasharray="3 3"
                  />
                  {chartType === 'line' ? (
                    <Line
                      type="monotone"
                      dataKey="price"
                      stroke={theme.palette.primary.main}
                      strokeWidth={2}
                      dot={{ stroke: theme.palette.primary.main, strokeWidth: 2, r: 4 }}
                      activeDot={{ stroke: theme.palette.primary.main, strokeWidth: 2, r: 6 }}
                      name="Price"
                      animationDuration={1000}
                    />
                  ) : (
                    <Area
                      type="monotone"
                      dataKey="price"
                      stroke={theme.palette.primary.main}
                      fill={theme.palette.primary.light}
                      fillOpacity={0.3}
                      name="Price"
                      animationDuration={1000}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </Box>
          )}
        </CardContent>
      </Card>

      <Card elevation={3}>
        <CardHeader title="Price Details" />
        <CardContent>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
            <Box sx={{ width: { xs: '100%', md: '33.33%' } }}>
              <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                Selected Point
              </Typography>
              <Paper elevation={1} sx={{ p: 2, bgcolor: 'action.hover' }}>
                {selectedPoint ? (
                  <>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Time: {selectedPoint.formattedTime}
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      Price: ${selectedPoint.price.toFixed(2)}
                    </Typography>
                  </>
                ) : (
                  <Typography color="text.secondary">
                    Hover over chart to see details
                  </Typography>
                )}
              </Paper>
            </Box>

            <Box sx={{ width: { xs: '100%', md: '33.33%' } }}>
              <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                Price Statistics
              </Typography>
              <Paper elevation={1} sx={{ p: 2, bgcolor: 'action.hover' }}>
                {isLoading ? (
                  <Skeleton variant="text" height={100} />
                ) : isError ? (
                  <Alert severity="error">Error loading data</Alert>
                ) : (
                  <>
                    <Typography variant="body2" gutterBottom>
                      <strong>Highest:</strong> $
                      {Math.max(...chartData.map(item => item.price)).toFixed(2)}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      <strong>Lowest:</strong> $
                      {Math.min(...chartData.map(item => item.price)).toFixed(2)}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Data Points:</strong> {chartData.length}
                    </Typography>
                  </>
                )}
              </Paper>
            </Box>

            <Box sx={{ width: { xs: '100%', md: '33.33%' } }}>
              <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                Current Information
              </Typography>
              <Paper elevation={1} sx={{ p: 2, bgcolor: 'action.hover' }}>
                {isLoading ? (
                  <Skeleton variant="text" height={100} />
                ) : isError ? (
                  <Alert severity="error">Error loading data</Alert>
                ) : (
                  <>
                    <Typography variant="body2" gutterBottom>
                      <strong>Last Price:</strong> $
                      {chartData[chartData.length - 1]?.price.toFixed(2) || "N/A"}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      <strong>Last Updated:</strong> {" "}
                      {chartData[chartData.length - 1]?.formattedTime || "N/A"}
                    </Typography>
                    <Typography variant="body2" color={isPositiveChange ? "success.main" : "error.main"}>
                      <strong>Trend:</strong> {isPositiveChange ? "Upward" : "Downward"}
                    </Typography>
                  </>
                )}
              </Paper>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
};

export default StockPage; 