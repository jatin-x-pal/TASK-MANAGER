import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Task from '@/models/Task';
import Project from '@/models/Project';
import { getAuthUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const tasks = await Task.find({ assignedTo: user._id })
      .populate('projectId', 'name color')
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: tasks });
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

    const { title, description, projectId, assignedTo, priority, dueDate } = await req.json();

    if (!title || !projectId) {
      return NextResponse.json({ error: 'Title and Project ID are required' }, { status: 400 });
    }

    await connectDB();
    
    // Verify user is admin or member of the project
    const project = await Project.findById(projectId);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const isMember = project.members.some(m => m.toString() === user._id.toString());
    const isAdmin = project.admin.toString() === user._id.toString();

    if (!isAdmin && !isMember) {
      return NextResponse.json({ error: 'You do not have permission to create tasks in this project' }, { status: 403 });
    }

    // Only admins can assign tasks upon creation
    const finalAssignedTo = isAdmin ? assignedTo : null;

    const task = await Task.create({
      title,
      description,
      projectId,
      assignedTo: finalAssignedTo,
      priority,
      dueDate
    });

    // Log Activity
    const Activity = (await import('@/models/Activity')).default;
    await Activity.create({
      projectId,
      userId: user._id,
      action: `created task "${title}"`
    });

    return NextResponse.json({ success: true, data: task }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
