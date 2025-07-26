import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    const thresholdDays = 90; // Medications not sold for 90 days
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - thresholdDays);

    const medications = await prisma.medication.findMany({
      include: {
        saleItems: {
          orderBy: {
            sale: {
              date: 'desc',
            },
          },
          take: 1,
          select: {
            sale: {
              select: { date: true },
            },
          },
        },
      },
    });

    const staleMedications = medications.filter((medication) => {
      if (medication.saleItems.length === 0) {
        // Never sold, consider it stale if it's older than threshold
        return medication.createdAt < thresholdDate;
      } else {
        const lastSaleDate = medication.saleItems[0].sale.date;
        return lastSaleDate < thresholdDate;
      }
    });

    return NextResponse.json(staleMedications);
  } catch (error) {
    console.error('Error fetching stale medications:', error);
    return NextResponse.json(
      { message: 'Error fetching stale medications' },
      { status: 500 }
    );
  }
}
