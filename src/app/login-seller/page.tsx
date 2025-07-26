'use client';

import { Suspense } from 'react';
import { LoginForm } from '@/components/auth/login-form';

export default function SellerLoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm role="seller" />
    </Suspense>
  );
}