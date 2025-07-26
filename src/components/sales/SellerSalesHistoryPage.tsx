
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Sale, SaleItem, Medication, Client } from '@prisma/client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

type SaleWithDetails = Sale & {
  client: Client;
  items: (SaleItem & { medication: Medication })[];
};

export default function SellerSalesHistoryPage() {
  const [sales, setSales] = useState<SaleWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/sales/seller')
      .then(res => res.json())
      .then(data => {
        setSales(data);
        setIsLoading(false);
      })
      .catch(error => {
        console.error("Erreur de chargement de l&apos;historique:", error);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return <p>Chargement de l&apos;historique des ventes...</p>;
  }

  if (sales.length === 0) {
    return <p>Vous n&apos;avez réalisé aucune vente pour le moment.</p>;
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Mon Historique de Ventes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap">Date</TableHead>
                  <TableHead className="whitespace-nowrap">Client</TableHead>
                  <TableHead className="whitespace-nowrap">Montant Total</TableHead>
                  <TableHead className="whitespace-nowrap">Mode de Paiement</TableHead>
                  <TableHead className="whitespace-nowrap">Produits Vendus</TableHead>
                  <TableHead className="whitespace-nowrap">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales.map(sale => (
                  <TableRow key={sale.id}>
                    <TableCell className="whitespace-nowrap">{formatDate(sale.date)}</TableCell>
                    <TableCell className="whitespace-nowrap">{sale.client.name}</TableCell>
                    <TableCell className="whitespace-nowrap">{formatCurrency(sale.totalAmount)}</TableCell>
                    <TableCell className="whitespace-nowrap"><Badge>{sale.paymentMethod}</Badge></TableCell>
                    <TableCell className="whitespace-nowrap">
                      <ul className="list-disc list-inside">
                        {sale.items.map(item => (
                          <li key={item.id}>
                            {item.medication.name} (x{item.quantity})
                          </li>
                        ))}
                      </ul>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <Link href={`/invoice/${sale.id}`} passHref>
                        <Button variant="outline" size="sm">Voir la facture</Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
