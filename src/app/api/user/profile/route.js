import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { getAuthUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const profile = await User.findById(user._id).select('-password');

    return NextResponse.json({ success: true, data: profile });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const updates = await req.json();
    
    // Only allow specific fields
    const allowedFields = ['name', 'jobTitle', 'company', 'bio', 'profileImage', 'notifications', 'appearance'];
    const filteredUpdates = {};
    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });

    await connectDB();
    const updatedUser = await User.findByIdAndUpdate(user._id, filteredUpdates, {
      new: true,
      runValidators: true
    }).select('-password');

    return NextResponse.json({ success: true, data: updatedUser });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
