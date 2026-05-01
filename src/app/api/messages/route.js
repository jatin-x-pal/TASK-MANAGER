import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Message from '@/models/Message';
import { getAuthUser } from '@/lib/auth';

export async function GET(req) {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const receiverId = searchParams.get('receiverId');
    const projectId = searchParams.get('projectId');

    await connectDB();

    let query = {};
    if (projectId) {
      query = { projectId };
    } else if (receiverId) {
      query = {
        $or: [
          { senderId: user._id, receiverId: receiverId },
          { senderId: receiverId, receiverId: user._id }
        ]
      };
    } else {
      return NextResponse.json({ data: [] });
    }

    const messages = await Message.find(query)
      .sort({ createdAt: 1 })
      .populate('senderId', 'name email');

    return NextResponse.json({ success: true, data: messages });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { receiverId, projectId, content } = await req.json();
    
    await connectDB();
    const message = await Message.create({
      senderId: user._id,
      receiverId,
      projectId,
      content
    });

    const populated = await Message.findById(message._id).populate('senderId', 'name email');

    return NextResponse.json({ success: true, data: populated }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
