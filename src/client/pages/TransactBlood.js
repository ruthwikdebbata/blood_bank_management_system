// src/client/pages/TransactBlood.jsx
import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  MenuItem,
  Button,
  Tab,
  Tabs,
  Snackbar,
  Alert,
  Grid
} from '@mui/material';
import { AuthContext } from '../contexts/AuthContext';

export default function TransactBlood() {
  const token = localStorage.getItem('token');
  const bgList = ['A+','A–','B+','B–','AB+','AB–','O+','O–'];

  const [tab, setTab] = useState(0);
  const [snackbar, setSnackbar] = useState(null);

  const [donate, setDonate] = useState({ date:'', center:'', qty:'' });
  const [request, setRequest] = useState({
    patient:'', blood_group:'O+', qty:'', hospital:''
  });

  const handleTab = (_, v) => setTab(v);
  const closeSnack = () => setSnackbar(null);

  const onDonate = async e => {
    e.preventDefault();
    setSnackbar(null);
    const { date, center, qty } = donate;
    if (!date||!center||!qty) {
      setSnackbar({ type:'error', msg:'All donate fields required' });
      return;
    }
    try {
      const res = await fetch('/api/donations', {
        method:'POST',
        headers:{
          'Content-Type':'application/json',
          Authorization:`Bearer ${token}`
        },
        body: JSON.stringify({
          donated_on: date,
          center,
          quantity_ml: Number(qty),
          status:'available'
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error||'Donation failed');
      setSnackbar({ type:'success', msg:'Donation recorded!' });
      setDonate({ date:'', center:'', qty:'' });
    } catch (err) {
      setSnackbar({ type:'error', msg:err.message });
    }
  };

  const onRequest = async e => {
    e.preventDefault();
    setSnackbar(null);
    const { patient, blood_group, qty, hospital } = request;
    if (!patient||!blood_group||!qty||!hospital) {
      setSnackbar({ type:'error', msg:'All request fields required' });
      return;
    }
    try {
      const res = await fetch('/api/request', {
        method:'POST',
        headers:{
          'Content-Type':'application/json',
          Authorization:`Bearer ${token}`
        },
        body: JSON.stringify({
          patient_name: patient,
          blood_group,
          requested_ml: Number(qty),
          hospital,
          requested_on: new Date().toISOString().slice(0,10),
          status:'pending'
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error||'Request failed');
      setSnackbar({ type:'success', msg:'Request submitted!' });
      setRequest({ patient:'', blood_group:'O+', qty:'', hospital:'' });
    } catch (err) {
      setSnackbar({ type:'error', msg:err.message });
    }
  };

  return (
    <Container sx={{ py:6 }}>
      <Typography variant="h4" gutterBottom>
        Donate or Request Blood
      </Typography>

      <Tabs value={tab} onChange={handleTab} sx={{ mb:4 }}>
        <Tab label="Donate" />
        <Tab label="Request" />
      </Tabs>

      {tab === 0 && (
        <Box component="form" onSubmit={onDonate} sx={{ maxWidth:600 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Date of Donation"
                name="date"
                type="date"
                InputLabelProps={{ shrink:true }}
                fullWidth
                value={donate.date}
                onChange={e=>setDonate(d=>({...d, date:e.target.value}))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Center"
                name="center"
                fullWidth
                value={donate.center}
                onChange={e=>setDonate(d=>({...d, center:e.target.value}))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Quantity (ml)"
                name="qty"
                type="number"
                fullWidth
                inputProps={{ min:1 }}
                value={donate.qty}
                onChange={e=>setDonate(d=>({...d, qty:e.target.value}))}
              />
            </Grid>
            <Grid item xs={12}>
              <Button type="submit" variant="contained" fullWidth>
                Submit Donation
              </Button>
            </Grid>
          </Grid>
        </Box>
      )}

      {tab === 1 && (
        <Box component="form" onSubmit={onRequest} sx={{ maxWidth:600 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Patient Name"
                name="patient"
                fullWidth
                value={request.patient}
                onChange={e=>setRequest(r=>({...r, patient:e.target.value}))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                select
                label="Blood Group"
                name="blood_group"
                fullWidth
                value={request.blood_group}
                onChange={e=>setRequest(r=>({...r, blood_group:e.target.value}))}
              >
                {bgList.map(bg=>(
                  <MenuItem key={bg} value={bg}>{bg}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Quantity Needed (ml)"
                name="qty"
                type="number"
                fullWidth
                inputProps={{ min:1 }}
                value={request.qty}
                onChange={e=>setRequest(r=>({...r, qty:e.target.value}))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Hospital"
                name="hospital"
                fullWidth
                value={request.hospital}
                onChange={e=>setRequest(r=>({...r, hospital:e.target.value}))}
              />
            </Grid>
            <Grid item xs={12}>
              <Button type="submit" variant="contained" fullWidth>
                Submit Request
              </Button>
            </Grid>
          </Grid>
        </Box>
      )}

      <Snackbar
        open={!!snackbar}
        autoHideDuration={4000}
        onClose={closeSnack}
      >
        {snackbar && (
          <Alert
            onClose={closeSnack}
            severity={snackbar.type}
            sx={{ width:'100%' }}
          >
            {snackbar.msg}
          </Alert>
        )}
      </Snackbar>
    </Container>
  );
}
