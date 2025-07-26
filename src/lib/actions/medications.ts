
'use server';

import { prisma } from '@/lib/prisma';
import { Medication } from '@prisma/client';

// Récupère uniquement les médicaments disponibles à la vente
export async function getMedications() {
  return await prisma.medication.findMany({
    where: { isAvailableForSale: true },
  });
}

// Récupère TOUS les médicaments (pour l'administration)
export async function getAllMedications() {
  return await prisma.medication.findMany();
}

export async function createMedication(data: Omit<Medication, 'id' | 'createdAt' | 'updatedAt'>) {
  return await prisma.medication.create({ data });
}

export async function updateMedication(id: string, data: Omit<Medication, 'id' | 'createdAt' | 'updatedAt'>) {
  return await prisma.medication.update({ where: { id }, data });
}

export async function deleteMedication(id: string) {
  return await prisma.medication.delete({ where: { id } });
}
