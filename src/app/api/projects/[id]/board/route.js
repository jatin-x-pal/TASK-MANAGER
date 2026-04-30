import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Project from '@/models/Project';
import Task from '@/models/Task';
import { getAuthUser } from '@/lib/auth';

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const project = await Project.findById(id).populate('admin', 'name email').populate('members', 'name email');

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const isMember = project.members.some(m => m._id.toString() === user._id.toString());
    const isAdmin = project.admin._id.toString() === user._id.toString();

    if (!isAdmin && !isMember) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const tasks = await Task.find({ projectId: id }).populate('assignedTo', 'name email');

    return NextResponse.json({ success: true, project, tasks });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
