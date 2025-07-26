import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const stockItems = await prisma.medication.findMany();
    return NextResponse.json(stockItems);
  } catch (error: unknown) {
    let errorMessage = 'Une erreur inconnue est survenue';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: `Erreur lors de la récupération du stock: ${errorMessage}` }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const newStockItem = await prisma.medication.create({ data });
    return NextResponse.json(newStockItem, { status: 201 });
  } catch (error: unknown) {
    let errorMessage = 'Une erreur inconnue est survenue';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: `Erreur lors de la création du produit: ${errorMessage}` }, { status: 500 });
  }
}
