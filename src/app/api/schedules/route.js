import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Schedule from '@/models/Schedule';
import { getAuthUser } from '@/lib/auth';

export async function GET(req) {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const month = parseInt(searchParams.get('month')); // 0-indexed
    const year = parseInt(searchParams.get('year'));

    await connectDB();
    
    let query = { userId: user._id };
    
    if (!isNaN(month) && !isNaN(year)) {
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);
      query.startTime = { $gte: startDate, $lte: endDate };
    } else {
      // Default to today
      const now = new Date();
      const startOfDay = new Date(now.setHours(0, 0, 0, 0));
      const endOfDay = new Date(now.setHours(23, 59, 59, 999));
      query.startTime = { $gte: startOfDay, $lte: endOfDay };
    }

    const schedules = await Schedule.find(query).sort({ startTime: 1 });

    return NextResponse.json({ success: true, data: schedules });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { title, type, startTime, location } = await req.json();
    
    await connectDB();
    const schedule = await Schedule.create({
      userId: user._id,
      title,
      type,
      startTime,
      location
    });

    return NextResponse.json({ success: true, data: schedule }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
