'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Toaster, toast } from 'sonner';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

const settingsSchema = z.object({
  companyName: z.string().min(1, 'Le nom de l\'entreprise est requis'),
  companyAddress: z.string().min(1, 'L\'adresse est requise'),
  companyPhone: z.string().min(1, 'Le téléphone est requis'),
  companyEmail: z.string().email('Email invalide'),
  headerText: z.string().optional(),
  footerText: z.string().optional(),
});

type SettingsForm = z.infer<typeof settingsSchema>;

export default function ConfigurationPage() {
  const [settings, setSettings] = useState<SettingsForm | null>(null);
  const router = useRouter();

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<SettingsForm>({
    resolver: zodResolver(settingsSchema),
  });

  useEffect(() => {
    fetch('/api/invoice-settings')
      .then(res => res.json())
      .then(data => {
        setSettings(data);
        reset(data); // Pré-remplir le formulaire avec les données existantes
      });
  }, [reset]);

  const onSubmit = async (data: SettingsForm) => {
    try {
      const response = await fetch('/api/invoice-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Échec de la mise à jour');
      }

      const updatedSettings = await response.json();      setSettings(updatedSettings);      reset(updatedSettings);      toast.success('Les paramètres de la facture ont été mis à jour.', {        onAutoClose: () => router.push('/admin-dashboard'),      });    } catch (error) {      toast.error('Une erreur s\'est produite lors de la mise à jour.');    }  };

  if (!settings) {
    return <p>Chargement des paramètres...</p>;
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Toaster richColors />
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <CardTitle className="text-xl sm:text-2xl">Configuration de la Facture</CardTitle>
            <Link href="/admin-dashboard">
              <Button variant="outline" className="w-full sm:w-auto">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour au tableau de bord
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <label htmlFor="companyName">Nom de l'entreprise</label>
                <Input id="companyName" {...register('companyName')} />
                {errors.companyName && <p className="text-red-500 text-sm mt-1">{errors.companyName.message}</p>}
              </div>
              <div>
                <label htmlFor="companyAddress">Adresse</label>
                <Input id="companyAddress" {...register('companyAddress')} />
                {errors.companyAddress && <p className="text-red-500 text-sm mt-1">{errors.companyAddress.message}</p>}
              </div>
              <div>
                <label htmlFor="companyPhone">Téléphone</label>
                <Input id="companyPhone" {...register('companyPhone')} />
                {errors.companyPhone && <p className="text-red-500 text-sm mt-1">{errors.companyPhone.message}</p>}
              </div>
              <div>
                <label htmlFor="companyEmail">Email</label>
                <Input id="companyEmail" type="email" {...register('companyEmail')} />
                {errors.companyEmail && <p className="text-red-500 text-sm mt-1">{errors.companyEmail.message}</p>}
              </div>
              <div>
                <label htmlFor="headerText">Texte d'en-tête</label>
                <Input id="headerText" {...register('headerText')} />
              </div>
              <div>
                <label htmlFor="footerText">Texte de pied de page</label>
                <Input id="footerText" {...register('footerText')} />
              </div>
            </div>
            <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
              {isSubmitting ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}