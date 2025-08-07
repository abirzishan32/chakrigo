"use client";

import { useState } from 'react';
import { LogOut } from 'lucide-react';
import { signOut } from '@/lib/actions/auth.action';
import { useRouter } from 'next/navigation';

const SignOutButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      await signOut();
      // Redirect to home page after successful sign out
      router.push('/');
      // Force a page refresh to clear any cached user state
      window.location.reload();
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleSignOut}
      disabled={isLoading}
      className="relative group"
      aria-label="Sign out"
    >
      <div className="p-2 rounded-full transition-all duration-300 hover:bg-gray-800 relative overflow-hidden">
        <LogOut className="h-4 w-4 text-gray-400 group-hover:text-white transition-colors" />
        
        {/* Futuristic hover effect */}
        <span className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="absolute top-0 left-1/2 w-px h-0 bg-gradient-to-b from-primary-100/0 via-primary-100/80 to-primary-100/0 group-hover:h-full transition-all duration-500"></span>
          <span className="absolute bottom-0 left-1/2 w-px h-0 bg-gradient-to-t from-primary-100/0 via-primary-100/80 to-primary-100/0 group-hover:h-full transition-all duration-500 delay-100"></span>
        </span>
      </div>
      
      {/* Loading indicator */}
      {isLoading && (
        <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
      )}
    </button>
  );
};

export default SignOutButton;