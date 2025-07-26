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

    const users = await prisma.user.findMany();
    const medications = await prisma.medication.findMany();
    const clients = await prisma.client.findMany();
    const sales = await prisma.sale.findMany({
      include: {
        items: true,
      },
    });
    const auditLogs = await prisma.auditLog.findMany();

    const data = {
      users,
      medications,
      clients,
      sales,
      auditLogs,
    };

    return new NextResponse(JSON.stringify(data, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename="pajo_pharma_backup.json"',
      },
    });
  } catch (error) {
    console.error('Error exporting data:', error);
    return NextResponse.json({ message: 'Error exporting data' }, { status: 500 });
  }
}
