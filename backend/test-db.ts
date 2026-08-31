import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGO_URI || '';

async function testConnection() {
  try {
    console.log('Connecting to:', uri);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      tls: true
    });
    console.log('Successfully connected to MongoDB!');
  
    const User = require('./src/models/User').default;
    const adminEmail = 'admin@example.com';
    const user = await User.findOne({ email: adminEmail });
    console.log('Found user:', user ? user.email : 'None');

    process.exit(0);
  } catch (err) {
    console.error('Connection error:', err);
    process.exit(1);
  }
}

testConnection();
