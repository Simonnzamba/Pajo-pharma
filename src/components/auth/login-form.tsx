'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { signIn } from 'next-auth/react';

interface LoginFormProps {
  role: 'admin' | 'seller';
}

export function LoginForm({ role }: LoginFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await signIn('credentials', {
      redirect: false,
      username,
      password,
      role,
    });

    if (result?.ok) {
      if (role === 'admin') {
        router.push('/admin-dashboard');
      } else if (role === 'seller') {
        router.push('/seller-dashboard');
      }
    } else {
      toast.error(result?.error || `Nom d'utilisateur ou mot de passe incorrect.`);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Connexion {role === 'admin' ? 'Admin' : 'Vendeur'}</CardTitle>
          <CardDescription>Connectez-vous à votre compte PAJO PHARMA.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="username">Nom d&#39;utilisateur</Label>
                <Input
                  id="username"
                  placeholder="Votre nom d&#39;utilisateur"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Votre mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full mt-6">Se connecter</Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          {/* <Link href="/forgot-password">Mot de passe oublié?</Link> */}
        </CardFooter>
      </Card>
    </div>
  );
}
