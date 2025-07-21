import React, { useState, useEffect, useContext } from 'react';
import {
  Container,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  CircularProgress,
  Alert
} from '@mui/material';
import { motion } from 'framer-motion';
import { AuthContext } from '../contexts/AuthContext';

export default function Inventory() {
  const { user } = useContext(AuthContext);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    async function fetchInventory() {
      try {
        const token = window.localStorage.getItem('token');
        const res   = await fetch('/api/inventory', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error(`Fetch failed: ${res.statusText}`);
        const json = await res.json();
        setInventory(json.inventory);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchInventory();
  }, []);

  if (loading) return (
    <Container sx={{ textAlign: 'center', py: 6 }}>
      <CircularProgress />
    </Container>
  );

  if (error) return (
    <Container sx={{ py: 6 }}>
      <Alert severity="error">{error}</Alert>
    </Container>
  );

  return (
    <Container sx={{ py: 6 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Typography variant="h4" gutterBottom>
          Current Inventory
        </Typography>
        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Blood Group</TableCell>
                <TableCell align="right">Total (ml)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {inventory.map((row) => (
                <TableRow key={row.blood_group}>
                  <TableCell>{row.blood_group}</TableCell>
                  <TableCell align="right">{row.total_ml}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </motion.div>
    </Container>
  );
}
