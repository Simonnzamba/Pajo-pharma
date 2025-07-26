"use client";

import { Suspense } from 'react';
import FactureContent from "@/components/invoice/facture-content";

export default function FacturePage() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <FactureContent />
    </Suspense>
  );
}