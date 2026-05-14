import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    maxlength: [60, 'Name cannot be more than 60 characters'],
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please fill a valid email address',
    ],
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false,
  },
  jobTitle: {
    type: String,
    default: '',
  },
  company: {
    type: String,
    default: '',
  },
  bio: {
    type: String,
    default: '',
  },
  profileImage: {
    type: String,
    default: '',
  },
  notifications: {
    tasks: { type: Boolean, default: true },
    deadlines: { type: Boolean, default: true },
    mentions: { type: Boolean, default: true },
    updates: { type: Boolean, default: false },
  },
  appearance: {
    type: String,
    enum: ['light', 'dark', 'system'],
    default: 'light',
  },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);
