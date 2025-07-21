import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../utils/auth';
import { AuthContext } from '../contexts/AuthContext';
import { Container, TextField, Button, Box, Alert, Typography } from '@mui/material';

export default function Login() {
  const nav = useNavigate();
  const { setUser } = useContext(AuthContext);
  const [form, setForm] = useState({ email:'', password:'' });
  const [error, setError] = useState('');

  const handleChange = e => setForm(f=>({ ...f, [e.target.name]: e.target.value }));
  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const user = await login(form.email, form.password);
      setUser(user);
      nav('/inventory');            
    } catch(err) {
      setError(err.message);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ py:6 }}>
      <Typography variant="h5" align="center">Login</Typography>
      {error && <Alert severity="error">{error}</Alert>}
      <Box component="form" onSubmit={handleSubmit} sx={{ mt:2, display:'flex', flexDirection:'column', gap:2 }}>
        <TextField label="Email" name="email" required onChange={handleChange} />
        <TextField label="Password" name="password" type="password" required onChange={handleChange} />
        <Button type="submit" variant="contained">Sign In</Button>
      </Box>
      <Typography variant="body2" sx={{ mt:1 }}>
        Don’t have an account? <Link to="/register">Register</Link>
      </Typography>
    </Container>
  );
}
