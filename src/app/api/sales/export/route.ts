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

    const sales = await prisma.sale.findMany({
      include: {
        seller: { select: { username: true } },
        client: { select: { name: true } },
        items: {
          include: { medication: { select: { name: true, barcode: true } } },
        },
      },
    });
    let csv = 'ID Vente,Date,Montant Total,Vendeur,Client,Médicament,Code-barres,Quantité,Prix à la vente\n';
    sales.forEach((sale) => {
      const saleDate = new Date(sale.date).toLocaleDateString();
      const saleTime = new Date(sale.date).toLocaleTimeString();
      const baseRow = `"${sale.id}","${saleDate} ${saleTime}","${sale.totalAmount}","${sale.seller.username}","${sale.client.name}"`;
      if (sale.items.length === 0) {
        csv += `${baseRow},,,,
`;
      } else {
        sale.items.forEach((item) => {
          csv += `${baseRow},"${item.medication.name}","${item.medication.barcode}","${item.quantity}","${item.priceAtSale}"\n`;
        });
      }
    });
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="sales_report.csv"',
      },
    });
  } catch (error) {
    console.error('Error exporting sales:', error);
    return NextResponse.json({ message: 'Error exporting sales' }, { status: 500 });
  }
}