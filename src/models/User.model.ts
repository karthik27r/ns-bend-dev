import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

// Interface for Address subdocument
export interface IAddress extends Document {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

// Schema for Address subdocument
const AddressSchema: Schema<IAddress> = new Schema({
  street: { type: String },
  city: { type: String },
  state: { type: String },
  zipCode: { type: String }
});

// Interface for CreditHistory subdocument
export interface ICreditHistory extends Document {
  date: Date;
  score: number;
  note?: string;
}

// Schema for CreditHistory subdocument
const CreditHistorySchema: Schema<ICreditHistory> = new Schema({
  date: { type: Date, default: Date.now },
  score: { type: Number, required: true }, // Made score required here
  note: { type: String }
});

// Interface for User document
export interface IUser extends Document {
  email: string;
  password?: string; // Make password optional on the interface after hashing
  firstName: string;
  lastName: string;
  dateOfBirth?: Date;
  address?: IAddress;
  creditScore: number;
  creditHistory: ICreditHistory[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Schema for User document
const UserSchema: Schema<IUser> = new Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false }, // select: false prevents password from being returned by default
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  dateOfBirth: { type: Date },
  address: AddressSchema,
  creditScore: { type: Number, default: 300 }, // Default starting score
  creditHistory: [CreditHistorySchema],
}, {
  timestamps: true // Automatically adds createdAt and updatedAt fields
});

// Pre-save hook to hash password before saving
UserSchema.pre<IUser>('save', async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    // Ensure the error is passed correctly
    // Need to cast err to Error type or handle appropriately
    next(err instanceof Error ? err : new Error('Error hashing password'));
  }
});

// Method to compare candidate password with the user's hashed password
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  // 'this.password' might be undefined if 'select: false' was used and it wasn't explicitly selected
  // We need to re-fetch the user with the password field selected if needed, or handle this case.
  // For simplicity here, we assume the password field is available when this method is called (e.g., during login).
  // A better approach might involve fetching the user with the password specifically for comparison.
  if (!this.password) {
      // Fetch the user again including the password field
      const userWithPassword = await UserModel.findById(this._id).select('+password').exec();
      if (!userWithPassword || !userWithPassword.password) {
          throw new Error('Could not retrieve password for comparison.');
      }
      return bcrypt.compare(candidatePassword, userWithPassword.password);
  }
  return bcrypt.compare(candidatePassword, this.password);
};


// Create and export the User model
const UserModel: Model<IUser> = mongoose.model<IUser>('User', UserSchema);

export default UserModel;
