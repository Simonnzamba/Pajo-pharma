
import { UsersTable } from '@/components/users/users-table';


export default function UsersPage() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Gestion des Utilisateurs</h1>
      
      <UsersTable />
    </div>
  );
}
