'use client';

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Shield, ShoppingCart } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();

  return (
    <main className="flex flex-col items-center justify-center h-screen gap-6 bg-gray-50">
      <h1 className="text-3xl font-bold mb-8">Bienvenue sur PAJO PHARMA</h1>
      <div className="flex flex-col md:flex-row gap-4">
        <Button
          onClick={() => router.push("/login-admin")}
          className="px-8 py-4 text-lg font-semibold flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105"
          aria-label="Accès Admin"
        >
          <Shield className="h-5 w-5" />
          <span>Accès Admin</span>
        </Button>
        <Button
          onClick={() => router.push("/login-seller")}
          className="px-8 py-4 text-lg font-semibold flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105"
          aria-label="Accès Vendeur"
        >
          <ShoppingCart className="h-5 w-5" />
          <span>Accès Vendeur</span>
        </Button>
      </div>
    </main>
  );
}