import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'Admin Chauffeur' },
  isAdmin: { type: Boolean, default: true },
  mustChangePassword: { type: Boolean, default: true },
  phone: { type: String, default: '' },
  avatarColor: { type: String, default: '#38bdf8' },
  profilePic: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

export const User = mongoose.models.User || mongoose.model('User', userSchema);
