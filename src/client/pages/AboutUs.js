import React from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardHeader,
  CardContent,
  CardMedia,
  Button
} from '@mui/material';
import { motion } from 'framer-motion';

const team = [
  { name: 'Dr. Alice Carter', role: 'Chief Medical Officer', img: '/images/team/alice.jpg' },
  { name: 'Mr. Bob Nguyen',   role: 'Head of Operations',  img: '/images/team/bob.jpg'   },
  { name: 'Ms. Cara Singh',    role: 'Lead Developer',      img: '/images/team/cara.jpg'  },
];

const history = [
  { year: '2010', desc: 'Founded by a group of healthcare professionals.' },
  { year: '2015', desc: 'Launched our first donor management platform.' },
  { year: '2020', desc: 'Scaled to serve 100+ hospitals nationwide.' },
];

export default function AboutUs() {
  return (
    <Container sx={{ py: 8 }}>
      {/* Header */}
      <Box textAlign="center" mb={6}>
        <Typography variant="h3" component="h1" gutterBottom>
          About Blood Bank Management System
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Bridging the gap between donors and patients through innovation and care.
        </Typography>
      </Box>

      {/* Mission & Vision */}
      <Grid container spacing={4} mb={6}>
        {[
          { title: 'Our Mission',   text: 'To save lives by streamlining blood donation and transfusion processes.' },
          { title: 'Our Vision',    text: 'A world where no patient is ever in need of a compatible blood match.' }
        ].map((item, i) => (
          <Grid item xs={12} md={6} key={item.title}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
            >
              <Paper elevation={3} sx={{ p: 4, height: '100%' }}>
                <Typography variant="h5" gutterBottom>
                  {item.title}
                </Typography>
                <Typography>{item.text}</Typography>
              </Paper>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Timeline */}
      <Box mb={6}>
        <Typography variant="h4" gutterBottom>
          Our Journey
        </Typography>
        <Grid container spacing={2}>
          {history.map((step, i) => (
            <Grid item xs={12} sm={4} key={step.year}>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.2 }}
              >
                <Card variant="outlined">
                  <CardHeader
                    title={step.year}
                    titleTypographyProps={{ variant: 'h6', color: 'primary' }}
                  />
                  <CardContent>
                    <Typography color="text.secondary">{step.desc}</Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Team */}
      <Box mb={6}>
        <Typography variant="h4" gutterBottom>
          Meet the Team
        </Typography>
        <Grid container spacing={4}>
          {team.map((member, i) => (
            <Grid item xs={12} sm={4} key={member.name}>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.2 }}
              >
                <Card sx={{ textAlign: 'center' }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={member.img}
                    alt={member.name}
                  />
                  <CardContent>
                    <Typography variant="h6">{member.name}</Typography>
                    <Typography variant="subtitle2" color="text.secondary">
                      {member.role}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Call to Action */}
      <Paper
        elevation={4}
        sx={{
          py: 6,
          textAlign: 'center',
          bgcolor: (theme) => theme.palette.primary.main,
          color: (theme) => theme.palette.primary.contrastText
        }}
      >
        <Typography variant="h5" gutterBottom>
          Ready to make a difference?
        </Typography>
        <Button
          variant="contained"
          size="large"
          sx={{ mt: 2 }}
          href="/register"
        >
          Become a Donor
        </Button>
      </Paper>
    </Container>
  );
}
