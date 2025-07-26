// src/components/ProgressBar.tsx
'use client';

import NProgress from 'nprogress';
import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function ProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    NProgress.configure({ showSpinner: false });

    const handleStart = () => NProgress.start();
    const handleComplete = () => NProgress.done();
    

    // Start progress on route change
    handleStart();

    // Complete progress when component mounts (initial load) or route change completes
    handleComplete();

    return () => {
      // Clean up any pending progress on unmount
      NProgress.remove();
    };
  }, [pathname, searchParams]);

  return null; // This component doesn't render anything visible itself
}