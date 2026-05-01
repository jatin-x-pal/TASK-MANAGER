import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import TimeOff from '@/models/TimeOff';
import { getAuthUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const requests = await TimeOff.find({ userId: user._id }).sort({ startDate: -1 });
    
    // Calculate total days left (mocking 20 days total allowance)
    const totalAllowance = 20;
    const approvedDays = requests
      .filter(r => r.status === 'Approved')
      .reduce((acc, curr) => {
        const days = Math.ceil((new Date(curr.endDate) - new Date(curr.startDate)) / (1000 * 60 * 60 * 24)) + 1;
        return acc + days;
      }, 0);

    return NextResponse.json({ 
      success: true, 
      data: requests,
      summary: {
        total: totalAllowance,
        used: approvedDays,
        left: Math.max(0, totalAllowance - approvedDays)
      }
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { type, startDate, endDate, reason } = await req.json();
    
    await connectDB();
    const request = await TimeOff.create({
      userId: user._id,
      type,
      startDate,
      endDate,
      reason
    });

    return NextResponse.json({ success: true, data: request }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
