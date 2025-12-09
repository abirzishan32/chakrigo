"use client";

import { useState } from 'react';
import { LogOut } from 'lucide-react';
import { signOut } from '@/lib/actions/auth.action';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const SignOutButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      toast.loading('Signing out...', { id: 'sign-out' });
      await signOut();
      toast.success('Signed out successfully!', { id: 'sign-out' });
      router.push('/');
      window.location.reload();
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out. Please try again.', { id: 'sign-out' });
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleSignOut}
        disabled={isLoading}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="relative group"
        aria-label="Sign out"
      >
        <div className={`p-2 rounded-full transition-all duration-300 relative overflow-hidden ${
          isLoading 
            ? 'bg-red-500/20 cursor-not-allowed' 
            : 'hover:bg-gradient-to-r hover:from-red-500/20 hover:to-orange-500/20'
        }`}>
          <LogOut 
            className={`h-4 w-4 transition-all duration-300 ${
              isLoading 
                ? 'text-red-400 animate-pulse' 
                : 'text-gray-400 group-hover:text-red-400 group-hover:scale-110'
            }`} 
          />
          
          {/* Animated border effect */}
          <span className={`absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
            isLoading ? 'hidden' : ''
          }`}>
            <span className="absolute inset-0 rounded-full border-2 border-red-500/0 group-hover:border-red-500/50 transition-all duration-500 animate-pulse"></span>
          </span>
          
          {/* Glow effect on hover */}
          <span className={`absolute inset-0 rounded-full bg-gradient-to-r from-red-500/0 to-orange-500/0 blur-md opacity-0 group-hover:opacity-30 transition-opacity duration-300 ${
            isLoading ? 'hidden' : ''
          }`}></span>
        </div>
        
        {/* Loading spinner */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin"></div>
          </div>
        )}
      </button>
      
      {/* Enhanced tooltip */}
      {showTooltip && !isLoading && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-1.5 bg-gray-900 border border-gray-700 rounded-lg shadow-xl whitespace-nowrap z-50 animate-in fade-in slide-in-from-bottom-1 duration-200">
          <div className="text-xs font-medium text-white">Sign Out</div>
          {/* Tooltip arrow */}
          <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-700"></div>
        </div>
      )}
    </div>
  );
};

export default SignOutButton;