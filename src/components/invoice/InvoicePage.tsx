
'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Sale, SaleItem, Medication, Client, InvoiceSettings } from '@prisma/client';
import { Invoice } from './invoice';
import { Button } from '@/components/ui/button';


type SaleWithDetails = Sale & {
  client: Client;
  items: (SaleItem & { medication: Medication })[];
};

export default function InvoicePage() {
  const params = useParams();
  const { saleId } = params;
  const [sale, setSale] = useState<SaleWithDetails | null>(null);
  const [settings, setSettings] = useState<InvoiceSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const componentRef = useRef<HTMLDivElement>(null);

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

  if (isLoading) {
    return <p>Chargement de la facture...</p>;
  }

  if (!sale || !settings) {
    return <p>Impossible de charger les informations de la facture.</p>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-end mb-4">
        <Button onClick={handlePrint}>Imprimer la Facture</Button>
      </div>
      <div ref={componentRef}>
        <Invoice sale={sale} settings={settings} />
      </div>
    </div>
  );
}

