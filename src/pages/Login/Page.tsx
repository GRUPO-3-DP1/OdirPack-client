import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Avatar,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const navigate = useNavigate();

  const handleLogin = () => {
    // Simulación de autenticación
    if (username === 'admin' && password === '1234') {
      localStorage.setItem('isAuthenticated', 'true');
      navigate('/', { replace: true });
    } else {
      setError(true);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f4f6f8',
      }}
    >
      <Card sx={{ maxWidth: 400, width: '100%', boxShadow: 3, borderRadius: 2 }}>
        <CardContent>
          {/* Icono de Login */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              mb: 2,
            }}
          >
            <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
              <LockOutlinedIcon fontSize="large" />
            </Avatar>
          </Box>

          {/* Título */}
          <Typography
            variant="h5"
            component="h1"
            textAlign="center"
            gutterBottom
            fontWeight="bold"
          >
            Iniciar Sesión
          </Typography>

          {/* Campos de Texto */}
          <TextField
            label="Usuario"
            variant="outlined"
            fullWidth
            margin="normal"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            error={error}
          />
          <TextField
            label="Contraseña"
            type="password"
            variant="outlined"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={error}
            helperText={error ? 'Credenciales incorrectas' : ''}
          />

          {/* Botón */}
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              onClick={handleLogin}
              sx={{ textTransform: 'none' }}
            >
              Entrar
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;
