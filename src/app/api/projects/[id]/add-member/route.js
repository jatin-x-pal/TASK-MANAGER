import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Project from '@/models/Project';
import User from '@/models/User';
import { getAuthUser } from '@/lib/auth';

export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: 'Please provide user email' }, { status: 400 });
    }

    await connectDB();
    
    // Check if user is the admin
    const project = await Project.findById(id);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    
    if (project.admin.toString() !== user._id.toString()) {
      return NextResponse.json({ error: 'Only admin can add members' }, { status: 403 });
    }

    // Find the user to add
    const userToAdd = await User.findOne({ email });
    if (!userToAdd) {
      return NextResponse.json({ error: 'User with this email not found' }, { status: 404 });
    }

    // Check if already a member
    if (project.members.some(m => m.toString() === userToAdd._id.toString())) {
      return NextResponse.json({ error: 'User is already a member' }, { status: 400 });
    }

    project.members.push(userToAdd._id);
    await project.save();

    return NextResponse.json({ success: true, data: project });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
