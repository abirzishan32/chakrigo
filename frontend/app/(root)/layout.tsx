"use client";

import React, { ReactNode, useState, useEffect } from 'react'
import Link from "next/link";
import Image from "next/image";
import { getCurrentUser } from "@/lib/actions/auth.action";
import SignOutButton from '@/components/SignOutButton';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import GlobalSidebar from '@/components/GlobalSidebar';

const RootLayout = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<any>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const pathname = usePathname();
    
    // Check if current path is homepage or auth pages
    const isHomePage = pathname === '/';
    const isAuthPage = pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up');
    const shouldShowSidebar = !isHomePage && !isAuthPage;
    
    useEffect(() => {
        const fetchUser = async () => {
            const userData = await getCurrentUser();
            setUser(userData);
        };
        
        fetchUser();
    }, []);
    
    const isUserAuth = !!user;
    const isModerator = user?.role === 'interview-moderator';
    
    // Close mobile menu when window is resized above mobile breakpoint
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768 && isMenuOpen) {
                setIsMenuOpen(false);
            }
        };
        
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isMenuOpen]);
    
    // Lock body scroll when mobile menu is open
    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        
        return () => {
            document.body.style.overflow = '';
        };
    }, [isMenuOpen]);

    const toggleSidebar = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
    };

    // If we're on the homepage or auth pages, use the original layout
    if (!shouldShowSidebar) {
        return (
            <div className="root-layout">
                <nav className="fixed top-0 left-0 right-0 z-50 nav-glass py-3 px-5">
                    <div className="max-w-7xl mx-auto flex justify-between items-center">
                        <div className="flex items-center gap-6">
                            <Link href="/" className="flex items-center gap-3 group">
                                <div className="relative overflow-hidden rounded-full p-0.5">
                                    <Image 
                                        src="/chakrigo-logo.png" 
                                        alt="ChakriGO Logo" 
                                        width={40} 
                                        height={34}
                                        className="rounded-full transform transition-transform group-hover:scale-110 duration-300" 
                                    />
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-all"></div>
                                </div>
                                <h2 className="text-primary-100 font-bold tracking-wide group-hover:text-white transition-colors"> 
                                    Chakri<span className="text-white">GO</span>
                                </h2>
                            </Link>
                            
                            {/* Main Navigation Links - Desktop */}
                            <div className="hidden md:flex items-center gap-7">
                                <NavLink href="/dashboard" label="Dashboard" />
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Mobile menu toggle */}
                            <button 
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="md:hidden relative w-9 h-9 flex items-center justify-center rounded-full bg-gray-800/50 hover:bg-gray-800 transition-colors"
                                aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                            >
                                <div className="relative w-6 h-6 flex items-center justify-center">
                                    <AnimatePresence mode="wait">
                                        {isMenuOpen ? (
                                            <motion.div
                                                key="close"
                                                initial={{ opacity: 0, rotate: -90 }}
                                                animate={{ opacity: 1, rotate: 0 }}
                                                exit={{ opacity: 0, rotate: 90 }}
                                                transition={{ duration: 0.2 }}
                                                className="absolute inset-0 flex items-center justify-center"
                                            >
                                                <X className="h-5 w-5 text-primary-100" />
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                key="menu"
                                                initial={{ opacity: 0, rotate: 90 }}
                                                animate={{ opacity: 1, rotate: 0 }}
                                                exit={{ opacity: 0, rotate: -90 }}
                                                transition={{ duration: 0.2 }}
                                                className="absolute inset-0 flex items-center justify-center"
                                            >
                                                <Menu className="h-5 w-5 text-gray-400" />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                    
                                    {/* Animated ring effect */}
                                    <div className={`absolute inset-0 rounded-full border border-primary-100/30 transition-all duration-300 ${isMenuOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}></div>
                                </div>
                            </button>

                            {isUserAuth ? (
                                <div className="flex items-center gap-6">
                                   
                                    
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 nav-logo-glow bg-gradient-to-r from-primary-100 to-blue-600 rounded-full flex items-center justify-center">
                                            <span className="text-black font-semibold text-sm">
                                                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                            </span>
                                        </div>
                                        <span className="text-white font-medium text-sm hidden sm:block">{user?.name}</span>
                                        <SignOutButton />
                                    </div>
                                </div>
                            ) : (
                                <Link 
                                    href="/sign-in" 
                                    className="nav-btn-gradient text-black font-semibold py-2 px-6 rounded-full hover:shadow-lg hover:shadow-primary-200/20 transition-all"
                                >
                                    Login
                                </Link>
                            )}
                        </div>
                    </div>
                </nav>
                
                {/* Mobile Menu Overlay */}
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            <motion.div 
                                initial={{ x: "100%" }}
                                animate={{ x: 0 }}
                                exit={{ x: "100%" }}
                                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                                className="absolute right-0 top-0 bottom-0 w-4/5 max-w-sm bg-gray-900/95 backdrop-blur-md p-6 pt-20 shadow-xl border-l border-gray-800"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="flex flex-col gap-6">
                                    <MobileNavLink href="/dashboard" label="Dashboard" onClick={() => setIsMenuOpen(false)} />
                                    
                                    <div className="mt-4 pt-6 border-t border-gray-800">
                                        {isUserAuth ? (
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 nav-logo-glow bg-gradient-to-r from-primary-100 to-blue-600 rounded-full flex items-center justify-center">
                                                        <span className="text-black font-semibold text-sm">
                                                            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-white font-medium text-sm">{user?.name}</span>
                                                        <span className="text-gray-400 text-xs">{user?.email}</span>
                                                    </div>
                                                </div>
                                                <SignOutButton />
                                            </div>
                                        ) : (
                                            <Link 
                                                href="/sign-in" 
                                                className="w-full nav-btn-gradient text-black font-semibold py-3 px-6 rounded-lg flex items-center justify-center"
                                                onClick={() => setIsMenuOpen(false)}
                                            >
                                                Login
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
                
                {/* Add padding to account for fixed navbar */}
                <div className="pt-16">
                    {children}
                </div>
            </div>
        )
    }

    // For all other routes, show the sidebar layout
    return (
        <div className="flex h-screen bg-black text-white overflow-hidden">
            {/* Global Sidebar */}
            <GlobalSidebar 
                isSidebarCollapsed={isSidebarCollapsed} 
                toggleSidebar={toggleSidebar} 
            />
            
            {/* Main Content */}
            <div className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
                <div className="p-6 h-full overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
}

// Navigation link component with hover effects
const NavLink = ({ href, label }: { href: string; label: string }) => (
    <Link 
        href={href} 
        className="relative nav-item-hover nav-link-underline"
    >
        <span className="text-gray-400 font-medium tracking-wide text-sm group-hover:text-white transition-colors">
            {label}
        </span>
    </Link>
);

// Mobile navigation link with animation
const MobileNavLink = ({ href, label, onClick }: { href: string; label: string; onClick: () => void }) => (
    <Link 
        href={href} 
        className="relative overflow-hidden group block"
        onClick={onClick}
    >
        <div className="flex items-center py-3 px-4 rounded-lg group-hover:bg-gray-800/80 transition-colors">
            <span className="text-gray-300 font-medium text-lg group-hover:text-white transition-colors">
                {label}
            </span>
            {/* Animated highlight bar */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary-100 to-blue-600 scale-y-0 origin-bottom group-hover:scale-y-100 transition-transform duration-300"></div>
        </div>
    </Link>
);

export default RootLayout