'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { toast } from 'sonner';

interface Medication {
  id: string;
  name: string;
  expirationDate: string; // ISO string
}

export function ExpirationCalendar() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMedications = async () => {
      try {
        const res = await fetch('/api/medications'); // Assuming this endpoint returns all medications
        if (res.ok) {
          const data = await res.json();
          setMedications(data);
        } else {
          toast.error('Erreur lors du chargement des médicaments.');
        }
      } catch (error) {
        console.error('Failed to fetch medications:', error);
        toast.error('Erreur réseau lors du chargement des médicaments.');
      } finally {
        setLoading(false);
      }
    };

    fetchMedications();
  }, []);

  const getExpirationStatus = (expirationDate: string) => {
    const today = new Date();
    const expiry = new Date(expirationDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 30) {
      return { status: 'Rouge', className: 'text-red-600 font-bold' };
    } else if (diffDays <= 60) {
      return { status: 'Orange', className: 'text-orange-500 font-bold' };
    } else {
      return { status: 'Vert', className: 'text-green-600' };
    }
  };

  if (loading) {
    return <p>Chargement du calendrier des expirations...</p>;
  }

  const sortedMedications = [...medications].sort((a, b) => {
    return new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime();
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Calendrier des Expirations</CardTitle>
      </CardHeader>
      <CardContent>
        {sortedMedications.length === 0 ? (
          <p>Aucun médicament à afficher dans le calendrier des expirations.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap">Médicament</TableHead>
                  <TableHead className="whitespace-nowrap">Date d&apos;expiration</TableHead>
                  <TableHead className="whitespace-nowrap">Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedMedications.map((med) => {
                  const { status, className } = getExpirationStatus(med.expirationDate);
                  return (
                    <TableRow key={med.id}>
                      <TableCell className="whitespace-nowrap">{med.name}</TableCell>
                      <TableCell className="whitespace-nowrap">{new Date(med.expirationDate).toLocaleDateString()}</TableCell>
                      <TableCell className={className + " whitespace-nowrap"}>{status}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
