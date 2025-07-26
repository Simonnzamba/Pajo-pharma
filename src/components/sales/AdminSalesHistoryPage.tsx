
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Sale, SaleItem, Medication, Client, User } from '@prisma/client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

type SaleWithDetails = Sale & {
  client: Client;
  items: (SaleItem & { medication: Medication })[];
  seller: User;
};

export default function AdminSalesHistoryPage() {
  const [sales, setSales] = useState<SaleWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/sales') // Cette API devra être modifiée pour récupérer toutes les ventes
      .then(res => res.json())
      .then(data => {
        setSales(data);
        setIsLoading(false);
      })
      .catch(error => {
        console.error("Erreur de chargement de l'historique des ventes:", error);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return <p>Chargement de l'historique des ventes...</p>;
  }

  if (sales.length === 0) {
    return <p>Aucune vente n'a été enregistrée pour le moment.</p>;
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Historique de Toutes les Ventes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Vendeur</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Montant Total</TableHead>
                <TableHead>Mode de Paiement</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.map(sale => (
                <TableRow key={sale.id}>
                  <TableCell>{formatDate(sale.date)}</TableCell>
                  <TableCell>{sale.seller.username}</TableCell>
                  <TableCell>{sale.client.name}</TableCell>
                  <TableCell>{formatCurrency(sale.totalAmount)}</TableCell>
                  <TableCell><Badge>{sale.paymentMethod}</Badge></TableCell>
                  <TableCell>
                    <Link href={`/admin/edit-invoice/${sale.id}`} passHref>
                      <Button variant="outline" size="sm">Modifier la facture</Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
