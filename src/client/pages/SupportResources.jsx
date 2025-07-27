import React, { useState, useEffect, useContext } from 'react';
import {
  Container,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Button,
  Box,
  Alert,
  MenuItem,
  CircularProgress
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { AuthContext } from '../contexts/AuthContext';

export default function SupportResources() {
  const { user } = useContext(AuthContext);
  const [faqs, setFaqs] = useState([]);
  const [loadingFaqs, setLoadingFaqs] = useState(true);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    type: 'Medical',
    subject: '',
    message: ''
  });
  const [submitStatus, setSubmitStatus] = useState(null);

  // Load FAQs once on mount. No cleanup function is returned.
  useEffect(() => {
    async function loadFaqs() {
      setLoadingFaqs(true);
      try {
        const res = await fetch('/api/faqs');
        if (!res.ok) throw new Error('Failed to fetch FAQs');
        const { faqs } = await res.json();
        setFaqs(faqs);
      } catch {
        setError('Failed to load FAQs.');
      } finally {
        setLoadingFaqs(false);
      }
    }
    loadFaqs();
  }, []); // empty deps → runs once

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitStatus(null);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/support-query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');
      setSubmitStatus({ type: 'success', msg: data.message });
      setForm({ type: 'Medical', subject: '', message: '' });
    } catch (err) {
      setSubmitStatus({ type: 'error', msg: err.message });
    }
  };

  return (
    <Container sx={{ py: 6 }}>
      <Typography variant="h4" gutterBottom>
        Support & Resources
      </Typography>

      <Typography variant="h5" sx={{ mt: 4 }}>
        Frequently Asked Questions
      </Typography>
      {loadingFaqs ? (
        <CircularProgress />
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        faqs.map((f, i) => (
          <Accordion key={i}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>{f.q}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>{f.a}</Typography>
            </AccordionDetails>
          </Accordion>
        ))
      )}

      <Typography variant="h5" sx={{ mt: 6, mb: 2 }}>
        Submit a Question
      </Typography>
      {submitStatus && (
        <Alert
          severity={submitStatus.type}
          onClose={() => setSubmitStatus(null)}
          sx={{ mb: 2 }}
        >
          {submitStatus.msg}
        </Alert>
      )}
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 600 }}
      >
        <TextField
          select
          label="Type"
          name="type"
          value={form.type}
          onChange={handleChange}
          required
        >
          <MenuItem value="Medical">Medical Query</MenuItem>
          <MenuItem value="Technical">Technical Support</MenuItem>
        </TextField>
        <TextField
          label="Subject"
          name="subject"
          value={form.subject}
          onChange={handleChange}
          required
        />
        <TextField
          label="Message"
          name="message"
          value={form.message}
          onChange={handleChange}
          required
          multiline
          rows={4}
        />
        <Button type="submit" variant="contained" size="large">
          Send
        </Button>
      </Box>
    </Container>
  );
}
