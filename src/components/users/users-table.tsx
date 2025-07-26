/** @jsxRuntime automatic */
'use client';

import { useEffect, useState } from 'react';
import { getUsers, createUser, updateUser, deleteUser } from '@/lib/actions/users';
import { User } from '@prisma/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { UserForm } from './user-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { createSchema, updateSchema } from './user-form';

// Define a type for the user being edited, ensuring role is handled correctly.
// We cast the role from the prisma model to the specific string literals.
const getEditableUser = (user: User) => ({
  ...user,
  role: user.role as 'admin' | 'seller',
});

export function UsersTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  // The state for the user being edited now uses the plain User type.
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const fetchUsers = async () => {
    const data = await getUsers();
    setUsers(data);
  };

  useEffect(() => {
    fetchUsers();
  },
 []);

  const handleFormSubmit = async (data: z.infer<typeof createSchema> | z.infer<typeof updateSchema>) => {
    try {
      if (editingUser) {
        const updatePayload: { username: string; password?: string; role?: string } = { username: data.username };
        if ('password' in data && data.password) {
          updatePayload.password = data.password;
        }
        // Use the role from the editingUser state
        await updateUser(editingUser.id, { ...updatePayload, role: editingUser.role });
        toast.success('Vendeur mis à jour avec succès!');
      } else {
        if (!('password' in data) || !data.password) {
          toast.error('Le mot de passe est requis pour la création d\'un utilisateur.');
          return;
        }
        await createUser({ username: data.username, password: data.password, role: 'seller' });
        toast.success('Vendeur ajouté avec succès!');
      }
      fetchUsers();
      setIsDialogOpen(false);
      setEditingUser(null);
    } catch (error) {
      toast.error("Une erreur s'est produite.");
    }
  };

  const handleDelete = async (userId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce vendeur ?')) {
      try {
        await deleteUser(userId);
        toast.success('Vendeur supprimé avec succès!');
        fetchUsers();
      } catch (error) {
        toast.error("Une erreur s'est produite lors de la suppression.");
      }
    }
  };

  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setIsDialogOpen(true);
  };

  const handleAddNewClick = () => {
    setEditingUser(null);
    setIsDialogOpen(true);
  };

  // Prepare defaultValues for the form, ensuring the role is correctly typed.
  const userFormDefaultValues = editingUser ? getEditableUser(editingUser) : undefined;

  return (
    <div>
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) setEditingUser(null);
      }}>
        <DialogTrigger asChild>
          <Button onClick={handleAddNewClick}>Ajouter un utilisateur</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Modifier l\'utilisateur' : 'Ajouter un utilisateur'}</DialogTitle>
          </DialogHeader>
          <UserForm onSubmit={handleFormSubmit} defaultValues={userFormDefaultValues} />
        </DialogContent>
      </Dialog>

      <div className="overflow-x-auto mt-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="whitespace-nowrap">Nom d&apos;utilisateur</TableHead>
              <TableHead className="whitespace-nowrap">Rôle</TableHead>
              <TableHead className="whitespace-nowrap">Date de création</TableHead>
              <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="whitespace-nowrap">{user.username}</TableCell>
                <TableCell className="whitespace-nowrap">{user.role}</TableCell>
                <TableCell className="whitespace-nowrap">{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                <TableCell className="text-right whitespace-nowrap">
                  <div className="flex flex-col sm:flex-row gap-2 justify-end">
                    <Button variant="outline" size="sm" onClick={() => handleEditClick(user)}>
                      Modifier
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(user.id)}>
                      Supprimer
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}