// Update this page (the content is just a fallback if you fail to update the page)

import { Link } from "react-router-dom";
import ShowChartIcon from '@mui/icons-material/ShowChart';
import HubIcon from '@mui/icons-material/Hub';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import CircleIcon from '@mui/icons-material/Circle';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import Divider from '@mui/material/Divider';

const Index = () => {
  const theme = useTheme();

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
          Stock Price Aggregation
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: '800px', mx: 'auto' }}>
          A powerful application for analyzing stock prices and correlations in real-time.
          Visualize price trends and discover relationships between different stocks.
        </Typography>
      </Box>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} sx={{ mb: 6 }}>
        <Box sx={{ width: { xs: '100%', md: '50%' } }}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardHeader
              title={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ShowChartIcon color="primary" />
                  <Typography variant="h6">Stock Price Analysis</Typography>
                </Box>
              }
              subheader="View and analyze stock price data with interactive charts"
            />
            <CardContent sx={{ flexGrow: 1 }}>
              <List dense>
                {[
                  'Real-time stock price data',
                  'Interactive price charts',
                  'Average price calculation',
                  'Customizable time intervals',
                  'Detailed price information on hover'
                ].map((item, index) => (
                  <ListItem key={index}>
                    <ListItemIcon sx={{ minWidth: '30px' }}>
                      <CircleIcon sx={{ fontSize: '8px' }} />
                    </ListItemIcon>
                    <ListItemText primary={item} />
                  </ListItem>
                ))}
              </List>
            </CardContent>
            <Divider />
            <CardActions>
              <Button 
                component={Link} 
                to="/stock" 
                variant="contained" 
                fullWidth
              >
                Go to Stock Chart
              </Button>
            </CardActions>
          </Card>
        </Box>

        <Box sx={{ width: { xs: '100%', md: '50%' } }}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardHeader
              title={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <HubIcon sx={{ color: theme.palette.secondary.main }} />
                  <Typography variant="h6">Correlation Heatmap</Typography>
                </Box>
              }
              subheader="Discover relationships between different stocks"
            />
            <CardContent sx={{ flexGrow: 1 }}>
              <List dense>
                {[
                  'Visual correlation heatmap',
                  'Pearson correlation coefficient calculation',
                  'Detailed statistical analysis',
                  'Standard deviation metrics',
                  'Interactive selection of stock pairs'
                ].map((item, index) => (
                  <ListItem key={index}>
                    <ListItemIcon sx={{ minWidth: '30px' }}>
                      <CircleIcon sx={{ fontSize: '8px' }} />
                    </ListItemIcon>
                    <ListItemText primary={item} />
                  </ListItem>
                ))}
              </List>
            </CardContent>
            <Divider />
            <CardActions>
              <Button 
                component={Link} 
                to="/correlation" 
                variant="contained" 
                color="secondary" 
                fullWidth
              >
                Go to Correlation Heatmap
              </Button>
            </CardActions>
          </Card>
        </Box>
      </Stack>

      <Paper elevation={1} sx={{ p: 3, bgcolor: 'grey.50' }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          How It Works
        </Typography>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
          {[
            {
              title: '1. Data Collection',
              content: 'The application fetches real-time stock price data from our backend API, which connects to stock exchange services.'
            },
            {
              title: '2. Data Processing',
              content: 'The raw price data is processed to calculate averages, standard deviations, and correlations between stocks.'
            },
            {
              title: '3. Visualization',
              content: 'The processed data is presented in interactive charts and heatmaps for easy analysis and decision making.'
            }
          ].map((step, index) => (
            <Box key={index} sx={{ width: { xs: '100%', md: '33.33%' } }}>
              <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  {step.title}
                </Typography>
                <Typography variant="body2">
                  {step.content}
                </Typography>
              </Paper>
            </Box>
          ))}
        </Stack>
      </Paper>
    </Container>
  );
};

export default Index;
