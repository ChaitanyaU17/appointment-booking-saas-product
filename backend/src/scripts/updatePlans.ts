import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Plan from '../models/Plan';
import Business from '../models/Business';

dotenv.config();

const updatePlans = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/slotify');
    console.log('Connected to MongoDB');

    
    await Plan.deleteMany({});
    console.log('Cleared existing plans.');

    const plans = [
      {
        name: 'Free',
        slug: 'free',
        price: 0,
        currency: 'INR',
        billingCycle: 'monthly',
        isActive: true,
        isDefault: true,
        displayOrder: 1,
        features: {
          maxBookingsPerMonth: 99999,
          maxServices: 1,
          maxAdmins: 1,
          googleCalendarSync: true,
          googleMeetIntegration: true,
          customBranding: false,
          prioritySupport: false,
          analyticsAccess: false,
        },
      },
      {
        name: 'Standard',
        slug: 'standard',
        price: 800,
        currency: 'INR',
        billingCycle: 'monthly',
        isActive: true,
        isDefault: false,
        displayOrder: 2,
        features: {
          maxBookingsPerMonth: 99999,
          maxServices: 99999,
          maxAdmins: 1,
          googleCalendarSync: true,
          googleMeetIntegration: true,
          customBranding: true,
          prioritySupport: false,
          analyticsAccess: false,
        },
      },
      {
        name: 'Teams',
        slug: 'teams',
        price: 1300,
        currency: 'INR',
        billingCycle: 'monthly',
        isActive: true,
        isDefault: false,
        displayOrder: 3,
        features: {
          maxBookingsPerMonth: 99999,
          maxServices: 99999,
          maxAdmins: 99999,
          googleCalendarSync: true,
          googleMeetIntegration: true,
          customBranding: true,
          prioritySupport: true,
          analyticsAccess: true,
        },
      },
    ];

    const createdPlans = await Plan.insertMany(plans);
    console.log('New Calendly-style plans seeded successfully!');
    
    const defaultPlan = createdPlans.find(p => p.slug === 'free');
    if (defaultPlan) {
        await Business.updateMany({}, { planId: defaultPlan._id });
        console.log('Migrated all existing businesses to the Free plan.');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error updating plans:', error);
    process.exit(1);
  }
};

updatePlans();
