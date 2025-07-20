import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  IconButton,
  InputAdornment,
  Alert
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { motion } from 'framer-motion';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [status, setStatus] = useState({ type: '', msg: '' });

  const handleChange = e =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleTogglePwd = () => setShowPwd(show => !show);

  const handleSubmit = async e => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setStatus({ type: 'error', msg: 'Passwords do not match.' });
      return;
    }
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password })
      });
      if (!res.ok) throw new Error('Registration failed');
      setStatus({ type: 'success', msg: 'Registered successfully!' });
      setForm({ name: '', email: '', password: '', confirm: '' });
      // TODO: redirect to login or dashboard
    } catch (err) {
      setStatus({ type: 'error', msg: err.message });
    }
  };

  return (
    <Container maxWidth="xs" sx={{ py: 6 }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h5" component="h1" gutterBottom align="center">
            Register
          </Typography>

          {status.msg && (
            <Alert severity={status.type} onClose={() => setStatus({ type: '', msg: '' })} sx={{ mb: 2 }}>
              {status.msg}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Full Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
            <TextField
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
            />
            <TextField
              label="Password"
              name="password"
              type={showPwd ? 'text' : 'password'}
              value={form.password}
              onChange={handleChange}
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleTogglePwd} edge="end">
                      {showPwd ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <TextField
              label="Confirm Password"
              name="confirm"
              type={showPwd ? 'text' : 'password'}
              value={form.confirm}
              onChange={handleChange}
              required
            />
            <Button type="submit" variant="contained" size="large">
              Create Account
            </Button>
          </Box>
        </Paper>
      </motion.div>
    </Container>
);
}
