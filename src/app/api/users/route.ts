import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== 'admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
  }

  try {
    const users = await prisma.user.findMany({
      select: { id: true, username: true, role: true },
    });
    return NextResponse.json(users, { status: 200 });
  } catch (error: unknown) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ message: 'Erreur lors de la récupération des utilisateurs.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== 'admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
  }

  const { username, password, role } = await req.json();

  if (!username || !password || !role) {
    return NextResponse.json({ message: 'Nom d\'utilisateur, mot de passe et rôle sont requis.' }, { status: 400 });
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser) {
      return NextResponse.json({ message: 'Le nom d\'utilisateur existe déjà.' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        username,
        passwordHash,
        role,
      },
    });
    return NextResponse.json(newUser, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating user:', error);
    return NextResponse.json({ message: 'Erreur lors de la création de l\'utilisateur.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== 'admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
  }

  const { searchParams } = req.nextUrl;
  const id = searchParams.get('id');
  const { username, password, role } = await req.json();

  if (!id) {
    return NextResponse.json({ message: 'ID de l\'utilisateur manquant.' }, { status: 400 });
  }

  if (!username || !role) {
    return NextResponse.json({ message: 'Nom d\'utilisateur et rôle sont requis.' }, { status: 400 });
  }

  try {
    const dataToUpdate: { username: string; role: string; passwordHash?: string } = { username, role };
    if (password) {
      dataToUpdate.passwordHash = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: dataToUpdate,
    });
    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error: unknown) {
    console.error('Error updating user:', error);
    return NextResponse.json({ message: 'Erreur lors de la mise à jour de l\'utilisateur.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== 'admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
  }

  const { searchParams } = req.nextUrl;
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ message: 'ID de l\'utilisateur manquant.' }, { status: 400 });
  }

  try {
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ message: 'Utilisateur supprimé avec succès.' }, { status: 200 });
  } catch (error: unknown) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ message: 'Erreur lors de la suppression de l\'utilisateur.' }, { status: 500 });
  }
}