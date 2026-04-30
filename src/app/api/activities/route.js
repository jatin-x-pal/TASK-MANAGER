import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Activity from '@/models/Activity';
import Project from '@/models/Project';
import { getAuthUser } from '@/lib/auth';

export async function GET(req) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');

    await connectDB();

    let filter = {};
    if (projectId) {
      // Check project access
      const project = await Project.findById(projectId);
      if (!project || (!project.members.some(m => m.toString() === user._id.toString()) && project.admin.toString() !== user._id.toString())) {
        return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
      }
      filter = { projectId };
    } else {
      // Get all projects for user
      const projects = await Project.find({
        $or: [{ admin: user._id }, { members: user._id }]
      });
      filter = { projectId: { $in: projects.map(p => p._id) } };
    }

    const activities = await Activity.find(filter)
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('userId', 'name email')
      .populate('projectId', 'name');

    return NextResponse.json({ success: true, data: activities });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
