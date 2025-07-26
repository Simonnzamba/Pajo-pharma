'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface AvailableProduct {
  id: string;
  name: string;
  price: number;
  quantity: number;
  expirationDate: string;
}

export default function AvailableProductsPage() {
  const [availableProducts, setAvailableProducts] = useState<AvailableProduct[]>([]);

  useEffect(() => {
    fetch('/api/stock')
      .then(res => res.json())
      .then(data => setAvailableProducts(data.filter((item: { isAvailableForSale: boolean }) => item.isAvailableForSale)));
  }, []);

  const handleRemoveFromSale = async (id: string) => {
    const response = await fetch(`/api/stock/${id}`,
     {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isAvailableForSale: false }),
    });
    if (response.ok) {
      setAvailableProducts(availableProducts.filter(p => p.id !== id));
    }
  };

  const getExpirationStatus = (date: string) => {
    const expiration = new Date(date);
    const today = new Date();
    const diffTime = expiration.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return <Badge variant="destructive">Expiré</Badge>;
    if (diffDays <= 30) return <Badge variant="secondary">Proche de l&apos;expiration</Badge>;
    return <Badge>Valide</Badge>;
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Produits Disponibles à la Vente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap">Nom</TableHead>
                  <TableHead className="whitespace-nowrap">Prix de Vente</TableHead>
                  <TableHead className="whitespace-nowrap">Stock Restant</TableHead>
                  <TableHead className="whitespace-nowrap">Statut d&apos;Expiration</TableHead>
                  <TableHead className="whitespace-nowrap">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {availableProducts.map(product => (
                  <TableRow key={product.id}>
                    <TableCell className="whitespace-nowrap">{product.name}</TableCell>
                    <TableCell className="whitespace-nowrap">{product.price} CDF</TableCell>
                    <TableCell className="whitespace-nowrap">{product.quantity}</TableCell>
                    <TableCell className="whitespace-nowrap">{getExpirationStatus(product.expirationDate)}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      <Button variant="outline" onClick={() => handleRemoveFromSale(product.id)} size="sm">
                        Retirer du stock
                      </Button>
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
