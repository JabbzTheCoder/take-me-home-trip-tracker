import { NextResponse } from 'next/server';
import { dbService } from '@/lib/db';
import { getUserFromRequest, comparePassword, hashPassword } from '@/lib/auth';

export async function POST(req) {
  try {
    const payload = getUserFromRequest(req);
    if (!payload) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized: invalid or missing session'
      }, { status: 401 });
    }

    const { currentPassword, newPassword } = await req.json();

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json({
        success: false,
        message: 'New password must be at least 6 characters long.'
      }, { status: 400 });
    }

    const user = await dbService.findUserByEmail(payload.email);
    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'Driver record not found.'
      }, { status: 404 });
    }

    // If voluntary change and currentPassword supplied, verify it
    if (currentPassword) {
      const isMatch = await comparePassword(currentPassword, user.password);
      if (!isMatch) {
        return NextResponse.json({
          success: false,
          message: 'Current password does not match.'
        }, { status: 400 });
      }
    }

    const newHash = await hashPassword(newPassword);
    const updated = await dbService.updateUserPassword(user._id, newHash);

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully! Your account is now secured.',
      user: updated
    });
  } catch (err) {
    console.error('Password change error:', err);
    return NextResponse.json({
      success: false,
      message: 'Failed to update password'
    }, { status: 500 });
  }
}
