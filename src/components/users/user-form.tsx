'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const baseSchema = z.object({
  username: z.string().min(1, "Le nom d'utilisateur est requis"),
  role: z.enum(['admin', 'seller'], { message: "Le rôle est requis" }),
});

export const createSchema = baseSchema.extend({
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
});

export const updateSchema = baseSchema.extend({
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères").optional().or(z.literal('')),
});

interface UserFormProps {
  onSubmit: (data: z.infer<typeof createSchema> | z.infer<typeof updateSchema>) => void;
  defaultValues?: Partial<z.infer<typeof createSchema>>;
}

export function UserForm({ onSubmit, defaultValues }: UserFormProps) {
  const isEditing = !!defaultValues?.username;

  const form = useForm<z.infer<typeof createSchema> | z.infer<typeof updateSchema>>({
    resolver: zodResolver(isEditing ? updateSchema : createSchema),
    defaultValues: {
      username: defaultValues?.username || '',
      password: '', // Always initialize password field to empty string
      role: defaultValues?.role || 'seller',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom d&apos;utilisateur</FormLabel>
              <FormControl>
                <Input placeholder="Nom d'utilisateur" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mot de passe</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Mot de passe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rôle</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un rôle" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="seller">Vendeur</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Enregistrer</Button>
      </form>
    </Form>
  );
}