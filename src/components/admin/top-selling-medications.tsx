
import { prisma } from '@/lib/prisma';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

async function getTopSellingMedications() {
  const result = await prisma.saleItem.groupBy({
    by: ['medicationId'],
    _sum: {
      quantity: true,
    },
    orderBy: {
      _sum: {
        quantity: 'desc',
      },
    },
    take: 5,
  });

  const medications = await prisma.medication.findMany({
    where: {
      id: {
        in: result.map((item) => item.medicationId),
      },
    },
  });

  return result.map((item) => ({
    ...item,
    medication: medications.find((m) => m.id === item.medicationId),
  }));
}

export async function TopSellingMedications() {
  const medications = await getTopSellingMedications();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Médicaments les Plus Vendus</CardTitle>
      </CardHeader>
      <CardContent>
        {medications.map((item) => (
          <div key={item.medicationId} className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 border-b last:border-b-0">
            <span className="font-medium truncate">{item.medication?.name}</span>
            <span className="text-sm text-gray-600 whitespace-nowrap">{item._sum.quantity} unités</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
