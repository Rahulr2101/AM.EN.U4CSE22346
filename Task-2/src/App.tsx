import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { Home, LineChart, Network } from "lucide-react";
import Index from "./pages/Index";
import StockPage from "./pages/StockPage";
import CorrelationPage from "./pages/CorrelationPage";
import NotFound from "./pages/NotFound";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import CssBaseline from '@mui/material/CssBaseline';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import HomeIcon from '@mui/icons-material/Home';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import HubIcon from '@mui/icons-material/Hub';

const queryClient = new QueryClient();

const theme = createTheme({
  palette: {
    primary: {
      main: '#1e293b', // equivalent to slate-800
    },
    secondary: {
      main: '#3b82f6', // equivalent to blue-500
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          {/* Navigation */}
          <AppBar position="static">
            <Toolbar>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                Stock Price Aggregation
              </Typography>
              <Stack direction="row" spacing={2}>
                <Button 
                  color="inherit" 
                  component={Link} 
                  to="/" 
                  startIcon={<HomeIcon />}
                >
                  Home
                </Button>
                <Button 
                  color="inherit" 
                  component={Link} 
                  to="/stock" 
                  startIcon={<ShowChartIcon />}
                >
                  Stock Chart
                </Button>
                <Button 
                  color="inherit" 
                  component={Link} 
                  to="/correlation" 
                  startIcon={<HubIcon />}
                >
                  Correlation
                </Button>
              </Stack>
            </Toolbar>
          </AppBar>

          {/* Main Content */}
          <Box sx={{ flexGrow: 1 }}>
            <Container>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/stock" element={<StockPage />} />
                <Route path="/correlation" element={<CorrelationPage />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Container>
          </Box>

          {/* Footer */}
          <Box component="footer" sx={{ backgroundColor: 'primary.main', color: 'white', p: 2, textAlign: 'center' }}>
            <Container>
              <Typography variant="body2">
                Stock Price Aggregation Application
              </Typography>
            </Container>
          </Box>
        </Box>
      </BrowserRouter>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
