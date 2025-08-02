"use client";

import React, { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FaHome, 
  FaClipboardList, 
  FaCog, 
  FaUsers, 
  FaUserPlus,
  FaComments,
  FaChartLine,
  FaBuilding
} from "react-icons/fa";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AdminCheck from '@/components/AdminCheck';

const AdminLayout = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const response = await fetch('/api/auth/check-admin');
        const data = await response.json();
        setIsAdmin(data.isAdmin);
        if (!data.isAdmin) {
          router.push('/');
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        router.push('/');
      } finally {
        setIsLoading(false);
      }
    };

    checkAdmin();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/',
      icon: FaHome,
      active: pathname === '/'
    },
    {
      name: 'Skill Assessments',
      href: '/manage-skill-assessment',
      icon: FaClipboardList,
      active: pathname.startsWith('/manage-skill-assessment')
    },
    {
      name: 'Interviews',
      href: '/manage-interview',
      icon: FaComments,
      active: pathname.startsWith('/manage-interview')
    },
    {
      name: 'Create Interview',
      href: '/create-interview',
      icon: FaUserPlus,
      active: pathname.startsWith('/create-interview')
    },
    {
      name: 'Moderator Applications',
      href: '/moderator-applications',
      icon: FaBuilding,
      active: pathname.startsWith('/moderator-applications')
    },
    {
      name: 'User Management',
      href: '/user-management',
      icon: FaUsers,
      active: pathname.startsWith('/user-management')
    },
    
  ];

  return (
    <AdminCheck isAdmin={isAdmin}>
      <div className="min-h-screen bg-gray-900 flex">
        {/* Sidebar */}
        <div className="w-64 bg-gray-800 border-r border-gray-700">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-center h-16 border-b border-gray-700">
              <h1 className="text-xl font-bold text-white">Admin Panel</h1>
            </div>
            <nav className="flex-1 py-4">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-3 px-6 py-3 text-sm font-medium transition-colors duration-200 ${
                      item.active
                        ? 'bg-blue-500/10 text-blue-500 border-l-4 border-blue-500'
                        : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-auto">
          <div className="p-8 max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </div>
    </AdminCheck>
  );
};

export default AdminLayout;