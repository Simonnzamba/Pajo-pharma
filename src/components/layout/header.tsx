
'use client';

'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useState } from 'react';
import { ProfileSettings } from '@/components/users/profile-settings'; // We will create this component

export function Header() {
  const { data: session } = useSession();
  const [isProfileSettingsOpen, setIsProfileSettingsOpen] = useState(false);

  return (
    <header className="bg-gray-800 text-white p-4 flex justify-between items-center">
      <Link href="/">
        <h1 className="text-xl font-bold">PAJO PHARMA</h1>
      </Link>
      
      {session && (
        <div className="flex items-center space-x-4">
          <Dialog open={isProfileSettingsOpen} onOpenChange={setIsProfileSettingsOpen}>
            <DialogTrigger asChild>
              <div className="flex items-center cursor-pointer space-x-2">
                <span>Profil</span>
                <Avatar>
                  <AvatarImage src={session.user.image || "/default-avatar.png"} alt="@username" />
                  <AvatarFallback>{session.user.username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                </Avatar>
              </div>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Paramètres du Profil</DialogTitle>
              </DialogHeader>
              <ProfileSettings />
            </DialogContent>
          </Dialog>
        </div>
      )}
    </header>
  );
}
