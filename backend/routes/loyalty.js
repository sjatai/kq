const express = require('express');
const router = express.Router();
const LoyaltyTransaction = require('../models/LoyaltyTransaction');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Auth middleware
const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Access denied' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Auth error:', err);
    res.status(400).json({ error: 'Invalid token' });
  }
};

// Balance helper
async function getCustomerBalance(customerId, businessId) {
  try {
    const transactions = await LoyaltyTransaction.find({ customerId, businessId }).sort({ createdAt: 1 });
    return transactions.reduce((acc, t) => acc + (t.type === 'add' ? t.amount : -t.amount), 0);
  } catch (err) {
    console.error('Balance helper error:', err);
    return 0;
  }
}

// GET /balance/:customerId
router.get('/balance/:customerId', auth, async (req, res) => {
  try {
    console.log('GET balance:', req.params.customerId);
    const balance = await getCustomerBalance(req.params.customerId, req.user.id);
    res.json({ balance });
  } catch (err) {
    console.error('Balance error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /transactions/:customerId
router.get('/transactions/:customerId', auth, async (req, res) => {
  try {
    console.log('GET transactions:', req.params.customerId, req.user.id);
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'Business not found' });

    const { customerId } = req.params;
    const transactions = await LoyaltyTransaction.find({ customerId, businessId: req.user.id }).sort({ createdAt: -1 });
    console.log('Found txns:', transactions.length);
    res.json({ transactions, count: transactions.length });
  } catch (err) {
    console.error('Transactions error:', err);
    res.status(500).json({ error: 'Server error fetching transactions' });
  }
});

// POST /add-points
router.post('/add-points', auth, async (req, res) => {
  try {
    console.log('POST add-points:', req.body);
    const { customerId, amount, event } = req.body;
    const businessId = req.user.id;

    const user = await User.findById(businessId);
    if (!user) return res.status(404).json({ error: 'Business not found' });

    const currentBalance = await getCustomerBalance(customerId, businessId);
    const newBalance = currentBalance + amount;

    const transaction = new LoyaltyTransaction({
      _id: new Date().toISOString(), // String ID
      businessId,
      customerId,
      type: 'add',
      amount,
      event,
      balanceAfter: newBalance,
    });
    await transaction.save();
    console.log('Txn saved:', transaction._id);

    res.status(201).json({ message: 'Points added', balance: newBalance, transaction });
  } catch (err) {
    console.error('Add points error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /consume-points (stub)
router.post('/consume-points', auth, async (req, res) => {
  try {
    res.status(200).json({ message: 'Consume stub' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /sync-offline (stub)
router.post('/sync-offline', auth, async (req, res) => {
  try {
    res.status(200).json({ message: 'Sync stub' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;