import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICreditCardOffer extends Document {
    cardName: string;
    issuer: string;
    minCreditScore: number;
    maxCreditScore?: number;
    annualFee?: number;
    apr?: number; // Consider storing APR ranges or types if needed
    rewards?: string;
    cardType?: string; // e.g., 'Cash Back', 'Travel', 'Balance Transfer'
    details?: string;
    imageUrl?: string; // Optional: URL for card image
    applyUrl?: string; // Optional: URL to apply for the card
    createdAt: Date;
    updatedAt: Date;
}

// Schema for CreditCardOffer document
const CreditCardOfferSchema: Schema<ICreditCardOffer> = new Schema({
    cardName: { type: String, required: true, trim: true },
    issuer: { type: String, required: true, trim: true },
    minCreditScore: { type: Number, required: true, index: true }, // Index for faster querying based on score
    maxCreditScore: { type: Number },
    annualFee: { type: Number, default: 0 },
    apr: { type: Number },
    rewards: { type: String },
    cardType: { type: String },
    details: { type: String },
    imageUrl: { type: String },
    applyUrl: { type: String },
}, {
    timestamps: true
});

const CreditCardOfferModel: Model<ICreditCardOffer> = mongoose.model<ICreditCardOffer>('CreditCardOffer', CreditCardOfferSchema);

export default CreditCardOfferModel;
