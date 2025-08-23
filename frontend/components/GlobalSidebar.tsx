import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { getCurrentUser, signOut } from "@/lib/actions/auth.action";
import SignOutButton from "@/components/SignOutButton";
import { NotificationMenu } from "@/components/notifications/NotificationMenu";
import {
  Home,
  Users,
  FileText,
  Brain,
  Bot,
  ChevronRight,
  ChevronLeft,
  Settings,
  HelpCircle,
  ScanText,
  Activity,
  LogOut,
  Code,
  File,
  BrainCog,
  Route,
  FileEdit
} from 'lucide-react';
import { motion } from 'framer-motion';

interface GlobalSidebarProps {
    isSidebarCollapsed: boolean;
    toggleSidebar: () => void;
}

const GlobalSidebar = ({
    isSidebarCollapsed,
    toggleSidebar,
}: GlobalSidebarProps) => {
    const [user, setUser] = useState<any>(null);
    const [isSigningOut, setIsSigningOut] = useState(false);
    const pathname = usePathname();
    const [activeSection, setActiveSection] = useState<string>("");

    useEffect(() => {
        const fetchUser = async () => {
            const userData = await getCurrentUser();
            setUser(userData);
        };

        fetchUser();
    }, []);

    useEffect(() => {
        // Set active section based on current path
        const path = pathname?.split("/")?.[1] || "dashboard";
        setActiveSection(path);
    }, [pathname]);

    const isUserAuth = !!user;
    const isModerator = user?.role === "interview-moderator";

  const sidebarLinks = [
    {
      href: "/dashboard",
      icon: <Home size={20} />,
      label: "Dashboard",
      id: "dashboard"
    },
    {
      href: "/interview-home",
      icon: <Bot size={20} />,
      label: "AI Interviews",
      id: "interview-home"
    },
    {
      href: "/skill-assessment",
      icon: <Brain size={20} />,
      label: "Skills Analysis",
      id: "skill-assessment"
    },
    {
      href: "/resume-builder",
      icon: <FileEdit size={20} />,
      label: "Resume Builder",
      id: "resume-builder"
    },
    {
      href: "/resume-analyzer",
      icon: <ScanText size={20} />,
      label: "Resume Analyzer",
      id: "resume-analyzer"
    },
    {
      href: "/roadmap",
      icon: <Route size={20} />,
      label: "Career Roadmap",
      id: "roadmap"
    },
    {
      href: "/career",
      icon: <Users size={20} />,
      label: "Community",
      id: "career"
    },
    {
      href: "/algo-visualizer",
      icon: <Activity size={20} />,
      label: "Algorithm Visualizer",
      id: "algo-visualizer"
    },
    {
      href: "/code-snippet",
      icon: <Code size={20} />,
      label: "Code Snippet",
      id: "code-snippet"
    },

    {
      href: "/system-design",
      icon: <BrainCog size={20} />,
      label: "System Design",
      id: "system-design"
    }
  ];

  if (isModerator) {
    sidebarLinks.push({
      href: "/moderator-dashboard",
      icon: <Settings size={20} />,
      label: "Moderator Panel",
      id: "moderator-dashboard"
    });
  }



    return (
        <motion.div
            initial={{ x: isSidebarCollapsed ? -50 : 0, opacity: 0.8 }}
            animate={{
                width: isSidebarCollapsed ? "80px" : "260px",
                x: 0,
                opacity: 1,
            }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed h-full bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950 border-r border-gray-800/40 z-50 backdrop-blur-sm shadow-xl shadow-black/20 overflow-hidden"
        >
            {/* Neural Network Animation Background */}
            <div className="absolute inset-0 opacity-5">
                <div className="neural-network-bg"></div>
            </div>

            <div className="relative z-10 flex flex-col h-full">
                {/* Logo and header section */}
                <div className="flex flex-col border-b border-gray-800/60 bg-gray-900/50 backdrop-blur-sm">
                    {/* Logo and collapse button */}
                    <div className="flex items-center justify-between p-4">
                        <Link
                            href="/"
                            className={`flex items-center gap-3 ${
                                isSidebarCollapsed ? "justify-center" : ""
                            }`}
                        >
                            <motion.div
                                className="relative overflow-hidden rounded-full"
                                animate={{
                                    scale: [1, 1.05, 1],
                                    rotate: [0, 5, -5, 0],
                                }}
                                transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    repeatType: "reverse",
                                }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-primary-100 to-blue-600 rounded-full blur-sm opacity-30 animate-pulse"></div>
                                <div className="relative p-0.5 bg-gradient-to-r from-primary-100 to-blue-600 rounded-full">
                                    <Image
                                        src="/chakrigo-logo.png"
                                        alt="ChakriGO Logo"
                                        width={42}
                                        height={42}
                                        className="rounded-full bg-gray-900"
                                    />
                                </div>
                            </motion.div>
                            {!isSidebarCollapsed && (
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1, duration: 0.3 }}
                                    className="flex-1"
                                >
                                    <h2 className="text-lg font-bold tracking-wide select-none">
                                        <span className="text-primary-100">
                                            Chakri
                                        </span>
                                        <span className="text-white">GO</span>
                                    </h2>
                                </motion.div>
                            )}
                        </Link>
                        
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={toggleSidebar}
                            className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-800/60 transition-colors"
                        >
                            {isSidebarCollapsed ? (
                                <ChevronRight size={18} />
                            ) : (
                                <ChevronLeft size={18} />
                            )}
                        </motion.button>
                    </div>

                    {/* Notification section - better positioned */}
                    {isUserAuth && (
                        <div className={`${isSidebarCollapsed ? 'px-2 pb-4' : 'px-4 pb-4'}`}>
                            <div className="relative">
                                <NotificationMenu collapsed={isSidebarCollapsed} />
                            </div>
                        </div>
                    )}
                </div>

        {/* Navigation Links */}
        <div className="flex-1 py-6 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
          <nav className="px-2 space-y-1.5">
            {sidebarLinks.map((link) => (
              <SidebarLink
                key={link.id}
                href={link.href}
                icon={link.icon}
                label={link.label}
                collapsed={isSidebarCollapsed}
                active={link.id === activeSection}
              />
            ))}

                        <div
                            className={`mt-6 mb-2 ${
                                isSidebarCollapsed ? "mx-2" : "mx-3"
                            }`}
                        >
                            <div className="border-t border-gray-800/40 pt-4"></div>
                        </div>

            <SidebarLink
              href="/help-center"
              icon={<HelpCircle size={20} />}
              label="Help & Support"
              collapsed={isSidebarCollapsed}
              active={activeSection === "help-center"}
            />

          </nav>
        </div>



                {/* User Profile */}
                <div className="p-4 border-t border-gray-800/50 bg-gray-900/50 backdrop-blur-sm">
                    {isUserAuth ? (
                        <div
                            className={`flex items-center ${
                                isSidebarCollapsed
                                    ? "justify-center"
                                    : "justify-between"
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-100 to-blue-600 opacity-30 blur-sm rounded-full"></div>
                                    <div className="h-9 w-9 relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-full flex items-center justify-center border border-gray-700">
                                        <span className="text-white font-semibold text-sm">
                                            {user?.name
                                                ?.charAt(0)
                                                ?.toUpperCase() || "U"}
                                        </span>
                                    </div>
                                </div>
                                {!isSidebarCollapsed && (
                                    <div className="flex items-center justify-between w-full">
                                        <div className="flex flex-col">
                                            <span className="text-white font-medium text-sm truncate max-w-[120px]">
                                                {user?.name}
                                            </span>
                                            <span className="text-gray-400 text-xs truncate max-w-[120px]">
                                                {user?.email}
                                            </span>
                                        </div>

                                        <div className="flex items-center">
                                            <SignOutButton />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <Link
                            href="/sign-in"
                            className={`bg-gradient-to-r from-primary-100 to-blue-600 text-black font-semibold py-2 ${
                                isSidebarCollapsed ? "px-2" : "px-4"
                            } rounded-lg flex items-center justify-center hover:opacity-90 transition-opacity`}
                        >
                            {isSidebarCollapsed ? "In" : "Login"}
                        </Link>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

// Enhanced Sidebar link component
const SidebarLink = ({
  href,
  icon,
  label,
  collapsed,
  active,
  badge,
  isNew
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  collapsed: boolean;
  active: boolean;
  badge?: string;
  isNew?: boolean;
}) => (
    <Link
        href={href}
        className={`flex items-center ${
            collapsed ? "justify-center" : "justify-between"
        } p-3 rounded-lg transition-all duration-200 group relative
      ${
          active
              ? "bg-gradient-to-r from-primary-100/20 to-transparent text-white"
              : "text-gray-400 hover:text-white hover:bg-gray-800/40"
      }`}
    >
        {active && (
            <motion.div
                layoutId="sidebar-active-indicator"
                className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-primary-100 rounded-r-full"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
        )}

    <div className="flex items-center">
      <div className={`relative ${active ? 'text-primary-100' : 'text-gray-400 group-hover:text-primary-100'} transition-colors`}>
        {icon}
      </div>

            {!collapsed && (
                <span
                    className={`ml-3 font-medium ${active ? "text-white" : ""}`}
                >
                    {label}
                </span>
            )}
        </div>

        {!collapsed && badge && (
            <span className="px-2 py-0.5 text-xs bg-primary-100/20 text-primary-100 rounded-full">
                {badge}
            </span>
        )}

        {!collapsed && isNew && (
            <span className="px-1.5 py-0.5 text-[10px] uppercase tracking-wider font-semibold bg-blue-600/30 text-blue-200 rounded-sm">
                New
            </span>
        )}
    </Link>
);

export default GlobalSidebar;