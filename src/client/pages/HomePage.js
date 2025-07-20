// src/client/pages/HomePage.jsx
import React from 'react';
import { Box, Container, Typography, Button, Grid, Card, CardHeader, CardContent, Avatar } from '@mui/material';
import { motion } from 'framer-motion';

export default function HomePage() {
  return (
    <Box>
      {/* Hero */}
      <Box
        component="section"
        sx={{
          position: 'relative',
          backgroundImage: `url('./images/hero-bg.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          height: '100vh',
          color: '#fff'
        }}
      >
        <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.6)' }} />
        <Container
          sx={{
            position: 'relative', zIndex: 1,
            height: '100%', display: 'flex',
            flexDirection: 'column', justifyContent: 'center',
            alignItems: 'center', textAlign: 'center', py: 4
          }}
        >
          <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8 }}>
            <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
              Empowering Lives Through Donation
            </Typography>
          </motion.div>
          <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 1 }}>
            <Typography variant="h6" component="p" gutterBottom sx={{ maxWidth: 600, mb: 4 }}>
              Seamless blood bank management for donors, hospitals, and communities.
            </Typography>
          </motion.div>
          <Box>
            <Button variant="contained" size="large" sx={{ mr: 2 }}>Become a Donor</Button>
            <Button variant="outlined" size="large" sx={{ borderColor: '#fff', color: '#fff' }}>Request Blood</Button>
          </Box>
        </Container>
      </Box>

      {/* Features */}
      <Container component="section" sx={{ py: 8 }}>
        <Typography variant="h4" component="h2" align="center" gutterBottom>
          Key Features
        </Typography>
        <Grid container spacing={4} sx={{ mt: 2 }}>
          {[
            { title: 'Real-Time Inventory', desc: 'Live stock levels & expiry alerts.' },
            { title: 'Donor Management',   desc: 'Registration, history & eligibility.' },
            { title: 'Emergency Alerts',   desc: 'Instant SMS/email to nearby donors.' },
          ].map((f, i) => (
            <Grid item xs={12} md={4} key={i}>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.2 }}>
                <Card elevation={3}>
                  <CardHeader avatar={<Avatar>{f.title.charAt(0)}</Avatar>} title={f.title} />
                  <CardContent>
                    <Typography>{f.desc}</Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Testimonials */}
      <Container component="section" sx={{ py: 8 }}>
        <Typography variant="h4" component="h2" align="center" gutterBottom>
          What Donors Say
        </Typography>
        <Grid container spacing={4} sx={{ mt: 2 }}>
          {[
            { quote: 'A life-changing experience!', name: 'Jane Doe' },
            { quote: 'Easy and trustworthy platform.', name: 'John Smith' },
          ].map((t, i) => (
            <Grid item xs={12} md={6} key={i}>
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2 + i * 0.2 }}>
                <Card elevation={3} sx={{ p: 3, fontStyle: 'italic', textAlign: 'center' }}>
                  <Typography variant="body1">“{t.quote}”</Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 2 }}>
                    — {t.name}
                  </Typography>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA Footer */}
      <Box component="section" sx={{ bgcolor: '#b71c1c', color: '#fff', py: 8 }}>
        <Container sx={{ textAlign: 'center' }}>
          <Typography variant="h4" component="h2" gutterBottom>
            Join Our Community
          </Typography>
          <Typography variant="subtitle1" gutterBottom>
            Make a difference today by donating blood or requesting support.
          </Typography>
          <Button variant="contained" size="large" sx={{ mt: 2, bgcolor: '#fff', color: '#b71c1c' }}>
            Get Started
          </Button>
        </Container>
      </Box>
    </Box>
  );
}
