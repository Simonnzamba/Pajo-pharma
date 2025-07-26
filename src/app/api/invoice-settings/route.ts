
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// GET /api/invoice-settings - Récupérer les paramètres de la facture
export async function GET() {
  const session = await getServerSession(authOptions);
  // Autoriser les admins ET les vendeurs à lire les paramètres
  if (session?.user?.role !== 'admin' && session?.user?.role !== 'seller') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  try {
    let settings = await prisma.invoiceSettings.findFirst();
    if (!settings) {
      // Créer des paramètres par défaut s'ils n'existent pas
      settings = await prisma.invoiceSettings.create({
        data: {
          companyName: 'PAJO PHARMA',
          companyAddress: 'Votre adresse',
          companyPhone: '+243000000000',
          companyEmail: 'contact@pajopharma.com',
          headerText: 'Facture Médicale',
          footerText: 'Merci pour votre confiance.',
        },
      });
    }
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Erreur lors de la récupération des paramètres de facture:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

// PUT /api/invoice-settings - Mettre à jour les paramètres de la facture
export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  try {
    const data = await request.json();
    const settings = await prisma.invoiceSettings.findFirst();

    if (!settings) {
      return NextResponse.json({ error: 'Paramètres non trouvés' }, { status: 404 });
    }

    const updatedSettings = await prisma.invoiceSettings.update({
      where: { id: settings.id },
      data,
    });

    return NextResponse.json(updatedSettings);
  } catch (error) {
    console.error('Erreur lors de la mise à jour des paramètres de facture:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
