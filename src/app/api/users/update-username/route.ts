import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id, username } = await request.json();

    if (!id || !username) {
      return NextResponse.json({ message: 'Missing user ID or username' }, { status: 400 });
    }

    // Allow user to update their own profile, or admin to update any profile
    if (session.user?.id !== id && session.user?.role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { username },
    });

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error('Error updating username:', error);
    return NextResponse.json({ message: 'Error updating username' }, { status: 500 });
  }
}