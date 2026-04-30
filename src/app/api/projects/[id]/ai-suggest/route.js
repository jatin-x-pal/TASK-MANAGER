import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
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
    const project = await Project.findById(id);

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const isAdmin = project.admin.toString() === user._id.toString();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Only admins can get AI suggestions' }, { status: 403 });
    }

    // Mock AI Logic based on project name
    const projectName = project.name.toLowerCase();
    let suggestions = [];

    if (projectName.includes('website') || projectName.includes('app') || projectName.includes('design')) {
      suggestions = [
        { title: 'Create initial wireframes', description: 'Draft the layout for the main pages.', priority: 'High' },
        { title: 'Setup GitHub Repository', description: 'Initialize project and invite team members.', priority: 'Medium' },
        { title: 'Define color palette & typography', description: 'Choose the brand guidelines.', priority: 'Low' }
      ];
    } else if (projectName.includes('marketing') || projectName.includes('campaign')) {
      suggestions = [
        { title: 'Draft social media copy', description: 'Write posts for Twitter and LinkedIn.', priority: 'High' },
        { title: 'Identify target audience', description: 'Create user personas for the campaign.', priority: 'Medium' },
        { title: 'Set up ad tracking', description: 'Implement pixels on the landing page.', priority: 'High' }
      ];
    } else {
      suggestions = [
        { title: 'Kickoff meeting', description: 'Discuss goals and timeline with the team.', priority: 'High' },
        { title: 'Research competitors', description: 'Analyze what similar projects are doing.', priority: 'Medium' },
        { title: 'Draft initial documentation', description: 'Create a README or PRD.', priority: 'Low' }
      ];
    }

    // Add a slight delay to simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 1500));

    return NextResponse.json({ success: true, data: suggestions });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
