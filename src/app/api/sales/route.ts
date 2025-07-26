import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  const sellerId = session.user.id;

  try {
    const { items, clientName, amountPaid, totalAmount, paymentMethod } = await request.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Le panier est vide' }, { status: 400 });
    }
    if (!clientName) {
      return NextResponse.json({ error: 'Le nom du client est requis' }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Trouver ou créer le client
      let client = await tx.client.findFirst({ where: { name: clientName } });
      if (!client) {
        client = await tx.client.create({ data: { name: clientName } });
      }

      // 2. Créer la vente
      const sale = await tx.sale.create({
        data: {
          totalAmount,
          amountPaid,
          changeDue: amountPaid - totalAmount,
          paymentMethod,
          sellerId,
          clientId: client.id,
          items: {
            create: items.map((item: { id: string; quantityInCart: number; price: number }) => ({
              medicationId: item.id,
              quantity: item.quantityInCart,
              priceAtSale: item.price,
            })),
          },
        },
        include: { items: true },
      });

      // 3. Mettre à jour le stock de médicaments
      for (const item of items) {
        const medication = await tx.medication.findUnique({ where: { id: item.id } });
        if (!medication) {
          throw new Error(`Médicament avec l'ID ${item.id} non trouvé.`);
        }
        if (medication.quantity < item.quantityInCart) {
          throw new Error(`Stock insuffisant pour le médicament ${medication.name}. Disponible: ${medication.quantity}, Demandé: ${item.quantityInCart}.`);
        }
        await tx.medication.update({
          where: { id: item.id },
          data: {
            quantity: { decrement: item.quantityInCart },
          },
        });
      }

      return sale;
    });

    return NextResponse.json(result, { status: 201 });

  } catch (error: unknown) {
    console.error('Erreur lors de la création de la vente (serveur):', error);
    let errorMessage = 'Erreur interne du serveur';
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
