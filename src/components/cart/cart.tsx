
'use client';

import { useState, useRef } from 'react';
import { useCartStore } from '@/lib/store/cart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';

import { Label } from '@/components/ui/label';
import { useReactToPrint } from 'react-to-print';
import { Invoice } from '@/components/invoice/invoice';
import { Sale, SaleItem, Medication } from '@prisma/client';
import { formatCurrency } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export function Cart() {
  const { items, removeItem, updateItemQuantity } = useCartStore();
  const [clientName, setClientName] = useState('');
  const [lastSale] = useState<(Sale & { items: (SaleItem & { medication: Medication })[]; client: { name: string } }) | null>(null);
  const [amountPaid, setAmountPaid] = useState(0);
  const router = useRouter();

  const invoiceRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    bodyClass: "printable-area",
  });

  const total = items.reduce((acc, item) => acc + item.price * item.quantityInCart, 0);
  const change = amountPaid - total;

  const handleFinalizeSale = () => {
    if (items.length === 0) {
      toast.error('Le panier est vide.');
      return;
    }
    if (!clientName) {
      toast.error('Veuillez saisir le nom du client.');
      return;
    }

    router.push(`/seller/facture?clientName=${encodeURIComponent(clientName)}&amountPaid=${amountPaid}`);
  };

  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-xl font-bold mb-4">Panier</h2>
      <div className="mb-4">
        <Label htmlFor="clientName">Nom du client</Label>
        <Input
          id="clientName"
          placeholder="Nom du client"
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
        />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Médicament</TableHead>
            <TableHead>Quantité</TableHead>
            <TableHead>Prix unitaire</TableHead>
            <TableHead>Prix total</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.name}</TableCell>
              <TableCell>
                <Input
                  type="number"
                  value={item.quantityInCart}
                  onChange={(e) => updateItemQuantity(item.id, parseInt(e.target.value) || 1)}
                  className="w-20"
                />
              </TableCell>
              <TableCell>{formatCurrency(item.price)}</TableCell>
              <TableCell>{formatCurrency(item.price * item.quantityInCart)}</TableCell>
              <TableCell>
                <Button variant="destructive" size="sm" onClick={() => removeItem(item.id)}>
                  Supprimer
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="mt-4 text-right">
        <p className="text-lg font-bold">Total: {formatCurrency(total)}</p>
        <div className="flex justify-end items-center mt-2">
          <Label htmlFor="amountPaid" className="mr-2">Montant payé</Label>
          <Input
            id="amountPaid"
            type="number"
            value={amountPaid}
            onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)}
            className="w-32"
          />
        </div>
        {amountPaid > 0 && (
          <p className="text-lg font-bold mt-2">Monnaie à rendre: {formatCurrency(change)}</p>
        )}
        <Button onClick={handleFinalizeSale} className="mt-2" disabled={items.length === 0 || !clientName}>Finaliser la vente</Button>
        {lastSale && (
          <Button onClick={handlePrint} className="mt-2 ml-2">Imprimer la facture</Button>
        )}
      </div>
      {lastSale && (
        <div style={{ display: 'none' }}>
          <Invoice ref={invoiceRef} sale={lastSale} />
        </div>
      )}
    </div>
  );
}

