// manager/src/components/AuthCheck.js
"use client";
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function AuthCheck({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      
      // If user is not authenticated and not on auth page, redirect to auth
      if (!currentUser && pathname !== '/auth') {
        router.push('/auth');
      }
      
      // If user is authenticated and on auth page, redirect to home
      if (currentUser && pathname === '/auth') {
        router.push('/');
      }
    });

    return () => unsubscribe();
  }, [router, pathname]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If on auth page or user is authenticated, render children
  if (pathname === '/auth' || user) {
    return <>{children}</>;
  }

  // This shouldn't render as the useEffect above should redirect
  return null;
}