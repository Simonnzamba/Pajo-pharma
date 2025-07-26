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

    const medications = await prisma.medication.findMany({
      include: {
        saleItems: {
          where: {
            sale: {
              date: {
                gte: new Date(new Date().setDate(new Date().getDate() - 30)), // Last 30 days
              },
            },
          },
          select: {
            quantity: true,
          },
        },
      },
    });

    const reorderSuggestions = medications
      .map((medication) => {
        const totalSoldLast30Days = medication.saleItems.reduce(
          (sum, item) => sum + item.quantity,
          0
        );
        const dailyAverageSold = totalSoldLast30Days / 30;

        // Suggest reorder if current quantity is less than 7 days of average sales
        const reorderThreshold = dailyAverageSold * 7;

        if (medication.quantity < reorderThreshold) {
          const suggestedOrderQuantity = Math.ceil(reorderThreshold * 2 - medication.quantity); // Order enough for 2 weeks
          return {
            id: medication.id,
            name: medication.name,
            currentQuantity: medication.quantity,
            dailyAverageSold: parseFloat(dailyAverageSold.toFixed(2)),
            suggestedOrderQuantity: suggestedOrderQuantity > 0 ? suggestedOrderQuantity : 1,
            reason: `Stock faible (moins de 7 jours de ventes moyennes). Ventes moyennes journalières: ${dailyAverageSold.toFixed(2)}`,
          };
        }
        return null;
      })
      .filter(Boolean);

    return NextResponse.json(reorderSuggestions);
  } catch (error) {
    console.error('Error fetching reorder suggestions:', error);
    return NextResponse.json(
      { message: 'Error fetching reorder suggestions' },
      { status: 500 }
    );
  }
}
