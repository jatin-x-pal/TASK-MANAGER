import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Project from '@/models/Project';
import User from '@/models/User';
import { getAuthUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();

    // Get projects the user is part of
    const projects = await Project.find({
      $or: [{ admin: user._id }, { members: user._id }]
    }).populate('members', 'name email').populate('admin', 'name email');

    // Extract unique users from projects
    const contactSet = new Map();
    projects.forEach(p => {
      if (p.admin._id.toString() !== user._id.toString()) {
        contactSet.set(p.admin._id.toString(), p.admin);
      }
      p.members.forEach(m => {
        if (m._id.toString() !== user._id.toString()) {
          contactSet.set(m._id.toString(), m);
        }
      });
    });

    const contacts = Array.from(contactSet.values());
    const projectChatrooms = projects.map(p => ({
      _id: p._id,
      name: p.name,
      isGroup: true,
      color: p.color
    }));

    return NextResponse.json({ 
      success: true, 
      data: {
        contacts,
        projects: projectChatrooms
      } 
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
