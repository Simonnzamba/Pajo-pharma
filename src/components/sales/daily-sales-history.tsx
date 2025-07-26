
'use client';

import { useEffect, useState } from 'react';
import { getDailySales } from '@/lib/actions/sales';
import { Sale, Client, SaleItem, Medication } from '@prisma/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface SaleWithDetails extends Sale {
  client: Client;
  items: (SaleItem & { medication: Medication })[];
}

export function DailySalesHistory() {
  const [sales, setSales] = useState<SaleWithDetails[]>([]);

  useEffect(() => {
    const fetchSales = async () => {
      const data = await getDailySales();
      setSales(data as SaleWithDetails[]);
    };
    fetchSales();
  }, []);

  return (
    <div className="p-4 border rounded-lg mt-4">
      <h2 className="text-xl font-bold mb-4">Historique des ventes du jour</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Client</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Médicaments</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sales.map((sale) => (
            <TableRow key={sale.id}>
              <TableCell>{sale.client.name}</TableCell>
              <TableCell>{sale.totalAmount.toFixed(2)} €</TableCell>
              <TableCell>{new Date(sale.date).toLocaleTimeString()}</TableCell>
              <TableCell>
                {sale.items && sale.items.map((item) => (
                  <div key={item.id}>
                    {item.medication.name} (x{item.quantity})
                  </div>
                ))}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
