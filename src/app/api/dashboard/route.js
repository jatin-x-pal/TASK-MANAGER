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

    // Recent Tasks for the "Today Tasks" section
    const recentTasks = await Task.find({ 
      projectId: { $in: projectIds },
      status: { $in: ['To Do', 'In Progress'] }
    })
    .sort({ updatedAt: -1 })
    .limit(2);

    // Weekly Productivity Breakdown (Last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const completedTasks = await Task.find({
      projectId: { $in: projectIds },
      status: 'Done',
      updatedAt: { $gte: sevenDaysAgo }
    });

    const categories = ['Work', 'Personal', 'Breaks'];
    const dailyStats = [];
    const dayLabels = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const label = d.toLocaleDateString('en-US', { weekday: 'short' });
      dayLabels.push(label);

      const dayData = { name: label };
      categories.forEach(cat => {
        const count = completedTasks.filter(t => {
          const taskDate = new Date(t.updatedAt);
          return taskDate.toDateString() === d.toDateString() && (t.category || 'Work') === cat;
        }).length;
        dayData[cat.toLowerCase()] = count;
      });
      dailyStats.push(dayData);
    }

    return NextResponse.json({
      success: true,
      data: {
        totalTasks,
        statusCounts: { todo, inProgress, done },
        overdue,
        projectsCount: projects.length,
        recentTasks,
        productivity: {
          chartData: dailyStats,
          score: totalTasks > 0 ? Math.round((done / totalTasks) * 100) : 0
        }
      }
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

