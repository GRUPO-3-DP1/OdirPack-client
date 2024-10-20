import React from 'react';
import './App.css';
import { createTheme, CssBaseline, ThemeProvider } from '@mui/material';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import routes from './routes/routes';
import Dashboard from './components/Dashboard/Dashboard';

const lightTheme = createTheme({
  palette: {
    mode: 'light',
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
    <ThemeProvider theme={lightTheme}>
      <CssBaseline />
      <RouterProvider router={router} />
    </ThemeProvider>
  );
};

export default App;