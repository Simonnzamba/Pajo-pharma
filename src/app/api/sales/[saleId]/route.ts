import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// GET /api/sales/[saleId] - Récupérer une vente spécifique
export async function GET(request: Request, { params }: { params: { saleId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  const saleId = params.saleId;

  if (!saleId) {
    return NextResponse.json({ error: 'ID de vente manquant' }, { status: 400 });
  }

  try {
    const sale = await prisma.sale.findUnique({
      where: { id: saleId },
      include: {
        client: true,
        seller: true,
        items: {
          include: {
            medication: true,
          },
        },
      },
    });

    if (!sale) {
      return NextResponse.json({ error: 'Vente non trouvée' }, { status: 404 });
    }

    return NextResponse.json(sale);
  } catch (error: Error) {
    console.error('Erreur lors de la récupération de la vente (serveur):', error);
    const errorMessage = error.message || 'Erreur interne du serveur';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// PUT /api/sales/[saleId] - Mettre à jour une vente existante
export async function PUT(request: Request, { params }: { params: { saleId: string } }) {
  const session = await getServerSession(authOptions);
  console.log("API PUT /api/sales/[saleId]: Requête reçue.");
  if (session?.user?.role !== 'admin') {
    console.log("API PUT: Non autorisé.");
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  const saleId = params.saleId;
  console.log("API PUT: saleId =", saleId);

  if (!saleId) {
    console.log("API PUT: ID de vente manquant.");
    return NextResponse.json({ error: 'ID de vente manquant' }, { status: 400 });
  }

  try {
    const { clientName, items, totalAmount } = await request.json();
    console.log("API PUT: Données reçues:", { clientName, items, totalAmount });

    if (!items || items.length === 0) {
      console.log("API PUT: Articles de vente vides.");
      return NextResponse.json({ error: 'Les articles de la vente ne peuvent pas être vides' }, { status: 400 });
    }
    if (!clientName) {
      console.log("API PUT: Nom du client requis.");
      return NextResponse.json({ error: 'Le nom du client est requis' }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      console.log("API PUT: Début de la transaction.");
      // 1. Trouver ou créer le client
      let client = await tx.client.findFirst({ where: { name: clientName } });
      if (!client) {
        console.log("API PUT: Client non trouvé, création du client.");
        client = await tx.client.create({ data: { name: clientName } });
      }
      console.log("API PUT: Client ID:", client.id);

      // 2. Récupérer l'ancienne vente pour ajuster le stock
      const oldSale = await tx.sale.findUnique({
        where: { id: saleId },
        include: { items: true },
      });

      if (!oldSale) {
        console.log("API PUT: Ancienne vente non trouvée.");
        throw new Error('Vente non trouvée.');
      }
      console.log("API PUT: Ancienne vente trouvée.");

      // 3. Remettre l'ancien stock
      for (const oldItem of oldSale.items) {
        console.log(`API PUT: Remise en stock de ${oldItem.quantity} de ${oldItem.medicationId}.`);
        await tx.medication.update({
          where: { id: oldItem.medicationId },
          data: { quantity: { increment: oldItem.quantity } },
        });
      }
      console.log("API PUT: Ancien stock remis.");

      // 4. Supprimer les anciens SaleItems
      console.log("API PUT: Suppression des anciens SaleItems.");
      await tx.saleItem.deleteMany({ where: { saleId: saleId } });

      // 5. Créer les nouveaux SaleItems et ajuster le stock
      const newSaleItemsData = [];
      for (const item of items) {
        console.log(`API PUT: Traitement de l'article ${item.id}.`);
        const medication = await tx.medication.findUnique({ where: { id: item.id } });
        if (!medication) {
          console.log(`API PUT: Médicament ${item.id} non trouvé.`);
          throw new Error(`Médicament avec l'ID ${item.id} non trouvé.`);
        }
        if (medication.quantity < item.quantityInCart) {
          console.log(`API PUT: Stock insuffisant pour ${medication.name}.`);
          throw new Error(`Stock insuffisant pour le médicament ${medication.name}. Disponible: ${medication.quantity}, Demandé: ${item.quantityInCart}.`);
        }
        newSaleItemsData.push({
          medicationId: item.id,
          quantity: item.quantityInCart,
          priceAtSale: item.price,
        });
        await tx.medication.update({
          where: { id: item.id },
          data: {
            quantity: { decrement: item.quantityInCart },
          },
        });
        console.log(`API PUT: Stock de ${medication.name} mis à jour.`);
      }
      console.log("API PUT: Nouveaux SaleItems créés et stock ajusté.");

      // 6. Mettre à jour la vente
      console.log("API PUT: Mise à jour de la vente.");
      const updatedSale = await tx.sale.update({
        where: { id: saleId },
        data: {
          clientId: client.id,
          totalAmount: totalAmount,
          items: {
            create: newSaleItemsData,
          },
        },
        include: { items: true },
      });
      console.log("API PUT: Vente mise à jour.", updatedSale.id);

      return updatedSale;
    });

    console.log("API PUT: Transaction terminée avec succès.");
    return NextResponse.json(result, { status: 200 });

  } catch (error: Error) {
    console.error('API PUT: Erreur lors de la mise à jour de la vente (serveur):', error);
    const errorMessage = error.message || 'Erreur interne du serveur';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}