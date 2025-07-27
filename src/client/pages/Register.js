// src/client/pages/Register.jsx
import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../utils/auth';
import { AuthContext } from '../contexts/AuthContext';
import {
  Container,
  TextField,
  Button,
  Box,
  Alert,
  Typography,
  MenuItem,
  Select,
  InputLabel,
  FormControl
} from '@mui/material';

export default function Register() {
  const nav = useNavigate();
  const { setUser } = useContext(AuthContext);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirm: '',
    gender: '',
    phone: '',
    address: '',
    role: 'User',
    blood_group: 'O+'
  });
  const [error, setError] = useState('');

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setError('Passwords do not match');
      return;
    }
    try {
      // send entire form object (make sure your backend accepts these fields)
      const user = await register(form);
      setUser(user);
      nav('/'); // redirect home
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ py: 6 }}>
      <Typography variant="h5" align="center" gutterBottom>
        Register
      </Typography>
      {error && <Alert severity="error">{error}</Alert>}

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}
      >
        <TextField
          label="Full Name"
          name="name"
          required
          value={form.name}
          onChange={handleChange}
        />

        <TextField
          label="Email"
          name="email"
          type="email"
          required
          value={form.email}
          onChange={handleChange}
        />

        <FormControl required>
          <InputLabel id="gender-label">Gender</InputLabel>
          <Select
            labelId="gender-label"
            label="Gender"
            name="gender"
            value={form.gender}
            onChange={handleChange}
          >
            <MenuItem value="Male">Male</MenuItem>
            <MenuItem value="Female">Female</MenuItem>
            <MenuItem value="Other">Other</MenuItem>
          </Select>
        </FormControl>

        <TextField
          label="Phone Number"
          name="phone"
          required
          value={form.phone}
          onChange={handleChange}
        />

        <TextField
          label="Address"
          name="address"
          multiline
          rows={3}
          required
          value={form.address}
          onChange={handleChange}
        />

        <FormControl required>
          <InputLabel id="role-label">Role</InputLabel>
          <Select
            labelId="role-label"
            label="Role"
            name="role"
            value={form.role}
            onChange={handleChange}
          >
            <MenuItem value="user">User</MenuItem>
            <MenuItem value="Staff">Staff</MenuItem>
            {/* <MenuItem value="Admin">Admin</MenuItem> */}
          </Select>
        </FormControl>

        <TextField
          label="Password"
          name="password"
          type="password"
          required
          value={form.password}
          onChange={handleChange}
        />

        <TextField
          label="Confirm Password"
          name="confirm"
          type="password"
          required
          value={form.confirm}
          onChange={handleChange}
        />
        <FormControl required>
          <InputLabel id="bg-label">Blood Group</InputLabel>
          <Select
            labelId="bg-label"
            label="Blood Group"
            name="blood_group"
            value={form.blood_group}
            onChange={handleChange}
          >
            {['A+', 'A–', 'B+', 'B–', 'AB+', 'AB–', 'O+', 'O–'].map(bg => (
              <MenuItem key={bg} value={bg}>{bg}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button type="submit" variant="contained" size="large">
          Create Account
        </Button>
      </Box>

      <Typography variant="body2" sx={{ mt: 1 }} align="center">
        Already have an account? <Link to="/login">Login</Link>
      </Typography>
    </Container>
  );
}
