import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Task from '@/models/Task';
import Project from '@/models/Project';
import { getAuthUser } from '@/lib/auth';

export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const updates = await req.json();

    await connectDB();

    let task = await Task.findById(id);
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Verify user is admin or member of the project
    const project = await Project.findById(task.projectId);
    const isMember = project.members.includes(user._id);
    const isAdmin = project.admin.toString() === user._id.toString();

    if (!isAdmin && !isMember) {
      return NextResponse.json({ error: 'Not authorized to update this task' }, { status: 403 });
    }

    // Members can only update status
    if (isMember && !isAdmin) {
      if (updates.title || updates.description || updates.priority || updates.assignedTo) {
        return NextResponse.json({ error: 'Members can only update task status' }, { status: 403 });
      }
    }

    task = await Task.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true
    }).populate('assignedTo', 'name email');

    // Log Activity if status changed
    if (updates.status) {
      const Activity = (await import('@/models/Activity')).default;
      await Activity.create({
        projectId: task.projectId,
        userId: user._id,
        action: `moved task "${task.title}" to ${updates.status}`
      });
    }

    return NextResponse.json({ success: true, data: task });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
