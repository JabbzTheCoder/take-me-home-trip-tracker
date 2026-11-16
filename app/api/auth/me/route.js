import { NextResponse } from 'next/server';
import { dbService } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req) {
  try {
    const payload = getUserFromRequest(req);
    if (!payload) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized: missing or invalid session token'
      }, { status: 401 });
    }

    const user = await dbService.findUserById(payload.id);
    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'Driver profile not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isAdmin: user.isAdmin,
        mustChangePassword: user.mustChangePassword,
        phone: user.phone || '',
        avatarColor: user.avatarColor || '#38bdf8',
        profilePic: user.profilePic || ''
      }
    });
  } catch (err) {
    console.error('Auth check error:', err);
    return NextResponse.json({
      success: false,
      message: 'Failed to verify driver session'
    }, { status: 500 });
  }
}
