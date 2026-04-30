import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Task from '@/models/Task';
import Project from '@/models/Project';
import { getAuthUser } from '@/lib/auth';

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Verify user is admin or member of the project
    const project = await Project.findById(id);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const isMember = project.members.some(memberId => memberId.toString() === user._id.toString());
    const isAdmin = project.admin.toString() === user._id.toString();

    if (!isAdmin && !isMember) {
      return NextResponse.json({ error: 'Not authorized to view tasks for this project' }, { status: 403 });
    }

    const tasks = await Task.find({ projectId: id }).populate('assignedTo', 'name email');

    return NextResponse.json({ success: true, data: tasks });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
