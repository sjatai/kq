import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Button, TextField, Tabs, Tab, Table, TableBody, TableCell, TableHead, TableRow, CircularProgress, Alert } from '@mui/material';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import axios from 'axios';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const LoyaltyDashboard = () => {
  const [tab, setTab] = useState(0);
  const [customerId, setCustomerId] = useState('user123'); // Stub
  const [amount, setAmount] = useState('');
  const [event, setEvent] = useState('purchase');
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [token, setToken] = useState('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InRlc3RCdXNpbmVzc0lkIiwiaWF0IjoxNzU5NTQ4OTAwfQ.m5DDZu2VIUfgHwRXeu59tQnXtXvYvBV3utkfhKhhJGg'); // Stub; replace with real auth

  const API_BASE = 'http://localhost:3001/api/loyalty';
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchBalance();
    fetchTransactions();
  }, [customerId, token]); // Add dependencies

  const fetchBalance = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/balance/${customerId}`, { headers });
      setBalance(res.data.balance);
    } catch (err) {
      setError('Failed to fetch balance');
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      // Assume GET /api/loyalty/transactions/:customerId endpoint (add later)
      const res = await axios.get(`${API_BASE}/transactions/${customerId}`, { headers });
      setTransactions(res.data);
    } catch (err) {
      setError('Failed to fetch transactions');
    }
  };

  const handleAddPoints = async () => {
    try {
      await axios.post(`${API_BASE}/add-points`, { customerId, amount: parseInt(amount), event }, { headers });
      fetchBalance();
      setAmount('');
    } catch (err) {
      setError('Failed to add points');
    }
  };

  const handleConsumePoints = async () => {
    try {
      await axios.post(`${API_BASE}/consume-points`, { customerId, amount: parseInt(amount), event }, { headers });
      fetchBalance();
      setAmount('');
    } catch (err) {
      setError('Failed to consume points');
    }
  };

  const handleSyncOffline = async () => {
    // TODO: Integrate SDK when available
    // For now, just refresh the balance
    fetchBalance();
    setError('SDK integration coming soon');
  };

  const chartData = {
    labels: transactions.map(t => new Date(t.createdAt).toLocaleDateString()),
    datasets: [{ label: 'Balance', data: transactions.map(t => t.balanceAfter), borderColor: 'rgb(75, 192, 192)', tension: 0.1 }],
  };

  if (loading) return <CircularProgress />;

  return (
    <div>
      <Typography variant="h4">Loyalty Dashboard</Typography>
      {error && <Alert severity="error">{error}</Alert>}
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography variant="h6">Current Balance: {balance} points</Typography>
          <Button variant="contained" onClick={handleSyncOffline} sx={{ mt: 1 }}>Sync Offline Queue</Button>
        </CardContent>
      </Card>

      <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mt: 2 }}>
        <Tab label="Add Points" />
        <Tab label="Consume Points" />
        <Tab label="Transactions" />
        <Tab label="Balance Chart" />
      </Tabs>

      {tab === 0 && (
        <Card sx={{ mt: 2 }}>
          <CardContent>
            <TextField label="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} fullWidth />
            <TextField label="Event" select value={event} onChange={(e) => setEvent(e.target.value)} fullWidth sx={{ mt: 2 }}>
              <option value="purchase">Purchase</option>
              <option value="entry">Entry</option>
            </TextField>
            <Button variant="contained" onClick={handleAddPoints} sx={{ mt: 2 }}>Add Points</Button>
          </CardContent>
        </Card>
      )}

      {tab === 1 && (
        <Card sx={{ mt: 2 }}>
          <CardContent>
            <TextField label="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} fullWidth />
            <TextField label="Event" select value={event} onChange={(e) => setEvent(e.target.value)} fullWidth sx={{ mt: 2 }}>
              <option value="redemption">Redemption</option>
              <option value="exit">Exit</option>
            </TextField>
            <Button variant="contained" color="secondary" onClick={handleConsumePoints} sx={{ mt: 2 }}>Consume Points</Button>
          </CardContent>
        </Card>
      )}

      {tab === 2 && (
        <Table sx={{ mt: 2 }}>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Balance After</TableCell>
              <TableCell>Event</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map((t) => (
              <TableRow key={t._id}>
                <TableCell>{new Date(t.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>{t.type}</TableCell>
                <TableCell>{t.amount}</TableCell>
                <TableCell>{t.balanceAfter}</TableCell>
                <TableCell>{t.event}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {tab === 3 && <Line data={chartData} options={{ responsive: true }} sx={{ mt: 2 }} />}
    </div>
  );
};

export default LoyaltyDashboard;