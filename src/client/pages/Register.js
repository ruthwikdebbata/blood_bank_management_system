// src/client/pages/Register.jsx
import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../utils/auth';
import { AuthContext } from '../contexts/AuthContext';
import { Container, TextField, Button, Box, Alert, Typography } from '@mui/material';

export default function Register() {
  const nav = useNavigate();
  const { setUser } = useContext(AuthContext);
  const [form, setForm] = useState({ name:'', email:'', password:'', confirm:'' });
  const [error, setError] = useState('');

  const handleChange = e => setForm(f=>({ ...f, [e.target.name]: e.target.value }));
  const handleSubmit = async e => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setError('Passwords do not match');
      return;
    }
    try {
      const user = await register(form.name, form.email, form.password);
      setUser(user);
      nav('/');              // redirect home after registration
    } catch(err) {
      setError(err.message);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ py:6 }}>
      <Typography variant="h5" align="center">Register</Typography>
      {error && <Alert severity="error">{error}</Alert>}
      <Box component="form" onSubmit={handleSubmit} sx={{ mt:2, display:'flex', flexDirection:'column', gap:2 }}>
        <TextField label="Full Name" name="name" required onChange={handleChange} />
        <TextField label="Email" name="email" type="email" required onChange={handleChange} />
        <TextField label="Password" name="password" type="password" required onChange={handleChange} />
        <TextField label="Confirm Password" name="confirm" type="password" required onChange={handleChange} />
        <Button type="submit" variant="contained">Create Account</Button>
      </Box>
      <Typography variant="body2" sx={{ mt:1 }}>
        Already have an account? <Link to="/login">Login</Link>
      </Typography>
    </Container>
  );
}
