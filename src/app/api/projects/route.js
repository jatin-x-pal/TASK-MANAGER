import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Project from '@/models/Project';
import { getAuthUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    // Get projects where user is admin OR member
    const projects = await Project.find({
      $or: [{ admin: user._id }, { members: user._id }]
    }).populate('admin', 'name email').populate('members', 'name email');

    return NextResponse.json({ success: true, data: projects });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, description, color } = await req.json();

    if (!name) {
      return NextResponse.json({ error: 'Please provide a project name' }, { status: 400 });
    }

    await connectDB();
    const project = await Project.create({
      name,
      description,
      color: color || '#48A3FF',
      admin: user._id,
      members: []
    });

    return NextResponse.json({ success: true, data: project }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
