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
    const isMember = project.members.some(m => m.toString() === user._id.toString());
    const isAdmin = project.admin.toString() === user._id.toString();

    if (!isAdmin && !isMember) {
      return NextResponse.json({ error: 'Not authorized to update this task' }, { status: 403 });
    }

    // Permission Logic
    if (!isAdmin) {
      // If not admin, must be the assignee to update status
      const isAssignee = task.assignedTo?.toString() === user._id.toString();
      
      if (!isAssignee) {
        return NextResponse.json({ error: 'Only the assignee or project admin can update this task status' }, { status: 403 });
      }

      // If assignee but not admin, can ONLY update status
      const forbiddenUpdates = ['title', 'description', 'priority', 'assignedTo', 'projectId', 'dueDate'];
      const attemptedForbidden = Object.keys(updates).some(key => forbiddenUpdates.includes(key));
      
      if (attemptedForbidden) {
        return NextResponse.json({ error: 'Only admins can modify task details or reassign tasks' }, { status: 403 });
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
