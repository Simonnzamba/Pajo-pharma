import { SalesHistory } from '@/components/sales/sales-history';

export default function SalesPage() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Historique des Ventes</h1>
      <SalesHistory />
    </div>
  );
}