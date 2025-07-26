'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { toast } from 'sonner';

interface ReorderSuggestion {
  id: string;
  name: string;
  currentQuantity: number;
  dailyAverageSold: number;
  suggestedOrderQuantity: number;
  reason: string;
}

export function ReorderSuggestions() {
  const [suggestions, setSuggestions] = useState<ReorderSuggestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const res = await fetch('/api/medications/reorder-suggestions');
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data);
        } else {
          toast.error('Erreur lors du chargement des suggestions de réapprovisionnement.');
        }
      } catch (error) {
        console.error('Failed to fetch reorder suggestions:', error);
        toast.error('Erreur réseau lors du chargement des suggestions de réapprovisionnement.');
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, []);

  if (loading) {
    return <p>Chargement des suggestions de réapprovisionnement...</p>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Suggestions de Réapprovisionnement</CardTitle>
      </CardHeader>
      <CardContent>
        {suggestions.length === 0 ? (
          <p>Aucune suggestion de réapprovisionnement pour le moment.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap">Médicament</TableHead>
                  <TableHead className="whitespace-nowrap">Stock Actuel</TableHead>
                  <TableHead className="whitespace-nowrap">Ventes Moy. Jour.</TableHead>
                  <TableHead className="whitespace-nowrap">Quantité Suggérée</TableHead>
                  <TableHead className="whitespace-nowrap">Raison</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suggestions.map((suggestion) => (
                  <TableRow key={suggestion.id}>
                    <TableCell className="whitespace-nowrap">{suggestion.name}</TableCell>
                    <TableCell className="whitespace-nowrap">{suggestion.currentQuantity}</TableCell>
                    <TableCell className="whitespace-nowrap">{suggestion.dailyAverageSold}</TableCell>
                    <TableCell className="whitespace-nowrap">{suggestion.suggestedOrderQuantity}</TableCell>
                    <TableCell className="whitespace-nowrap">{suggestion.reason}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
