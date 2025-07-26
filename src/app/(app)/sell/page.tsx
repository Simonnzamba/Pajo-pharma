'use client';

import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { PlusCircle, MinusCircle, Trash2, Printer, Scan } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import React from 'react';
import { formatCurrency } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import BarcodeScanner from '@/components/scanner/barcode-scanner';
import { Label } from '@/components/ui/label';
import PrintableContent from '@/components/invoice/PrintableContent';

interface Medication {
  id: string;
  name: string;
  price: number; // Assuming price is in CDF
  quantity: number; // stock quantity
  barcode: string;
}

interface CartItem {
  medication: Medication;
  quantity: number; // quantity in cart
}

export default function SellPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [medications, setMedications] = useState<Medication[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [clientName, setClientName] = useState('');
  const [amountPaid, setAmountPaid] = useState<number | ''>('');
  const printRef = React.useRef(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  useEffect(() => {
    const fetchMedications = async () => {
      if (searchTerm.length > 2) {
        try {
          const res = await fetch(`/api/medications?search=${searchTerm}`);
          const data = await res.json();
          setMedications(data);
        } catch (error) {
          console.error('Failed to fetch medications:', error);
          toast.error('Erreur lors de la recherche des médicaments.');
        }
      } else {
        setMedications([]);
      }
    };
    fetchMedications();
  }, [searchTerm]);

  const addToCart = useCallback((medication: Medication) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.medication.id === medication.id);
      if (existingItem) {
        if (existingItem.quantity < medication.quantity) {
          return prevCart.map((item) =>
            item.medication.id === medication.id ? { ...item, quantity: item.quantity + 1 } : item
          );
        } else {
          toast.warning(`Stock insuffisant pour ${medication.name}.`);
          return prevCart;
        }
      } else {
        if (medication.quantity > 0) {
          return [...prevCart, { medication, quantity: 1 }];
        } else {
          toast.warning(`${medication.name} est en rupture de stock.`);
          return prevCart;
        }
      }
    });
    setSearchTerm(''); // Clear search after adding to cart
    setMedications([]); // Clear search results
  }, [setCart, setSearchTerm, setMedications]);

  const updateCartQuantity = (medicationId: string, delta: number) => {
    setCart((prevCart) => {
      const updatedCart = prevCart.map((item) => {
        if (item.medication.id === medicationId) {
          const newQuantity = item.quantity + delta;
          if (newQuantity > 0 && newQuantity <= item.medication.quantity) {
            return { ...item, quantity: newQuantity };
          } else if (newQuantity <= 0) {
            return null; // Mark for removal
          } else {
            toast.warning(`Stock insuffisant pour ${item.medication.name}.`);
          }
        }        return item;
      }).filter(Boolean) as CartItem[]; // Filter out nulls
      return updatedCart;
    });
  };

  const removeFromCart = (medicationId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.medication.id !== medicationId));
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.medication.price * item.quantity, 0);
  const changeDue = typeof amountPaid === 'number' ? amountPaid - totalAmount : 0;

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Facture_${Date.now()}`,
    onAfterPrint: () => {
      // Save sale to DB after printing
      saveSale();
    },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any);

  const saveSale = async () => {
    if (cart.length === 0) {
      toast.error('Le panier est vide. Impossible d\'enregistrer la vente.');
      return;
    }

    try {
      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientName: clientName || 'Client Anonyme',
          totalAmount,
          items: cart.map((item) => ({
            medicationId: item.medication.id,
            quantity: item.quantity,
            priceAtSale: item.medication.price,
          })),
        }),
      });

      if (res.ok) {
        toast.success('Vente enregistrée avec succès!');
        setCart([]);
        setClientName('');
        setAmountPaid('');
      } else {
        const data = await res.json();
        toast.error(`Erreur lors de l\'enregistrement de la vente: ${data.message || 'Une erreur est survenue.'}`);
      }
    } catch (error) {
      console.error('Failed to save sale:', error);
      toast.error('Erreur réseau lors de l\'enregistrement de la vente.');
    }
  };

  const onScanSuccess = useCallback(async (decodedText: string) => {
    setIsScannerOpen(false); // Close scanner after successful scan
    try {
      const res = await fetch(`/api/medications?search=${decodedText}`);
      const data = await res.json();
      if (data && data.length > 0) {
        addToCart(data[0]); // Add the first found medication to cart
        toast.success(`Médicament ${data[0].name} ajouté au panier.`);
      } else {
        toast.error('Médicament non trouvé avec ce code-barres.');
      }
    } catch (error) {
      console.error('Error fetching medication by barcode:', error);
      toast.error('Erreur lors de la recherche du médicament par code-barres.');
    }
  }, [addToCart]);

  const onScanError = useCallback(() => {
    // console.warn(`Code Scan Error = ${_errorMessage}`);
  }, []);

  

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-8">Vente Rapide</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-8">
        <div className="lg:col-span-3 flex flex-col gap-4 md:gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Rechercher et Ajouter des Médicaments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mb-4">
                <Input
                  placeholder="Rechercher un médicament (nom ou code-barres)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-grow"
                />
                <Button onClick={() => setIsScannerOpen(true)} variant="outline" size="icon">
                  <Scan className="h-5 w-5" />
                </Button>
              </div>
              {medications.length > 0 && (
                <div className="border rounded-md max-h-60 overflow-y-auto overflow-x-auto">
                  <Table>
                    <TableBody>
                      {medications.map((med) => (
                        <TableRow key={med.id}>
                          <TableCell className="whitespace-nowrap">{med.name}</TableCell>
                          <TableCell className="whitespace-nowrap">
                            {formatCurrency(med.price)}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">{med.quantity} en stock</TableCell>
                          <TableCell className="text-right whitespace-nowrap">
                            <Button size="sm" onClick={() => addToCart(med)}>
                              Ajouter
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Panier</CardTitle>
            </CardHeader>
            <CardContent>
              {cart.length === 0 ? (
                <p className="text-muted-foreground">Le panier est vide.</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="whitespace-nowrap">Médicament</TableHead>
                        <TableHead className="whitespace-nowrap">Prix Unitaire</TableHead>
                        <TableHead className="whitespace-nowrap">Quantité</TableHead>
                        <TableHead className="text-right whitespace-nowrap">Sous-total</TableHead>
                        <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cart.map((item) => (
                        <TableRow key={item.medication.id}>
                          <TableCell className="whitespace-nowrap">{item.medication.name}</TableCell>
                          <TableCell className="whitespace-nowrap">
                            {formatCurrency(item.medication.price)}
                          </TableCell>
                          <TableCell className="flex items-center whitespace-nowrap">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => updateCartQuantity(item.medication.id, -1)}
                            >
                              <MinusCircle className="h-4 w-4" />
                            </Button>
                            <span className="mx-2">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => updateCartQuantity(item.medication.id, 1)}
                            >
                              <PlusCircle className="h-4 w-4" />
                            </Button>
                          </TableCell>
                          <TableCell className="text-right whitespace-nowrap">
                            {formatCurrency(item.medication.price * item.quantity)}
                          </TableCell>
                          <TableCell className="text-right whitespace-nowrap">
                            <Button
                              variant="destructive"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => removeFromCart(item.medication.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
              <div className="flex justify-end items-center mt-4 text-xl font-bold">
                Total: {formatCurrency(totalAmount)}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Finaliser la Vente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Input
                  placeholder="Nom du client (facultatif)"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <Label htmlFor="amountPaid">Montant payé (CDF)</Label>
                <Input
                  id="amountPaid"
                  type="number"
                  placeholder="Montant payé par le client"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(parseFloat(e.target.value) || '')}
                />
              </div>
              <div className="mb-4 text-lg font-semibold">
                Monnaie à rendre: {formatCurrency(changeDue)}
              </div>
              <Button onClick={handlePrint} className="w-full mb-2">
                <Printer className="mr-2 h-4 w-4" /> Générer & Imprimer Facture
              </Button>
              <Button onClick={saveSale} className="w-full" variant="outline">
                Facture Simplifiée (1 clic)
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Barcode Scanner Dialog */}
      <Dialog open={isScannerOpen} onOpenChange={setIsScannerOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Scanner un Code-barres</DialogTitle>
          </DialogHeader>
          <BarcodeScanner onScanSuccess={onScanSuccess} onScanError={onScanError} />
        </DialogContent>
      </Dialog>

      {/* Printable Invoice Component (hidden by default) */}
      {/* <div style={{ display: 'none' }}>
        <PrintableContent ref={printRef} cart={cart} totalAmount={totalAmount} clientName={clientName} />
      </div> */}
    </div>
  );
}