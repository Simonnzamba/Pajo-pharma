
import { MedicationsList } from '@/components/medications/medications-list';
import { Cart } from '@/components/cart/cart';
import { DailySalesHistory } from '@/components/sales/daily-sales-history';

export default function SellerDashboardPage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
      <div className="flex flex-col gap-4 lg:col-span-2">
        <h1 className="text-2xl font-bold">Interface de Vente</h1>
        <MedicationsList />
      </div>
      <div className="flex flex-col gap-4 lg:col-span-1">
        <Cart />
        <DailySalesHistory />
      </div>
    </div>
  );
}

