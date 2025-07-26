
'use client';

import { useEffect, useState } from 'react';
import { getAllSales } from '@/lib/actions/sales';
import { Sale, User, Client, SaleItem, Medication } from '@prisma/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function SalesHistory() {
  const [sales, setSales] = useState<(Sale & { seller: User; client: Client; items: (SaleItem & { medication: Medication })[] })[]>([]);

  useEffect(() => {
    const fetchSales = async () => {
      const data = await getAllSales();
      setSales(data as (Sale & { seller: User; client: Client; items: (SaleItem & { medication: Medication })[] })[]);
    };
    fetchSales();
  }, []);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Client</TableHead>
          <TableHead>Vendeur</TableHead>
          <TableHead>Total</TableHead>
          <TableHead>Médicaments</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sales.map((sale) => (
          <TableRow key={sale.id}>
            <TableCell>{new Date(sale.date).toLocaleString()}</TableCell>
            <TableCell>{sale.client.name}</TableCell>
            <TableCell>{sale.seller.username}</TableCell>
            <TableCell>{formatCurrency(sale.totalAmount)}</TableCell>
            <TableCell>
              {sale.items && sale.items.map((item) => (
                <div key={item.id}>
                  {item.medication.name} (x{item.quantity})
                </div>
              ))}
            </TableCell>
            <TableCell>
              <Link href={`/admin/edit-invoice/${sale.id}`} passHref>
                <Button variant="outline" size="sm">Modifier la facture</Button>
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
