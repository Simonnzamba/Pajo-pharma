import { Suspense } from 'react';
import { StatsCards } from '@/components/admin/stats-cards';
import { RecentSales } from '@/components/admin/recent-sales';
import { ExpiringMedications } from '@/components/admin/expiring-medications';
import { TopSellingMedications } from '@/components/admin/top-selling-medications';
import { RevenueBySeller } from '@/components/admin/revenue-by-seller';
import { ReorderSuggestions } from '@/components/admin/reorder-suggestions';
import { StaleMedicationsAlert } from '@/components/admin/stale-medications-alert';
import { ExpirationCalendar } from '@/components/admin/expiration-calendar';

export default function AdminDashboardPage() {
  return (
    <div className="flex flex-col gap-4 p-4 md:p-8">
      <h1 className="text-2xl font-bold">Tableau de Bord Administrateur</h1>
      <div className="flex flex-col md:flex-row gap-2">
        <a href="/api/sales/export" download="sales_report.csv">
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full md:w-auto">
            Exporter les ventes (CSV)
          </button>
        </a>
        <a href="/api/data/export" download="pajo_pharma_backup.json" className="w-full md:w-auto">
          <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded w-full md:w-auto">
            Exporter toutes les données (JSON)
          </button>
        </a>
      </div>
      <Suspense fallback={<p>Chargement des statistiques...</p>}>
        <StatsCards />
      </Suspense>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        <Suspense fallback={<p>Chargement des ventes récentes...</p>}>
          <RecentSales />
        </Suspense>
        <Suspense fallback={<p>Chargement des médicaments expirant...</p>}>
          <ExpiringMedications />
        </Suspense>
        <Suspense fallback={<p>Chargement des meilleurs ventes...</p>}>
          <TopSellingMedications />
        </Suspense>
        <Suspense fallback={<p>Chargement des recettes par vendeur...</p>}>
          <RevenueBySeller />
        </Suspense>
        <Suspense fallback={<p>Chargement des suggestions de réapprovisionnement...</p>}>
          <ReorderSuggestions />
        </Suspense>
        <Suspense fallback={<p>Chargement des alertes de médicaments non vendus...</p>}>
          <StaleMedicationsAlert />
        </Suspense>
        <Suspense fallback={<p>Chargement du calendrier des expirations...</p>}>
          <ExpirationCalendar />
        </Suspense>
      </div>
    </div>
  );
}
