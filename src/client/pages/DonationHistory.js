import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableFooter,
  TablePagination,
  TextField,
  MenuItem,
  Button,
  CircularProgress,
  Alert
} from '@mui/material';
import { motion } from 'framer-motion';

export default function DonationHistory() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [page, setPage]           = useState(0);
  const [pageSize, setPageSize]   = useState(10);
  const [total, setTotal]         = useState(0);
  const [filters, setFilters]     = useState({
    year: '',
    center: '',
    status: ''
  });

  const [centers, setCenters]   = useState([]);
  const [statuses, setStatuses] = useState([]);

  // Fetch distinct centers & statuses once
  useEffect(() => {
    async function fetchMeta() {
      try {
        const token = localStorage.getItem('token');
        const [cRes, sRes] = await Promise.all([
          fetch('/api/donations?distinct=centers', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch('/api/donations?distinct=statuses', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        const [cJson, sJson] = await Promise.all([cRes.json(), sRes.json()]);
        setCenters(cJson.centers || []);
        setStatuses(sJson.statuses || []);
      } catch {
        // ignore meta errors
      }
    }
    fetchMeta();
  }, []);

  // The async fetch logic
  const fetchDonations = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page:     page + 1,
        pageSize,
        ...(filters.year   && { year:   filters.year }),
        ...(filters.center && { center: filters.center }),
        ...(filters.status && { status: filters.status })
      });
      const res = await fetch(`/api/donations?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to load donations');
      const { donations, pagination } = await res.json();
      setDonations(donations);
      setTotal(pagination.total);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Call fetchDonations on mount and whenever page, pageSize or filters change
  useEffect(() => {
    fetchDonations();
  }, [page, pageSize, filters]);

  const handleChangePage = (_, newPage) => {
    setPage(newPage);
  };
  const handleChangePageSize = e => {
    setPageSize(parseInt(e.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = e => {
    const { name, value } = e.target;
    setFilters(f => ({ ...f, [name]: value }));
    setPage(0);
  };

  return (
    <Container sx={{ py: 6 }}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Typography variant="h4" gutterBottom>
          Donation History
        </Typography>

        {/* Filters */}
        <Box sx={{ display:'flex', gap:2, mb:2, flexWrap:'wrap' }}>
          <TextField
            label="Year"
            name="year"
            type="number"
            value={filters.year}
            onChange={handleFilterChange}
            sx={{ width:100 }}
          />
          <TextField
            label="Center"
            name="center"
            select
            value={filters.center}
            onChange={handleFilterChange}
            sx={{ width:200 }}
          >
            <MenuItem value="">All</MenuItem>
            {centers.map(c => (
              <MenuItem key={c} value={c}>{c}</MenuItem>
            ))}
          </TextField>
          <TextField
            label="Status"
            name="status"
            select
            value={filters.status}
            onChange={handleFilterChange}
            sx={{ width:200 }}
          >
            <MenuItem value="">All</MenuItem>
            {statuses.map(s => (
              <MenuItem key={s} value={s}>{s}</MenuItem>
            ))}
          </TextField>
          <Button variant="outlined" onClick={fetchDonations}>
            Apply
          </Button>
        </Box>

        {loading ? (
          <CircularProgress />
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Center</TableCell>
                <TableCell>Volume (ml)</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {donations.map(d => (
                <TableRow key={d.id}>
                  <TableCell>{new Date(d.date).toLocaleDateString()}</TableCell>
                  <TableCell>{d.center}</TableCell>
                  <TableCell>{d.volume}</TableCell>
                  <TableCell>{d.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TablePagination
                  count={total}
                  page={page}
                  onPageChange={handleChangePage}
                  rowsPerPage={pageSize}
                  onRowsPerPageChange={handleChangePageSize}
                  rowsPerPageOptions={[5,10,25]}
                />
              </TableRow>
            </TableFooter>
          </Table>
        )}
      </motion.div>
    </Container>
  );
}
