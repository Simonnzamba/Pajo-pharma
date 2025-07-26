
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Medication } from '@prisma/client';

const formSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  pharmaceuticalForm: z.string().min(1, 'La forme pharmaceutique est requise'),
  purchasePrice: z.coerce.number().min(0, 'Le prix d\'achat doit être positif'),
  price: z.number().min(0, 'Le prix doit être positif'),
  quantity: z.number().int().min(0, 'La quantité doit être un entier positif'),
  expirationDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Date invalide' }),
  barcode: z.string().min(1, 'Le code-barres est requis'),
});

interface MedicationFormProps {
  onSubmit: (data: z.input<typeof formSchema>) => void;
  medication: Medication | null;
}

export function MedicationForm({ onSubmit, medication }: MedicationFormProps) {
  const form = useForm<z.input<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: medication?.name || '',
      pharmaceuticalForm: medication?.pharmaceuticalForm || '',
      purchasePrice: medication?.purchasePrice || 0,
      price: medication?.price || 0,
      quantity: medication?.quantity || 0,
      expirationDate: medication ? new Date(medication.expirationDate).toISOString().split('T')[0] : '',
      barcode: medication?.barcode || '',
    },
  });

  const handleSubmit = (values: z.input<typeof formSchema>) => {
    onSubmit({ 
      ...values, 
      expirationDate: new Date(values.expirationDate).toISOString(),
      purchasePrice: Number(values.purchasePrice), // Explicitly cast to number
      price: Number(values.price), // Explicitly cast to number
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom</FormLabel>
              <FormControl>
                <Input placeholder="Nom du médicament" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="pharmaceuticalForm"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Forme pharmaceutique</FormLabel>
              <FormControl>
                <Input placeholder="Comprimé, Sirop, etc." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="purchasePrice"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prix d&apos;achat</FormLabel>
              <FormControl>
                <Input type="number" placeholder="Prix d&apos;achat" {...field} value={field.value as number | ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prix</FormLabel>
              <FormControl>
                <Input type="number" placeholder="Prix" {...field} value={field.value as number | ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantité</FormLabel>
              <FormControl>
                <Input type="number" placeholder="Quantité" {...field} value={field.value as number | ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="expirationDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date d&apos;expiration</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="barcode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Code-barres</FormLabel>
              <FormControl>
                <Input placeholder="Code-barres" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Enregistrer</Button>
      </form>
    </Form>
  );
}
