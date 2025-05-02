import mongoose from 'mongoose';
import dotenv from 'dotenv';
import CreditCardOfferModel from '../models/CreditCardOffer.model';
import offers from '../data/creditCardOffers.json';

// Load environment variables
dotenv.config();

const seedOffers = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI environment variable is not defined');
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB successfully');

    // Clear existing offers
    console.log('Clearing existing credit card offers...');
    await CreditCardOfferModel.deleteMany({});
    console.log('Existing offers cleared');

    // Insert new offers
    console.log('Inserting new credit card offers...');
    const insertedOffers = await CreditCardOfferModel.insertMany(offers);
    console.log(`Successfully inserted ${insertedOffers.length} credit card offers`);

    // Log offers by credit score range
    const offersByRange = {
      excellent: insertedOffers.filter(o => o.minCreditScore >= 740).length,
      good: insertedOffers.filter(o => o.minCreditScore >= 670 && o.minCreditScore < 740).length,
      fair: insertedOffers.filter(o => o.minCreditScore >= 580 && o.minCreditScore < 670).length,
      poor: insertedOffers.filter(o => o.minCreditScore < 580).length,
    };

    console.log('\nOffers by credit score range:');
    console.log('Excellent (740+):', offersByRange.excellent);
    console.log('Good (670-739):', offersByRange.good);
    console.log('Fair (580-669):', offersByRange.fair);
    console.log('Poor (300-579):', offersByRange.poor);

    mongoose.disconnect();
    console.log('\nDatabase seeding completed successfully');

  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seeding function
seedOffers();
