'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Edit, Trash2, Package, ShoppingCart } from 'lucide-react';

const stockItemSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  pharmaceuticalForm: z.string().min(1, 'La forme est requise'),
  purchasePrice: z.coerce.number().min(0, 'Le prix d\'achat doit être positif'),
  price: z.coerce.number().min(0, 'Le prix de vente doit être positif'),
  quantity: z.coerce.number().int().min(0, 'La quantité doit être positive'),
  expirationDate: z.string().min(1, 'La date d\'expiration est requise'),
  barcode: z.string().optional(),
});

type StockItemForm = z.infer<typeof stockItemSchema>;

interface StockItem extends StockItemForm {
  id: string;
  isAvailableForSale: boolean;
}

export default function StockPage() {
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<StockItem | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<z.input<typeof stockItemSchema>>({
    resolver: zodResolver(stockItemSchema),
  });

  useEffect(() => {
    fetch('/api/stock')
      .then(res => res.json())
      .then(data => setStockItems(data));
  }, []);

  const onSubmit = async (data: z.input<typeof stockItemSchema>) => {
    if (editingItem) {
      const response = await fetch(`/api/stock/${editingItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const updatedItem = await response.json();
      setStockItems(stockItems.map(item => item.id === editingItem.id ? updatedItem : item));
    } else {
      const response = await fetch('/api/stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const newItem = await response.json();
      setStockItems([...stockItems, newItem]);
    }
    reset();
    setIsFormVisible(false);
    setEditingItem(null);
  };

  const handleEdit = (item: StockItem) => {
    setEditingItem(item);
    reset(item);
    setIsFormVisible(true);
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/stock/${id}`, { method: 'DELETE' });
    setStockItems(stockItems.filter(item => item.id !== id));
  };

  const handleToggleAvailability = async (id: string) => {
    const item = stockItems.find(item => item.id === id);
    if (item) {
      const response = await fetch(`/api/stock/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailableForSale: !item.isAvailableForSale }),
      });
      const updatedItem = await response.json();
      setStockItems(stockItems.map(item => item.id === id ? updatedItem : item));
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Gestion du Stock</span>
            <Button onClick={() => { setIsFormVisible(!isFormVisible); setEditingItem(null); reset(); }}>
              <PlusCircle className="mr-2 h-4 w-4" /> {isFormVisible ? 'Annuler' : 'Ajouter un produit'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isFormVisible && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input {...register('name')} placeholder="Nom du produit" />
                {errors.name && <p className="text-red-500">{errors.name.message}</p>}
                <Input {...register('pharmaceuticalForm')} placeholder="Forme pharmaceutique" />
                {errors.pharmaceuticalForm && <p className="text-red-500">{errors.pharmaceuticalForm.message}</p>}
                <Input {...register('purchasePrice')} type="number" placeholder="Prix d\'achat (CDF)" />
                {errors.purchasePrice && <p className="text-red-500">{errors.purchasePrice.message}</p>}
                <Input {...register('price')} type="number" placeholder="Prix de vente (CDF)" />
                {errors.price && <p className="text-red-500">{errors.price.message}</p>}
                <Input {...register('quantity')} type="number" placeholder="Quantité en stock" />
                {errors.quantity && <p className="text-red-500">{errors.quantity.message}</p>}
                <Input {...register('expirationDate')} type="date" placeholder="Date d\'expiration" />
                {errors.expirationDate && <p className="text-red-500">{errors.expirationDate.message}</p>}
                <Input {...register('barcode')} placeholder="Code-barres (facultatif)" />
              </div>
              <Button type="submit">{editingItem ? 'Mettre à jour' : 'Ajouter'}</Button>
            </form>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Forme</TableHead>
                <TableHead>Prix Achat</TableHead>
                <TableHead>Prix Vente</TableHead>
                <TableHead>Quantité</TableHead>
                <TableHead>Expiration</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stockItems.map(item => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.pharmaceuticalForm}</TableCell>
                  <TableCell>{item.purchasePrice}</TableCell>
                  <TableCell>{item.price}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{new Date(item.expirationDate).toLocaleDateString()}</TableCell>
                  <TableCell className="flex space-x-2">
                    <Button variant="outline" size="icon" onClick={() => handleEdit(item)}><Edit className="h-4 w-4" /></Button>
                    <Button variant="destructive" size="icon" onClick={() => handleDelete(item.id)}><Trash2 className="h-4 w-4" /></Button>
                    <Button variant={item.isAvailableForSale ? "secondary" : "default"} onClick={() => handleToggleAvailability(item.id)}>
                      {item.isAvailableForSale ? <><ShoppingCart className="mr-2 h-4 w-4" /> Retirer</> : <><Package className="mr-2 h-4 w-4" /> Mettre en vente</>}
                    </Button>
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