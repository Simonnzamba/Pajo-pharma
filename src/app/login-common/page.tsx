'use client';

import { Suspense } from 'react';
import { LoginForm } from '@/components/auth/login-form';

export default function CommonLoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm role="admin" /> {/* Default role, will be overridden by specific login pages */}
    </Suspense>
  );
}