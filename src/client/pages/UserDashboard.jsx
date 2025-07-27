// src/client/pages/UserDashboard.jsx
import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
  Alert
} from '@mui/material';
import { motion } from 'framer-motion';
import { AuthContext } from '../contexts/AuthContext';

export default function UserDashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [appointment, setAppointment] = useState(null);
  const [reminders, setReminders]   = useState([]);
  const [activity, setActivity]     = useState([]);
  const [eligible, setEligible]     = useState(false);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        // Parallel fetches
        const [appRes, remRes, actRes, eligRes] = await Promise.all([
          fetch('/api/appointments/upcoming', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/reminders',            { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/activity',             { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/eligibility',          { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        if (!appRes.ok || !remRes.ok || !actRes.ok || !eligRes.ok) {
          throw new Error('Failed to load dashboard data');
        }

        const { appointment: appt } = await appRes.json();
        const { reminders: rems }   = await remRes.json();
        const { activity: acts }    = await actRes.json();
        const { eligible: elig }    = await eligRes.json();

        setAppointment(appt);
        setReminders(rems);
        setActivity(acts);
        setEligible(elig);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <Container sx={{ textAlign: 'center', py: 6 }}>
        <CircularProgress />
      </Container>
    );
  }
  if (error) {
    return (
      <Container sx={{ py: 6 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 6 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Typography variant="h4" gutterBottom>
          Welcome back, {user.name}!
        </Typography>

        {/* Upcoming Appointment */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6">Upcoming Appointment</Typography>
            {appointment ? (
              <>
                <Typography>
                  📅 {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                </Typography>
                <Typography>Location: {appointment.location}</Typography>
              </>
            ) : (
              <Typography>No upcoming appointments.</Typography>
            )}
          </CardContent>
        </Card>

        {/* Outstanding Reminders */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6">Outstanding Reminders</Typography>
            {reminders.length ? (
              <List dense>
                {reminders.map(r => (
                  <ListItem key={r.id}>
                    <ListItemText primary={r.message} secondary={new Date(r.date).toLocaleDateString()} />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography>No reminders right now.</Typography>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6">Recent Activity</Typography>
            {activity.length ? (
              <List dense>
                {activity.map(a => (
                  <ListItem key={a.id}>
                    <ListItemText
                      primary={a.description}
                      secondary={new Date(a.date).toLocaleDateString()}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography>No recent activity.</Typography>
            )}
          </CardContent>
        </Card>

        {/* Donate Again CTA */}
        <Card>
          <CardContent>
            <Typography variant="h6">Ready to Donate?</Typography>
            <Typography>
              {eligible
                ? 'You’re eligible to donate again!'
                : 'You’re not yet eligible to donate again.'}
            </Typography>
          </CardContent>
          <Divider />
          <CardActions>
            <Button
              variant="contained"
              size="large"
              disabled={!eligible}
              onClick={() => navigate('/donate')}
            >
              Donate Again
            </Button>
          </CardActions>
        </Card>
      </motion.div>
    </Container>
  );
}
