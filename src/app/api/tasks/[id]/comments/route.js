import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Task from '@/models/Task';
import { getAuthUser } from '@/lib/auth';

export async function POST(req, { params }) {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = params;
    const { text } = await req.json();

    await connectDB();
    const task = await Task.findById(id);
    if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 });

    task.comments.push({ userId: user._id, text });
    await task.save();

    return NextResponse.json({ success: true, data: task });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
