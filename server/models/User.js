import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: 'Admin Chauffeur'
  },
  isAdmin: {
    type: Boolean,
    default: true // All users have full admin powers across all system functions
  },
  mustChangePassword: {
    type: Boolean,
    default: true // Mandatory first-login password change for security
  },
  phone: {
    type: String,
    default: ''
  },
  avatarColor: {
    type: String,
    default: '#38bdf8'
  },
  profilePic: {
    type: String,
    default: '' // Base64 data URL or photo URL
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Remove password from JSON outputs
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export const User = mongoose.models.User || mongoose.model('User', userSchema);
