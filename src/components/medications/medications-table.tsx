
'use client';

import { useEffect, useState } from 'react';
import { getMedications, createMedication, updateMedication, deleteMedication } from '@/lib/actions/medications';
import { Medication } from '@prisma/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MedicationForm } from './medication-form';

export function MedicationsTable() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null);

  const fetchMedications = async () => {
    const data = await getMedications();
    setMedications(data);
  };

  useEffect(() => {
    fetchMedications();
  }, []);

  const handleFormSubmit = async (data: Omit<Medication, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (selectedMedication) {
      await updateMedication(selectedMedication.id, data);
    } else {
      await createMedication(data);
    }
    fetchMedications();
    setIsDialogOpen(false);
    setSelectedMedication(null);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce médicament ?')) {
      await deleteMedication(id);
      fetchMedications();
    }
  };

  return (
    <div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button onClick={() => setSelectedMedication(null)}>Ajouter un médicament</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedMedication ? 'Modifier le médicament' : 'Ajouter un médicament'}</DialogTitle>
          </DialogHeader>
          <MedicationForm onSubmit={handleFormSubmit} medication={selectedMedication} />
        </DialogContent>
      </Dialog>

      <Table className="mt-4">
        <TableHeader>
          <TableRow>
            <TableHead>Nom</TableHead>
            <TableHead>Prix</TableHead>
            <TableHead>Quantité</TableHead>
            <TableHead>Date d&apos;expiration</TableHead>
            <TableHead>Code-barres</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {medications.map((medication) => (
            <TableRow key={medication.id}>
              <TableCell>{medication.name}</TableCell>
              <TableCell>{medication.price}</TableCell>
              <TableCell>{medication.quantity}</TableCell>
              <TableCell>{new Date(medication.expirationDate).toLocaleDateString()}</TableCell>
              <TableCell>{medication.barcode}</TableCell>
              <TableCell>
                <Button variant="outline" size="sm" onClick={() => { setSelectedMedication(medication); setIsDialogOpen(true); }}>Modifier</Button>
                <Button variant="destructive" size="sm" className="ml-2" onClick={() => handleDelete(medication.id)}>Supprimer</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
