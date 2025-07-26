'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Home, Package, ShoppingCart, Users, LogOut, Boxes, Tag, Settings, Menu } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';

interface SidebarLayoutProps {
  children: React.ReactNode;
}

export default function SidebarLayout({ children }: SidebarLayoutProps) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Initialisé à false pour mobile

  const isAdmin = session?.user?.role === 'admin';
  const isSeller = session?.user?.role === 'seller';

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Overlay pour mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 bg-white shadow-md p-4 transition-all duration-300 ease-in-out lg:relative lg:translate-x-0",
        isSidebarOpen ? "translate-x-0 w-64" : "-translate-x-full w-64"
      )}>
        <div className="text-2xl font-bold mb-6 flex justify-between items-center">
          PAJO PHARMA
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>
        <nav className="space-y-2">
          {isAdmin && (
            <Link
              href="/admin-dashboard"
              className={cn(
                "flex items-center p-2 rounded-md text-gray-700 hover:bg-gray-200",
                pathname === '/admin-dashboard' && 'bg-gray-200 text-gray-900'
              )}
              onClick={() => setIsSidebarOpen(false)} // Fermer la sidebar après clic
            >
              <Home className="mr-3 h-5 w-5" />
              Dashboard Admin
            </Link>
          )}
          
          {isAdmin && (
            <Link
              href="/sell"
              className={cn(
                "flex items-center p-2 rounded-md text-gray-700 hover:bg-gray-200",
                pathname === '/sell' && 'bg-gray-200 text-gray-900'
              )}
              onClick={() => setIsSidebarOpen(false)}
            >
              <ShoppingCart className="mr-3 h-5 w-5" />
              Vente Rapide
            </Link>
          )}
          {(isAdmin || isSeller) && (
            <>
              <Link
                href="/seller-dashboard"
                className={cn(
                  "flex items-center p-2 rounded-md text-gray-700 hover:bg-gray-200",
                  pathname === '/seller-dashboard' && 'bg-gray-200 text-gray-900'
                )}
                onClick={() => setIsSidebarOpen(false)}
              >
                <Home className="mr-3 h-5 w-5" />
                Tableau de bord
              </Link>
              <Link
                href="/medications"
                className={cn(
                  "flex items-center p-2 rounded-md text-gray-700 hover:bg-gray-200",
                  pathname === '/medications' && 'bg-gray-200 text-gray-900'
                )}
                onClick={() => setIsSidebarOpen(false)}
              >
                <Package className="mr-3 h-5 w-5" />
                Médicaments disponible
              </Link>
              <Link
                href={isAdmin ? "/sales" : "/seller/sales-history"}
                className={cn(
                  "flex items-center p-2 rounded-md text-gray-700 hover:bg-gray-200",
                  (pathname === '/sales' || pathname === '/seller/sales-history') && 'bg-gray-200 text-gray-900'
                )}
                onClick={() => setIsSidebarOpen(false)}
              >
                <ShoppingCart className="mr-3 h-5 w-5" />
                Historique de vente
              </Link>
            </>
          )}
          {isAdmin && (
            <Link
              href="/admin/stock"
              className={cn(
                "flex items-center p-2 rounded-md text-gray-700 hover:bg-gray-200",
                pathname === '/admin/stock' && 'bg-gray-200 text-gray-900'
              )}
              onClick={() => setIsSidebarOpen(false)}
            >
              <Boxes className="mr-3 h-5 w-5" />
              Stock
            </Link>
          )}
          {isAdmin && (
            <Link
              href="/admin/produits-disponibles"
              className={cn(
                "flex items-center p-2 rounded-md text-gray-700 hover:bg-gray-200",
                pathname === '/admin/produits-disponibles' && 'bg-gray-200 text-gray-900'
              )}
              onClick={() => setIsSidebarOpen(false)}
            >
              <Tag className="mr-3 h-5 w-5" />
              Produits Disponibles
            </Link>
          )}
          {isAdmin && (
            <Link
              href="/users"
              className={cn(
                "flex items-center p-2 rounded-md text-gray-700 hover:bg-gray-200",
                pathname === '/users' && 'bg-gray-200 text-gray-900'
              )}
              onClick={() => setIsSidebarOpen(false)}
            >
              <Users className="mr-3 h-5 w-5" />
              Utilisateurs
            </Link>
          )}
          {isAdmin && (
            <Link
              href="/admin/configuration"
              className={cn(
                "flex items-center p-2 rounded-md text-gray-700 hover:bg-gray-200",
                pathname === '/admin/configuration' && 'bg-gray-200 text-gray-900'
              )}
              onClick={() => setIsSidebarOpen(false)}
            >
              <Settings className="mr-3 h-5 w-5" />
              Configuration
            </Link>
          )}
          {session && (
            <Button
              onClick={() => signOut({ callbackUrl: '/' })}
              className={cn(
                "w-full flex items-center p-2 rounded-md text-gray-700 hover:bg-gray-200 justify-start",
                "bg-transparent hover:bg-gray-200 text-gray-700"
              )}
            >
              <LogOut className="mr-3 h-5 w-5" />
              Déconnexion
            </Button>
          )}
        </nav>
      </aside>
      <main className="flex-1 transition-all duration-300 ease-in-out">
        {/* Bouton hamburger pour mobile */}
        <div className="lg:hidden p-4 bg-white shadow-md flex items-center">
          <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)}>
            <Menu className="h-6 w-6" />
          </Button>
          <span className="ml-4 text-xl font-bold">PAJO PHARMA</span>
        </div>
        <div className="p-8">
          
          {children}
        </div>
      </main>
    </div>
  );
}
