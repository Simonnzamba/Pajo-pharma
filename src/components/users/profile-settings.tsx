'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import Image from 'next/image';



export function ProfileSettings() {
  const { data: session, update } = useSession();
  const [newUsername, setNewUsername] = useState(session?.user?.username || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [profileImage, setProfileImage] = useState(session?.user?.image || '');
  const [loading, setLoading] = useState(false);

  const handleUsernameUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/users/update-username', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: session?.user?.id, username: newUsername }),
      });
      if (res.ok) {
        toast.success('Nom d\'utilisateur mis à jour avec succès!');
        update({ username: newUsername }); // Update session
      } else {
        const errorData = await res.json();
        toast.error(`Erreur: ${errorData.message || 'Impossible de mettre à jour le nom d&apos;utilisateur.'}`);
      }
    } catch (error) {
      console.error('Failed to update username:', error);
      toast.error('Erreur réseau lors de la mise à jour du nom d&apos;utilisateur.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (newPassword !== confirmNewPassword) {
      toast.error('Les nouveaux mots de passe ne correspondent pas.');
      setLoading(false);
      return;
    }
    try {
      const res = await fetch('/api/users/update-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: session?.user?.id, currentPassword, newPassword }),
      });
      if (res.ok) {
        toast.success('Mot de passe mis à jour avec succès!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      } else {
        const errorData = await res.json();
        toast.error(`Erreur: ${errorData.message || 'Impossible de mettre à jour le mot de passe.'}`);
      }
    } catch (error) {
      console.error('Failed to update password:', error);
      toast.error('Erreur réseau lors de la mise à jour du mot de passe.');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileImageUpdate = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // For an offline app, we might store the image as a Data URL or in IndexedDB
    // For simplicity, let's convert it to a Data URL for display
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Image = reader.result as string;
      setProfileImage(base64Image);
      update({ image: base64Image }); // Update session with new image
      toast.success('Photo de profil mise à jour!');
      // In a real app, you'd save this to your database/storage
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Modifier le Nom d&apos;utilisateur</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUsernameUpdate} className="space-y-4">
            <div>
              <Label htmlFor="newUsername">Nouveau Nom d&apos;utilisateur</Label>
              <Input
                id="newUsername"
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? 'Mise à jour...' : 'Mettre à jour le Nom d&apos;utilisateur'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Modifier le Mot de passe</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordUpdate} className="space-y-4">
            <div>
              <Label htmlFor="currentPassword">Mot de passe actuel</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div>
              <Label htmlFor="newPassword">Nouveau Mot de passe</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div>
              <Label htmlFor="confirmNewPassword">Confirmer le Nouveau Mot de passe</Label>
              <Input
                id="confirmNewPassword"
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? 'Mise à jour...' : 'Mettre à jour le Mot de passe'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Modifier la Photo de Profil</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          <Image
            src={profileImage || "/default-avatar.png"}
            alt="Photo de profil"
            width={96} // 24 * 4 (tailwind w-24 is 6rem = 96px)
            height={96} // 24 * 4
            className="w-24 h-24 rounded-full object-cover"
          />
          <Input
            id="profileImage"
            type="file"
            accept="image/*"
            onChange={handleProfileImageUpdate}
            className="w-full max-w-xs"
            disabled={loading}
          />
        </CardContent>
      </Card>

      <Button
        onClick={() => signOut({ callbackUrl: '/' })}
        variant="destructive"
        className="w-full"
        disabled={loading}
      >
        Déconnexion
      </Button>
    </div>
  );
}