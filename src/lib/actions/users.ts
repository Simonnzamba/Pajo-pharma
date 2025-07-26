
'use server';

import { prisma } from '@/lib/prisma';
import { User } from '@prisma/client';
import bcrypt from 'bcryptjs';

interface UpdateUserInput extends Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>> {
  password?: string; // Allow password to be passed for hashing
  passwordHash?: string; // Allow passwordHash to be set directly
}

export async function getUsers() {
  return await prisma.user.findMany();
}

export async function createUser(data: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'passwordHash'> & { password: string }) {
  const { password, ...rest } = data;
  const passwordHash = await bcrypt.hash(password, 10);
  return await prisma.user.create({
    data: {
      ...rest,
      passwordHash,
    },
  });
}

export async function updateUser(id: string, data: UpdateUserInput) {
  const finalUpdateData = { ...data };

  if (finalUpdateData.password) {
    finalUpdateData.passwordHash = await bcrypt.hash(finalUpdateData.password, 10);
    delete finalUpdateData.password;
  }

  return await prisma.user.update({
    where: { id },
    data: finalUpdateData,
  });
}

export async function deleteUser(id: string) {
  return await prisma.user.delete({
    where: { id },
  });
}
