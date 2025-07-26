'use client';

import { Suspense } from 'react';
import { LoginForm } from '@/components/auth/login-form';

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm role="admin" />
    </Suspense>
  );
}