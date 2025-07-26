'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { toast } from 'sonner';

interface StaleMedication {
  id: string;
  name: string;
  barcode: string;
  createdAt: string;
  // Add other relevant fields if needed
}

export function StaleMedicationsAlert() {
  const [staleMedications, setStaleMedications] = useState<StaleMedication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStaleMedications = async () => {
      try {
        const res = await fetch('/api/medications/stale-medications');
        if (res.ok) {
          const data = await res.json();
          setStaleMedications(data);
        } else {
          toast.error('Erreur lors du chargement des médicaments non vendus.');
        }
      } catch (error) {
        console.error('Failed to fetch stale medications:', error);
        toast.error('Erreur réseau lors du chargement des médicaments non vendus.');
      } finally {
        setLoading(false);
      }
    };

    fetchStaleMedications();
  }, []);

  if (loading) {
    return <p>Chargement des alertes de médicaments non vendus...</p>;
  }

  if (staleMedications.length === 0) {
    return null; // Don&apos;t show the card if there are no stale medications
  }

  return (
    <Card className="border-orange-500">
      <CardHeader>
        <CardTitle className="text-orange-600">Médicaments non vendus (90+ jours)</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-2">Les médicaments suivants n&apos;ont pas été vendus depuis 90 jours ou plus :</p>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-nowrap">Médicament</TableHead>
                <TableHead className="whitespace-nowrap">Code-barres</TableHead>
                <TableHead className="whitespace-nowrap">Date d&apos;ajout</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staleMedications.map((med) => (
                <TableRow key={med.id}>
                  <TableCell className="whitespace-nowrap">{med.name}</TableCell>
                  <TableCell className="whitespace-nowrap">{med.barcode}</TableCell>
                  <TableCell className="whitespace-nowrap">{new Date(med.createdAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
