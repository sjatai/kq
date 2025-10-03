const express = require('express');
const router = express.Router();
const LoyaltyTransaction = require('../models/LoyaltyTransaction');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Middleware stub (replace with full auth later)
const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Access denied' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Auth error:', err); // Debug
    res.status(400).json({ error: 'Invalid token' });
  }
};

// Helper: Get customer balance (sum transactions)
async function getCustomerBalance(customerId, businessId) {
  try {
    const transactions = await LoyaltyTransaction.find({ customerId, businessId }).sort({ createdAt: 1 });
    return transactions.reduce((acc, t) => acc + (t.type === 'add' ? t.amount : -t.amount), 0);
  } catch (err) {
    console.error('Balance helper error:', err);
    return 0; // Fallback
  }
}

// Stub MoEngage data fetch (for rules, commented out for test)
async function getMoEngageData(customerId) {
  return { spend: 100, isVIP: true }; // Stub
}

// GET /api/loyalty/balance/:customerId
router.get('/balance/:customerId', auth, async (req, res) => {
  try {
    console.log('GET balance for:', req.params.customerId); // Debug
    const balance = await getCustomerBalance(req.params.customerId, req.user.id);
    res.json({ balance });
  } catch (err) {
    console.error('Balance endpoint error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/loyalty/transactions/:customerId
router.get('/transactions/:customerId', auth, async (req, res) => {
  try {
    console.log('GET transactions for:', req.params.customerId); // Debug
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'Business not found' });

    const { customerId } = req.params;
    const transactions = await LoyaltyTransaction.find({ 
      customerId, 
      businessId: req.user.id 
    }).sort({ createdAt: -1 });

    res.json({ transactions, count: transactions.length });
  } catch (err) {
    console.error('Transactions endpoint error:', err);
    res.status(500).json({ error: 'Server error fetching transactions' });
  }
});

// POST /api/loyalty/add-points (SIMPLIFIED FOR TEST - with debug logs, no rules)
router.post('/add-points', auth, async (req, res) => {
  try {
    console.log('POST add-points hit, body:', req.body); // Log 1: Request received
    const { customerId, amount, event } = req.body;
    const businessId = req.user.id;
    console.log('Business ID:', businessId); // Log 2: Auth ID

    const user = await User.findById(businessId);
    console.log('User found:', !!user); // Log 3: User check
    if (!user) return res.status(404).json({ error: 'Business not found' });

    const currentBalance = await getCustomerBalance(customerId, businessId);
    console.log('Current balance:', currentBalance); // Log 4: Balance fetch

    // COMMENTED: Rule eval for test (uncomment later)
    // const rules = await Promotion.find({ type: 'loyalty', businessId, active: true }).sort({ priority: 1 });
    // ... rule logic ...
    // amount *= decision.multiplier;

    const newBalance = currentBalance + amount;
    console.log('New balance:', newBalance); // Log 5: Calc

    const transaction = new LoyaltyTransaction({
      businessId,
      customerId,
      type: 'add',
      amount,
      event,
      balanceAfter: newBalance,
      // promotionId: null, // Stub
    });
    await transaction.save();
    console.log('Transaction saved ID:', transaction._id); // Log 6: Save success

    res.status(201).json({ message: 'Points added', balance: newBalance, transaction });
  } catch (err) {
    console.error('Add points full error:', err); // Detailed log
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/loyalty/consume-points (SIMPLIFIED FOR TEST)
router.post('/consume-points', auth, async (req, res) => {
  try {
    console.log('POST consume-points hit, body:', req.body); // Debug
    const { customerId, amount, event } = req.body;
    const businessId = req.user.id;

    const user = await User.findById(businessId);
    if (!user) return res.status(404).json({ error: 'Business not found' });

    const currentBalance = await getCustomerBalance(customerId, businessId);
    if (currentBalance < amount) return res.status(400).json({ error: 'Insufficient points' });

    // COMMENTED: Rule eval for test
    // ... rule logic ...

    const newBalance = currentBalance - amount;
    const transaction = new LoyaltyTransaction({
      businessId,
      customerId,
      type: 'consume',
      amount,
      event,
      balanceAfter: newBalance,
    });
    await transaction.save();

    res.status(200).json({ message: 'Points consumed', balance: newBalance, transaction });
  } catch (err) {
    console.error('Consume points error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/loyalty/sync-offline (SIMPLIFIED FOR TEST)
router.post('/sync-offline', auth, async (req, res) => {
  try {
    console.log('POST sync-offline hit, queue length:', req.body.queue?.length || 0); // Debug
    const { customerId, queue } = req.body;
    let balance = await getCustomerBalance(customerId, req.user.id);
    const transactions = [];

    for (const item of queue || []) {
      if (item.action === 'add') {
        balance += item.amount;
      } else if (item.action === 'reduce') {
        if (balance >= item.amount) balance -= item.amount;
      }
      const transaction = new LoyaltyTransaction({
        businessId: req.user.id,
        customerId,
        type: item.action === 'add' ? 'add' : 'consume',
        amount: item.amount,
        event: item.event,
        balanceAfter: balance,
      });
      await transaction.save();
      transactions.push(transaction);
    }

    res.status(200).json({ message: 'Queue synced', balance, transactions });
  } catch (err) {
    console.error('Sync error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;