
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// GET /api/sales/seller - Récupérer l'historique des ventes pour le vendeur connecté
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  try {
    const sales = await prisma.sale.findMany({
      where: {
        sellerId: session.user.id,
      },
      include: {
        client: true, // Inclure les informations du client
        items: {
          include: {
            medication: true, // Inclure les informations sur le médicament
          },
        },
      },
      orderBy: {
        date: 'desc', // Trier par date, du plus récent au plus ancien
      },
    });

    return NextResponse.json(sales);
  } catch (error) {
    console.error("Erreur lors de la récupération de l'historique des ventes du vendeur:", error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
