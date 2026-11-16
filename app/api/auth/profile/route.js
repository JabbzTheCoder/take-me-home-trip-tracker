import { NextResponse } from 'next/server';
import { dbService } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function PUT(req) {
  try {
    const payload = getUserFromRequest(req);
    if (!payload) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized: missing or invalid session token'
      }, { status: 401 });
    }

    const { name, email, phone, avatarColor, profilePic } = await req.json();

    // Check if new email is already in use by another driver
    if (email) {
      const existing = await dbService.findUserByEmail(email);
      if (existing && String(existing._id) !== String(payload.id)) {
        return NextResponse.json({
          success: false,
          message: 'That email address is already in use by another driver.'
        }, { status: 400 });
      }
    }

    const updates = {};
    if (name) updates.name = name.trim();
    if (email) updates.email = email.trim().toLowerCase();
    if (phone !== undefined) updates.phone = phone.trim();
    if (avatarColor) updates.avatarColor = avatarColor;
    if (profilePic !== undefined) updates.profilePic = profilePic;

    const updatedUser = await dbService.updateUserProfile(payload.id, updates);
    if (!updatedUser) {
      return NextResponse.json({
        success: false,
        message: 'Failed to update user profile in database.'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully!',
      user: updatedUser
    });
  } catch (err) {
    console.error('Update profile error:', err);
    return NextResponse.json({
      success: false,
      message: err.message || 'Server error updating profile'
    }, { status: 500 });
  }
}
