import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User, { UserRole } from '../models/User';

dotenv.config();

const seedSuperadmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log('Connected to MongoDB');

    const superadminEmail = 'admin@ex.com';
    const superadminPassword = 'password'; 

    const existingAdmin = await User.findOne({ email: superadminEmail });
    if (existingAdmin) {
      console.log('Superadmin already exists!');
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(superadminPassword, salt);

    const superadmin = new User({
      name: 'Super Admin',
      email: superadminEmail,
      password: hashedPassword,
      role: UserRole.SUPERADMIN
    });

    await superadmin.save();
    console.log('Superadmin seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding superadmin:', error);
    process.exit(1);
  }
};

seedSuperadmin();
