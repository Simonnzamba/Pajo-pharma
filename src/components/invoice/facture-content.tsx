
import { useSearchParams, useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/store/cart';
import { Invoice } from './invoice';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { InvoiceSettings } from '@prisma/client';
import { toast } from 'sonner';

export default function FactureContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const clientName = searchParams.get('clientName') || 'Client inconnu';
  const amountPaid = parseFloat(searchParams.get('amountPaid') || '0');

  const { items, clearCart } = useCartStore();
  const total = items.reduce((acc, item) => acc + item.price * item.quantityInCart, 0);

  const [settings, setSettings] = useState<InvoiceSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch('/api/invoice-settings')
      .then(res => res.json())
      .then(data => {
        setSettings(data);
        setIsLoading(false);
      })
      .catch(error => {
        console.error("Erreur de chargement des paramètres de la facture:", error);
        setIsLoading(false);
      });
  }, []);

  const handleFinalizeAndPrint = async () => {
    console.log("Début de handleFinalizeAndPrint");
    setIsSaving(true);
    try {
      console.log("Envoi des données de vente à l'API:", { items, clientName, amountPaid, totalAmount: total, paymentMethod: 'Espèces' });
      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          clientName,
          amountPaid,
          totalAmount: total,
          paymentMethod: 'Espèces',
        }),
      });

      console.log("Réponse de l'API reçue:", response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Erreur de l'API:", errorData);
        throw new Error(errorData.error || 'Une erreur est survenue lors de la sauvegarde de la vente.');
      }

      toast.success('Vente enregistrée avec succès!');
      console.log("Vente enregistrée, tentative d'impression...");

      // Imprimer
      window.print();
      console.log("Impression lancée.");

      // Vider le panier et rediriger
      clearCart();
      console.log("Panier vidé.");
      router.push('/seller/sales-history');
      console.log("Redirection vers l'historique des ventes.");

    } catch (error: Error) {
      console.error("Erreur dans handleFinalizeAndPrint:", error);
      toast.error(error.message || 'Une erreur inattendue est survenue.');
    } finally {
      setIsSaving(false);
      console.log("Fin de handleFinalizeAndPrint.");
    }
  };

  if (isLoading || !settings) {
    return <p>Chargement des informations de la facture...</p>;
  }

  const sale = {
    id: `Vente-${Date.now()}`,
    date: new Date(),
    client: { name: clientName, id: '', address: null, phone: null, email: null, createdAt: new Date(), updatedAt: new Date() },
    items: items.map(item => ({
      id: item.id,
      quantity: item.quantityInCart,
      priceAtSale: item.price,
      medication: { ...item, quantity: item.quantity, createdAt: new Date(), updatedAt: new Date() },
      saleId: '',
      medicationId: item.id,
    })),
    totalAmount: total,
    paymentMethod: 'Espèces', // ou une autre valeur par défaut
    sellerId: '', // à remplir avec l'ID du vendeur connecté
    createdAt: new Date(),
    updatedAt: new Date(),
    amountPaid: amountPaid,
    changeDue: amountPaid - total,
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-end mb-4 no-print">
        <Button onClick={handleFinalizeAndPrint} disabled={isSaving}>
          {isSaving ? 'Enregistrement...' : 'Finaliser et Imprimer'}
        </Button>
      </div>
      <div id="invoice-to-print">
        <Invoice sale={sale} settings={settings} />
      </div>
    </div>
  );
}
