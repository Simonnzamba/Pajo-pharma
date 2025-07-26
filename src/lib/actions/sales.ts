
'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import { revalidatePath } from 'next/cache';

interface SaleItemData {
  medicationId: string;
  quantity: number;
  priceAtSale: number;
}

export async function createSale(
  clientName: string,
  totalAmount: number,
  amountPaid: number,
  changeDue: number,
  paymentMethod: string,
  additionalFees: number,
  discount: number,
  remarks: string,
  items: SaleItemData[],
) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Utilisateur non authentifié');
  }

  // Check if a client with this name already exists, otherwise create it
  let client = await prisma.client.findFirst({
    where: { name: clientName },
  });

  if (!client) {
    client = await prisma.client.create({
      data: { name: clientName },
    });
  }

  const sale = await prisma.sale.create({
    data: {
      totalAmount: totalAmount,
      sellerId: user.id,
      clientId: client.id,
      amountPaid: amountPaid,
      changeDue: changeDue,
      paymentMethod: paymentMethod,
      additionalFees: additionalFees,
      discount: discount,
      remarks: remarks,
      items: {
        create: items.map((item) => ({
          medicationId: item.medicationId,
          quantity: item.quantity,
          priceAtSale: item.priceAtSale,
        })),
      },
    },
    include: {
      items: {
        include: {
          medication: true,
        },
      },
      client: true,
    },
  });

  // Update stock
  for (const item of items) {
    await prisma.medication.update({
      where: { id: item.medicationId },
      data: { quantity: { decrement: item.quantity } },
    });
  }

  revalidatePath('/admin-dashboard');
  revalidatePath('/admin/historique-ventes');

  return sale;
}

export async function getAllSales() {
  return await prisma.sale.findMany({
    orderBy: {
      date: 'desc',
    },
    include: {
      seller: true,
      client: true,
      items: {
        include: {
          medication: true,
        },
      },
    },
  });
}

export async function getDailySales() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return await prisma.sale.findMany({
    where: {
      date: {
        gte: today,
        lt: tomorrow,
      },
    },
    orderBy: {
      date: 'desc',
    },
    include: {
      seller: true,
      client: true,
      items: {
        include: {
          medication: true,
        },
      },
    },
  });
}

export async function getSalesBySeller(sellerId: string) {
  return await prisma.sale.findMany({
    where: {
      sellerId: sellerId,
    },
    orderBy: {
      date: 'desc',
    },
    include: {
      seller: true,
      client: true,
    },
  });
}
