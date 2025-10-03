const mongoose = require('mongoose');
const User = require('./models/User');
mongoose.connect(process.env.MONGODB_URI);
const user = new User({ _id: 'testBusinessId', email: 'test@business.com', password: 'hashed', businessName: 'Test Shop' });
user.save().then(() => console.log('Test user created')).catch(console.error);node 