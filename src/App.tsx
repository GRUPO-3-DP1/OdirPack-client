import React from 'react';
import './App.css';
import { createTheme, CssBaseline, ThemeProvider } from '@mui/material';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import routes from './routes/routes';
import Dashboard from './components/Dashboard/Dashboard';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { ArchivosProvider } from './context/Archivos/ArchivosContext';

const customTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: "#00A76F",
      light: "#58E49B",
      dark: "#007867",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#8E33FF",
      light: "#C684FF",
      dark: "#5119B7",
      contrastText: "#FFFFFF",
    },
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
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <ArchivosProvider>
        <ThemeProvider theme={customTheme}>
          <CssBaseline />
          <RouterProvider router={router} />
        </ThemeProvider>
      </ArchivosProvider>
    </LocalizationProvider>
  );
};

export default App;