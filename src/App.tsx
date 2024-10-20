import React from 'react';
import './App.css';
import { createTheme, CssBaseline, ThemeProvider } from '@mui/material';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import routes from './routes/routes';
import Dashboard from './components/Dashboard/Dashboard';

const customTheme = createTheme({
  palette: {
    mode: 'light',
  },
  typography: {
    fontFamily: [
      "Public Sans"
    ].join(',')
  },
});

const router = createBrowserRouter([
  {
    path: '/',
    element: <Dashboard />,
    children: routes.map(({ path, element }) => ({ path, element })),
  }
]);

const App: React.FC = () => {
  return (
    <ThemeProvider theme={customTheme}>
      <CssBaseline />
      <RouterProvider router={router} />
    </ThemeProvider>
  );
};

export default App;