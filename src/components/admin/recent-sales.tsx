
import { prisma } from '@/lib/prisma';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

async function getRecentSales() {
  return await prisma.sale.findMany({
    take: 5,
    orderBy: {
      date: 'desc',
    },
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
}

export async function RecentSales() {
  const sales = await getRecentSales();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ventes Récentes</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-8">
        {sales.map((sale) => (
          <div key={sale.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 p-2 border-b sm:border-b-0 last:border-b-0">
            <Avatar className="hidden sm:flex h-9 w-9">
              <AvatarFallback>{sale.client.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="grid gap-1 flex-1">
              <p className="text-sm font-medium leading-none truncate">{sale.client.name}</p>
              <p className="text-xs text-muted-foreground truncate">Vendu par {sale.seller.username}</p>
              <div className="text-xs text-muted-foreground flex flex-wrap gap-1">
                {sale.items.map((item) => (
                  <span key={item.id} className="whitespace-nowrap">
                    {item.medication.name} (x{item.quantity})
                  </span>
                ))}
              </div>
            </div>
            <div className="ml-auto font-medium text-sm sm:text-base whitespace-nowrap">+{formatCurrency(sale.totalAmount)}</div>
            <Link href={`/invoice/${sale.id}`} passHref>
              <Button variant="outline" size="sm" className="w-full sm:w-auto">Voir la facture</Button>
            </Link>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
