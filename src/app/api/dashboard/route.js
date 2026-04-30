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

    // Get all projects for this user
    const projects = await Project.find({
      $or: [{ admin: user._id }, { members: user._id }]
    });

    const projectIds = projects.map(p => p._id);

    // Get all tasks for these projects
    const tasks = await Task.find({ projectId: { $in: projectIds } });

    const totalTasks = tasks.length;
    let todo = 0, inProgress = 0, done = 0, overdue = 0;
    
    const now = new Date();

    tasks.forEach(task => {
      if (task.status === 'To Do') todo++;
      else if (task.status === 'In Progress') inProgress++;
      else if (task.status === 'Done') done++;

      if (task.dueDate && new Date(task.dueDate) < now && task.status !== 'Done') {
        overdue++;
      }
    });

    // We can also calculate tasks per user if needed, but for now we aggregate the basic stats
    return NextResponse.json({
      success: true,
      data: {
        totalTasks,
        statusCounts: { todo, inProgress, done },
        overdue,
        projectsCount: projects.length
      }
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
