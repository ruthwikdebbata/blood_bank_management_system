// src/client/pages/Profile.jsx
import React, { useState, useEffect, useContext } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  MenuItem,
  CircularProgress
} from '@mui/material';
import { motion } from 'framer-motion';
import { AuthContext } from '../contexts/AuthContext';

export default function Profile() {
  const { user: ctxUser, setUser } = useContext(AuthContext);
  const [form, setForm]         = useState(null);
  const [eligibility, setEligibility] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to load profile');
        const { user, eligibility } = await res.json();
        setForm({
          name:        user.name,
          gender:      user.gender,
          phone:       user.phone,
          address:     user.address,
          blood_group: user.blood_group
        });
        setEligibility(eligibility);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [ctxUser]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error('Update failed');
      setSuccess('Profile updated');
      // also update context for display name, etc.
      setUser(u => ({ ...u, ...form }));
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return (
    <Container sx={{ textAlign:'center', py:6 }}><CircularProgress/></Container>
  );

  return (
    <Container sx={{ py:6, maxWidth:600 }}>
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ duration:0.6 }}>
        <Typography variant="h4" gutterBottom>
          My Profile
        </Typography>
        {error && <Alert severity="error" sx={{ mb:2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb:2 }}>{success}</Alert>}

        <Box component="form" onSubmit={handleSubmit} sx={{ display:'flex', flexDirection:'column', gap:2 }}>
          <TextField
            label="Full Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />

          <TextField
            select
            label="Gender"
            name="gender"
            value={form.gender}
            onChange={handleChange}
            required
          >
            {['Male','Female','Other'].map(g => (
              <MenuItem key={g} value={g}>{g}</MenuItem>
            ))}
          </TextField>

          <TextField
            label="Phone"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            required
          />

          <TextField
            label="Address"
            name="address"
            multiline
            rows={3}
            value={form.address}
            onChange={handleChange}
            required
          />

          <TextField
            select
            label="Blood Group"
            name="blood_group"
            value={form.blood_group}
            onChange={handleChange}
            required
          >
            {['A+','A–','B+','B–','AB+','AB–','O+','O–'].map(bg => (
              <MenuItem key={bg} value={bg}>{bg}</MenuItem>
            ))}
          </TextField>

          <Button type="submit" variant="contained" size="large">
            Save Changes
          </Button>
        </Box>

        {/* Eligibility */}
        {eligibility && (
          <Box sx={{ mt:6 }}>
            <Typography variant="h5" gutterBottom>
              Eligibility Status
            </Typography>
            <Typography>
              Next eligible donation date: <strong>{eligibility.nextEligibleDate}</strong>
            </Typography>
            <Typography sx={{ mt:1, fontWeight:'bold' }}>Health Tips:</Typography>
            <ul>
              {eligibility.healthTips.map((tip,i) => (
                <li key={i}>{tip}</li>
              ))}
            </ul>
          </Box>
        )}
      </motion.div>
    </Container>
  );
}
