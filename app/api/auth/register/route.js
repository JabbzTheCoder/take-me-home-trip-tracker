import { NextResponse } from 'next/server';
import { dbService } from '@/lib/db';
import { signToken } from '@/lib/auth';

export async function POST(req) {
  try {
    const { name, email, phone, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({
        success: false,
        message: 'Name, email, and password are required.'
      }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await dbService.findUserByEmail(cleanEmail);
    if (existing) {
      return NextResponse.json({
        success: false,
        message: 'Driver email is already registered.'
      }, { status: 400 });
    }

    const newUser = await dbService.createUser({
      name,
      email: cleanEmail,
      phone,
      password,
      role: 'Admin Chauffeur',
      isAdmin: true
    });

    const token = signToken({
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      isAdmin: newUser.isAdmin
    });

    return NextResponse.json({
      success: true,
      message: 'Driver account registered successfully!',
      token,
      user: newUser
    });
  } catch (err) {
    console.error('Register driver error:', err);
    return NextResponse.json({
      success: false,
      message: err.message || 'Failed to register driver'
    }, { status: 500 });
  }
}
