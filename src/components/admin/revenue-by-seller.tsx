
import { prisma } from '@/lib/prisma';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';

async function getRevenueBySeller() {
  const result = await prisma.sale.groupBy({
    by: ['sellerId'],
    _sum: {
      totalAmount: true,
    },
    orderBy: {
      _sum: {
        totalAmount: 'desc',
      },
    },
  });

  const users = await prisma.user.findMany({
    where: {
      id: {
        in: result.map((item) => item.sellerId),
      },
    },
  });

  return result.map((item) => ({
    ...item,
    seller: users.find((u) => u.id === item.sellerId),
  }));
}

export async function RevenueBySeller() {
  const revenue = await getRevenueBySeller();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recettes par Vendeur</CardTitle>
      </CardHeader>
      <CardContent>
        {revenue.map((item) => (
          <div key={item.sellerId} className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 border-b last:border-b-0">
            <span className="font-medium truncate">{item.seller?.username}</span>
            <span className="text-sm text-gray-600 whitespace-nowrap">{formatCurrency(item._sum.totalAmount || 0)}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
