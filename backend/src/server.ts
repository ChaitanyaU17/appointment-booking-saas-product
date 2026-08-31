import 'dotenv/config';
import app from './app';
import connectDB from './db';
import User, { UserRole } from './models/User';
import bcrypt from 'bcryptjs';

const PORT = process.env.PORT || 5000;

const bootstrapSuperadmin = async () => {
  try {
    const email = process.env.SUPERADMIN_EMAIL || 'admin@ex.com';
    const password = process.env.SUPERADMIN_PASSWORD || 'password';

    const existingAdmin = await User.findOne({ email });
    if (!existingAdmin) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      const superadmin = new User({
        name: 'Super Admin',
        email,
        password: hashedPassword,
        role: UserRole.SUPERADMIN
      });
      await superadmin.save();
      console.log(`Superadmin created: ${email}`);
    } else {
      console.log(`Superadmin already exists: ${email}`);
    }
  } catch (error) {
    console.error('Error creating superadmin:', error);
  }
};

connectDB().then(async () => {
  await bootstrapSuperadmin();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
