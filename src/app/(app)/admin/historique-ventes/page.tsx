"use client";

import { useEffect, useState } from "react";
import { getAllSales } from "@/lib/actions/sales";
import { Sale, SaleItem, User, Client, Medication } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";

interface SaleWithDetails extends Sale {
  seller: User;
  client: Client;
  items: (SaleItem & { medication: Medication })[];
}

export default function HistoriqueVentesPage() {
  const [sales, setSales] = useState<SaleWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const fetchedSales = await getAllSales();
        setSales(fetchedSales as SaleWithDetails[]);
      } catch (err) {
        console.error("Failed to fetch sales:", err);
        setError("Erreur lors du chargement de l&apos;historique des ventes.");
      } finally {
        setLoading(false);
      }
    };
    fetchSales();
  }, []);

  if (loading) {
    return <div className="p-4">Chargement de l&apos;historique des ventes...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Historique des Ventes</h1>

      <Card>
        <CardHeader>
          <CardTitle>Toutes les Ventes</CardTitle>
        </CardHeader>
        <CardContent>
          {sales.length === 0 ? (
            <p>Aucune vente enregistrée pour le moment.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Numéro de Facture</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Vendeur</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead className="text-right">Montant Total</TableHead>
                  <TableHead>Mode de Paiement</TableHead>
                  <TableHead>Médicaments</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell>{sale.id.substring(0, 8)}...</TableCell> {/* Truncate for display */}
                    <TableCell>{new Date(sale.date).toLocaleDateString()}</TableCell>
                    <TableCell>{sale.seller.username}</TableCell>
                    <TableCell>{sale.client.name}</TableCell>
                    <TableCell className="text-right">{formatCurrency(sale.totalAmount)}</TableCell>
                    <TableCell>{sale.paymentMethod}</TableCell>
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
