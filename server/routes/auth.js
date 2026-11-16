import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { dbService } from '../db.js';
import { authenticateJwt, JWT_SECRET } from '../middleware/auth.js';

const router = express.Router();

// Register a new brother account (All users have admin powers)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    const existingUser = await dbService.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    // Salt and hash password (bcrypt rounds = 10, no plaintext passwords!)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const colors = ['#38bdf8', '#f59e0b', '#10b981', '#a855f7', '#f43f5e'];
    const avatarColor = colors[Math.floor(Math.random() * colors.length)];

    const newUser = await dbService.createUser({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      phone: phone || '',
      role: role || 'Admin Chauffeur',
      isAdmin: true,
      mustChangePassword: false, // User chose their own password at registration
      avatarColor
    });

    const token = jwt.sign(
      { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role, isAdmin: true },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const sanitizedUser = {
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      isAdmin: true,
      mustChangePassword: false,
      phone: newUser.phone,
      avatarColor: newUser.avatarColor
    };

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      token,
      user: sanitizedUser,
      mustChangePassword: false
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
});

// Login with email and secure password
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    const user = await dbService.findUserByEmail(email);
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email, role: user.role, isAdmin: true },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const sanitizedUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isAdmin: true,
      mustChangePassword: !!user.mustChangePassword, // Mandatory first-login change flag
      phone: user.phone,
      avatarColor: user.avatarColor
    };

    return res.json({
      success: true,
      message: 'Signed in successfully',
      token,
      user: sanitizedUser,
      mustChangePassword: !!user.mustChangePassword
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Server error during login.' });
  }
});

// Mandatory First-Login Password Change Endpoint
router.post('/change-password', authenticateJwt, async (req, res) => {
  try {
    const { newPassword, confirmPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long.' });
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match.' });
    }

    // Hash new private password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    const updatedUser = await dbService.updateUserPassword(req.user.id, hashedPassword);
    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.json({
      success: true,
      message: 'Password successfully updated! Your account is now fully private.',
      mustChangePassword: false
    });
  } catch (error) {
    console.error('Password change error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update password.' });
  }
});

// Get current logged-in brother profile
router.get('/me', authenticateJwt, async (req, res) => {
  try {
    const user = await dbService.findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    const sanitizedUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isAdmin: true,
      mustChangePassword: !!user.mustChangePassword,
      phone: user.phone || '',
      avatarColor: user.avatarColor || '#38bdf8',
      profilePic: user.profilePic || ''
    };
    return res.json({ success: true, user: sanitizedUser });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching profile.' });
  }
});

// Update driver profile (name, email, phone, avatarColor, profilePic)
router.put('/profile', authenticateJwt, async (req, res) => {
  try {
    const { name, email, phone, avatarColor, profilePic } = req.body;

    if (email) {
      const existing = await dbService.findUserByEmail(email);
      if (existing && String(existing._id) !== String(req.user.id)) {
        return res.status(400).json({ success: false, message: 'This email is already in use by another driver.' });
      }
    }

    const updated = await dbService.updateUserProfile(req.user.id, {
      name: name?.trim(),
      email: email?.toLowerCase()?.trim(),
      phone: phone?.trim(),
      avatarColor,
      profilePic
    });

    if (!updated) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const sanitizedUser = {
      _id: updated._id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      isAdmin: true,
      mustChangePassword: !!updated.mustChangePassword,
      phone: updated.phone || '',
      avatarColor: updated.avatarColor || '#38bdf8',
      profilePic: updated.profilePic || ''
    };

    return res.json({
      success: true,
      message: 'Profile updated successfully!',
      user: sanitizedUser
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
});

// Get all registered brothers
router.get('/brothers', authenticateJwt, async (req, res) => {
  try {
    const brothers = await dbService.getAllBrothers();
    return res.json({ success: true, brothers });
  } catch (error) {
    console.error('Fetch brothers error:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching brothers.' });
  }
});

export default router;
