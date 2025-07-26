import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const searchParams = req.nextUrl.searchParams;
  const searchTerm = searchParams.get('search');
  const id = searchParams.get('id');

  if (id) {
    try {
      const medication = await prisma.medication.findUnique({ where: { id } });
      if (medication) {
        return NextResponse.json(medication, { status: 200 });
      } else {
        return NextResponse.json({ message: 'Médicament non trouvé.' }, { status: 404 });
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Error fetching single medication:', error);
      return NextResponse.json({ message: 'Erreur lors de la récupération du médicament.' }, { status: 500 });
    }
  }

  try {
    let medications;
    if (searchTerm) {
      medications = await prisma.medication.findMany({
        where: {
          AND: [
            { quantity: { gt: 0 } },
            { isAvailableForSale: true },
            {
              OR: [
                { name: { contains: searchTerm } },
                { barcode: { contains: searchTerm } },
              ],
            },
          ],
        },
        take: 10, // Limit results for search
      });
    } else {
      // If no search term, fetch all medications
      medications = await prisma.medication.findMany({
        where: {
          isAvailableForSale: true,
          quantity: { gt: 0 },
        },
      });
    }
    return NextResponse.json(medications, { status: 200 });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Error fetching medications:', error);
    return NextResponse.json({ message: 'Erreur lors de la récupération des médicaments.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== 'admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
  }

  const { name, price, quantity, expirationDate, barcode, pharmaceuticalForm, purchasePrice } = await req.json();

  if (!name || !price || !quantity || !expirationDate || !pharmaceuticalForm || !purchasePrice) {
    return NextResponse.json({ message: 'Tous les champs requis (nom, prix, quantité, date d\'expiration, forme pharmaceutique, prix d\'achat) sont manquants.' }, { status: 400 });
  }

  try {
    const newMedication = await prisma.medication.create({
      data: {
        name,
        price,
        quantity,
        expirationDate: new Date(expirationDate),
        barcode,
        pharmaceuticalForm,
        purchasePrice,
        isAvailableForSale: false,
      },
    });
    return NextResponse.json(newMedication, { status: 201 });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error.code === 'P2002' && error.meta?.target?.includes('barcode')) {
      return NextResponse.json({ message: 'Le code-barres existe déjà.' }, { status: 409 });
    }
    console.error('Error creating medication:', error);
    return NextResponse.json({ message: 'Erreur lors de la création du médicament.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== 'admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
  }

  const { searchParams } = req.nextUrl;
  const id = searchParams.get('id');
  const { name, price, quantity, expirationDate, barcode, pharmaceuticalForm, purchasePrice } = await req.json();

  if (!id) {
    return NextResponse.json({ message: 'ID du médicament manquant.' }, { status: 400 });
  }

  if (!name || !price || !quantity || !expirationDate || !pharmaceuticalForm || !purchasePrice) {
    return NextResponse.json({ message: 'Tous les champs requis (nom, prix, quantité, date d\'expiration, forme pharmaceutique, prix d\'achat) sont manquants.' }, { status: 400 });
  }

  try {
    const updatedMedication = await prisma.medication.update({
      where: { id },
      data: {
        name,
        price,
        quantity,
        expirationDate: new Date(expirationDate),
        barcode,
        pharmaceuticalForm,
        purchasePrice,
      },
    });
    return NextResponse.json(updatedMedication, { status: 200 });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error.code === 'P2002' && error.meta?.target?.includes('barcode')) {
      return NextResponse.json({ message: 'Le code-barres existe déjà.' }, { status: 409 });
    }
    console.error('Error updating medication:', error);
    return NextResponse.json({ message: 'Erreur lors de la mise à jour du médicament.' }, { status: 500 });
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
    return NextResponse.json({ message: 'ID du médicament manquant.' }, { status: 400 });
  }

  try {
    await prisma.medication.delete({ where: { id } });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Error deleting medication:', error);
    return NextResponse.json({ message: 'Erreur lors de la suppression du médicament.' }, { status: 500 });
  }
}