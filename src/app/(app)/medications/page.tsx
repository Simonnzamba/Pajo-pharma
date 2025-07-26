
import { MedicationsList } from '@/components/medications/medications-list';

export default function MedicationsPage() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Gestion des Médicaments</h1>
      <MedicationsList />
    </div>
  );
}
