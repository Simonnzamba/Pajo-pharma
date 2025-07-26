
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Sale, SaleItem, Medication, Client, InvoiceSettings } from '@prisma/client';
import { Invoice } from './invoice';
import { Button } from '@/components/ui/button';
import { useReactToPrint } from 'react-to-print';
import { useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type SaleWithDetails = Sale & {
  client: Client;
  items: (SaleItem & { medication: Medication })[];
};

export default function EditInvoicePage() {
  const params = useParams();
  const { saleId } = params;
  const [sale, setSale] = useState<SaleWithDetails | null>(null);
  const [settings, setSettings] = useState<InvoiceSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const componentRef = useRef<HTMLDivElement>(null);

  // États pour l'édition
  const [editableClientName, setEditableClientName] = useState('');
  const [editableItems, setEditableItems] = useState<Array<SaleItem & { medication: Medication }>>([]);
  const [editableTotalAmount, setEditableTotalAmount] = useState(0);

  useEffect(() => {
    if (saleId) {
      const fetchSaleData = fetch(`/api/sales/${saleId}`).then(res => res.json());
      const fetchSettingsData = fetch('/api/invoice-settings').then(res => res.json());

      Promise.all([fetchSaleData, fetchSettingsData])
        .then(([saleData, settingsData]) => {
          if (saleData.error) {
            console.error(saleData.error);
          } else {
            setSale(saleData);
            setEditableClientName(saleData.client.name);
            setEditableItems(saleData.items);
            setEditableTotalAmount(saleData.totalAmount);
          }
          if (settingsData.error) {
            console.error(settingsData.error);
          } else {
            setSettings(settingsData);
          }
        })
        .catch(err => console.error("Erreur de chargement des données:", err))
        .finally(() => setIsLoading(false));
    }
  }, [saleId]);

  const handlePrint = () => {
    window.print();
  };

  const handleUpdateSale = async () => {
    console.log("handleUpdateSale: Fonction appelée.");
    console.log("handleUpdateSale: saleId =", saleId);
    if (!saleId) {
      console.error("handleUpdateSale: saleId est indéfini ou nul. Impossible de procéder à la mise à jour.");
      toast.error("ID de la facture manquant. Impossible de mettre à jour.");
      setIsSaving(false);
      return;
    }
    setIsSaving(true);
    try {
      console.log("handleUpdateSale: Construction de l'URL de l'API:", `/api/sales/${saleId}`);
      console.log("handleUpdateSale: Envoi des données de mise à jour à l'API:", {
        clientName: editableClientName,
        items: editableItems.map(item => ({
          id: item.medicationId, // ID du médicament
          quantityInCart: item.quantity,
          price: item.priceAtSale,
        })),
        totalAmount: editableTotalAmount,
      });
      const response = await fetch(`/api/sales/${saleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: editableClientName,
          items: editableItems.map(item => ({
            id: item.medicationId, // ID du médicament
            quantityInCart: item.quantity,
            price: item.priceAtSale,
          })),
          totalAmount: editableTotalAmount,
        }),
      });

      console.log("handleUpdateSale: Réponse de l'API reçue:", response.status, response.statusText);
      console.log("handleUpdateSale: Raw response object:", response);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("handleUpdateSale: Erreur de l'API lors de la mise à jour:", errorData);
        throw new Error(errorData.error || 'Une erreur est survenue lors de la mise à jour.');
      }

      toast.success('Facture mise à jour avec succès!');
      console.log("handleUpdateSale: Facture mise à jour, tentative d'impression...");

      handlePrint(); // Relancer l'impression après mise à jour
      console.log("handleUpdateSale: Impression lancée.");

    } catch (error: Error) {
      console.error("handleUpdateSale: Erreur dans handleUpdateSale:", error);
      toast.error(error.message || 'Une erreur inattendue est survenue.');
    } finally {
      setIsSaving(false);
      console.log("handleUpdateSale: Fin de handleUpdateSale.");
    }
  };

  const handleItemQuantityChange = (itemId: string, newQuantity: number) => {
    setEditableItems(prevItems => {
      const updatedItems = prevItems.map(item =>
        item.medicationId === itemId ? { ...item, quantity: newQuantity } : item
      );
      // Recalculer le total après modification de la quantité
      const newTotal = updatedItems.reduce((acc, item) => acc + (item.quantity * item.priceAtSale), 0);
      setEditableTotalAmount(newTotal);
      return updatedItems;
    });
  };

  const handleItemPriceChange = (itemId: string, newPrice: number) => {
    setEditableItems(prevItems => {
      const updatedItems = prevItems.map(item =>
        item.medicationId === itemId ? { ...item, priceAtSale: newPrice } : item
      );
      // Recalculer le total après modification du prix
      const newTotal = updatedItems.reduce((acc, item) => acc + (item.quantity * item.priceAtSale), 0);
      setEditableTotalAmount(newTotal);
      return updatedItems;
    });
  };

  if (isLoading) {
    return <p>Chargement de la facture pour édition...</p>;
  }

  if (!sale || !settings) {
    return <p>Impossible de charger les informations de la facture.</p>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Modifier la Facture #{sale.id.slice(0, 8)}</h1>
      
      <div className="mb-4">
        <Label htmlFor="clientName">Nom du client</Label>
        <Input
          id="clientName"
          value={editableClientName}
          onChange={(e) => setEditableClientName(e.target.value)}
        />
      </div>

      <h2 className="text-xl font-semibold mb-2">Articles de la vente</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Médicament</TableHead>
            <TableHead>Quantité</TableHead>
            <TableHead>Prix Unitaire</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {editableItems.map((item) => (
            <TableRow key={item.medicationId}>
              <TableCell>{item.medication.name}</TableCell>
              <TableCell>
                <Input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => handleItemQuantityChange(item.medicationId, parseInt(e.target.value) || 0)}
                  className="w-20"
                />
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  value={item.priceAtSale}
                  onChange={(e) => handleItemPriceChange(item.medicationId, parseFloat(e.target.value) || 0)}
                  className="w-24"
                />
              </TableCell>
              <TableCell>{(item.quantity * item.priceAtSale).toLocaleString('fr-FR')} CDF</TableCell>
              <TableCell>
                {/* Ajouter des boutons pour supprimer un article si nécessaire */}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex justify-end mt-4">
        <div className="w-1/3">
          <div className="flex justify-between font-bold text-xl">
            <span>Nouveau Total:</span>
            <span>{editableTotalAmount.toLocaleString('fr-FR')} CDF</span>
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-6 no-print">
        <Button onClick={handleUpdateSale} disabled={isSaving}>
          {isSaving ? 'Mise à jour...' : 'Mettre à jour et Imprimer'}
        </Button>
      </div>

      {/* Version cachée pour l'impression */}
      <div style={{ display: 'none' }}>
        <div ref={componentRef}>
          <Invoice sale={{ ...sale, client: { ...sale.client, name: editableClientName }, items: editableItems, totalAmount: editableTotalAmount }} settings={settings} />
        </div>
      </div>
    </div>
  );
}
