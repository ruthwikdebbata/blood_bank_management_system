// src/client/pages/Login.jsx
import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../utils/auth';
import { AuthContext } from '../contexts/AuthContext';
import {
  Container,
  TextField,
  Button,
  Box,
  Alert,
  Typography
} from '@mui/material';

export default function Login() {
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);
  const [form, setForm]   = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      const user = await login(form.email, form.password);
      setUser(user);

      // Redirect based on role
      switch (user.role) {
        case 'Admin':
          navigate('/admin_dashboard');
          break;
        case 'User':
          navigate('/user_dashboard');
          break;
        case 'Staff':
          navigate('/staff_dashboard');
          break;
        default:
          navigate('/');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ py: 6 }}>
      <Typography variant="h5" align="center" gutterBottom>
        Login
      </Typography>

      {error && (
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}
      >
        <TextField
          label="Email"
          name="email"
          type="email"
          required
          value={form.email}
          onChange={handleChange}
        />

        <TextField
          label="Password"
          name="password"
          type="password"
          required
          value={form.password}
          onChange={handleChange}
        />

        <Button type="submit" variant="contained" size="large">
          Sign In
        </Button>
      </Box>

      <Typography variant="body2" align="center" sx={{ mt: 1 }}>
        Don’t have an account? <Link to="/register">Register</Link>
      </Typography>
    </Container>
  );
}
