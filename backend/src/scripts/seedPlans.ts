import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Plan from '../models/Plan';

dotenv.config();

const seedPlans = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/slotify');
    console.log('Connected to MongoDB');

    const existingPlans = await Plan.countDocuments();
    if (existingPlans > 0) {
      console.log(`${existingPlans} plan(s) already exist. Skipping seed.`);
      process.exit(0);
    }

    const plans = [
      {
        name: 'Starter',
        slug: 'starter',
        price: 0,
        currency: 'INR',
        billingCycle: 'monthly',
        isActive: true,
        isDefault: true,
        displayOrder: 1,
        features: {
          maxBookingsPerMonth: 50,
          maxServices: 3,
          maxAdmins: 1,
          googleCalendarSync: false,
          googleMeetIntegration: false,
          customBranding: false,
          prioritySupport: false,
          analyticsAccess: false,
        },
      },
      {
        name: 'Professional',
        slug: 'professional',
        price: 999,
        currency: 'INR',
        billingCycle: 'monthly',
        isActive: true,
        isDefault: false,
        displayOrder: 2,
        features: {
          maxBookingsPerMonth: 500,
          maxServices: 20,
          maxAdmins: 5,
          googleCalendarSync: true,
          googleMeetIntegration: true,
          customBranding: false,
          prioritySupport: false,
          analyticsAccess: true,
        },
      },
      {
        name: 'Enterprise',
        slug: 'enterprise',
        price: 2999,
        currency: 'INR',
        billingCycle: 'monthly',
        isActive: true,
        isDefault: false,
        displayOrder: 3,
        features: {
          maxBookingsPerMonth: 9999,
          maxServices: 9999,
          maxAdmins: 9999,
          googleCalendarSync: true,
          googleMeetIntegration: true,
          customBranding: true,
          prioritySupport: true,
          analyticsAccess: true,
        },
      },
    ];

    await Plan.insertMany(plans);
    console.log('Default plans seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding plans:', error);
    process.exit(1);
  }
};

seedPlans();
