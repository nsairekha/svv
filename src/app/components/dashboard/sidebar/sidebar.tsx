'use client'

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  HiHome, 
  HiUpload, 
  HiPhotograph, 
  HiChartBar, 
  HiUser,
  HiUsers,
  HiTrendingUp,
  HiHeart,
  HiCog,
  HiUserGroup,
  HiBell,
  HiCheckCircle,
  HiClock,
  HiRefresh,
  HiClipboardList,
  HiBriefcase
} from 'react-icons/hi';
import { HiWrenchScrewdriver } from 'react-icons/hi2';
import { PiCoin } from 'react-icons/pi';
import { usePoints } from '@/contexts/PointsContext';

import './sidebar.css'

// Icon Component using React Icons
const IconComponent = ({ icon: IconElement }: { icon: React.ComponentType<any> }) => (
  <IconElement className="sidebar-icon text-lg" />
);

// Organization Sidebar Options
const OrganizationSidebarOptions = [
  {
    name: 'Dashboard',
    link: '/dashboard',
    icon: () => <IconComponent icon={HiHome} />
  },
  {
    name: 'Report Issue',
    link: '/dashboard?tab=upload',
    icon: () => <IconComponent icon={HiUpload} />
  },
  {
    name: 'View Reports',
    link: '/dashboard?tab=gallery',
    icon: () => <IconComponent icon={HiPhotograph} />
  },
  {
    name: 'Civic Points',
    link: '/points',
    icon: () => <IconComponent icon={HiTrendingUp} />
  },
  // {
  //   name: 'Analytics',
  //   link: '/dashboard/analytics',
  //   icon: () => <IconComponent icon={HiChartBar} />
  // },
  {
    name: 'Profile',
    link: '/profile',
    icon: () => <IconComponent icon={HiUser} />
  }
];

// Admin Sidebar Options
const AdminSidebarOptions = [
  {
    name: 'Dashboard',
    link: '/admin/dashboard',
    icon: () => <IconComponent icon={HiHome} />
  },
  {
    name: 'Report Issue',
    link: '/dashboard?tab=upload',
    icon: () => <IconComponent icon={HiUpload} />
  },
  {
    name: 'View Reports',
    link: '/dashboard?tab=gallery',
    icon: () => <IconComponent icon={HiPhotograph} />
  },
  {
    name: 'All Reports',
    link: '/admin/reports',
    icon: () => <IconComponent icon={HiChartBar} />
  },
  {
    name: 'Users',
    link: '/admin/users',
    icon: () => <IconComponent icon={HiUsers} />
  },
  {
    name: 'Analytics',
    link: '/admin/analytics',
    icon: () => <IconComponent icon={HiTrendingUp} />
  },
];

// Super Admin Sidebar Options
const SuperAdminSidebarOptions = [
  {
    name: 'Dashboard',
    link: '/admin/dashboard',
    icon: () => <IconComponent icon={HiHome} />
  },
  {
    name: 'Report Issue',
    link: '/dashboard?tab=upload',
    icon: () => <IconComponent icon={HiUpload} />
  },
  {
    name: 'View Reports',
    link: '/dashboard?tab=gallery',
    icon: () => <IconComponent icon={HiPhotograph} />
  },
  {
    name: 'All Reports',
    link: '/admin/reports',
    icon: () => <IconComponent icon={HiChartBar} />
  },
  {
    name: 'Users',
    link: '/admin/users',
    icon: () => <IconComponent icon={HiUsers} />
  },
  {
    name: 'Contractors',
    link: '/admin/contractors',
    icon: () => <IconComponent icon={HiUserGroup} />
  },
  {
    name: 'Analytics',
    link: '/admin/analytics',
    icon: () => <IconComponent icon={HiTrendingUp} />
  }
];

// Contractor Sidebar Options
const ContractorSidebarOptions = [
  {
    name: 'Dashboard',
    link: '/contractor/dashboard',
    icon: () => <IconComponent icon={HiHome} />
  },
  {
    name: 'Available Jobs',
    link: '/contractor/jobs?status=pending',
    icon: () => <IconComponent icon={HiBriefcase} />
  },
  {
    name: 'Assigned Issues',
    link: '/contractor/jobs?status=assigned',
    icon: () => <IconComponent icon={HiClipboardList} />
  },
  {
    name: 'In Progress',
    link: '/contractor/jobs?status=in-progress',
    icon: () => <IconComponent icon={HiClock} />
  },
  {
    name: 'Completed Issues',
    link: '/contractor/jobs?status=completed',
    icon: () => <IconComponent icon={HiCheckCircle} />
  },
  {
    name: 'Reopened Issues',
    link: '/contractor/jobs?status=reopened',
    icon: () => <IconComponent icon={HiRefresh} />
  },
  {
    name: 'Notifications',
    link: '/contractor/notifications',
    icon: () => <IconComponent icon={HiBell} />
  },
  {
    name: 'Profile',
    link: '/profile',
    icon: () => <IconComponent icon={HiUser} />
  },
  {
    name: 'Settings',
    link: '/settings',
    icon: () => <IconComponent icon={HiCog} />
  }
];

const sidebar = ({ role }: { role: string }) => {
  const pathname = usePathname()
  const { totalPoints, availablePoints, loading } = usePoints()
  
  const isActiveLink = (link: string) => {
    if (link === '/dashboard' && pathname === '/dashboard') return true
    if (link !== '/dashboard' && pathname.startsWith(link)) return true
    return false
  }

  return (
    <div className="SidebarComponent">
        <div className="SidebarComponent-in glass-card shadow-xl">
            <div className="sidebar-header">
                <h2 className="text-sm font-bold text-gray-400 px-6 py-4 uppercase tracking-widest">Workspace</h2>
            </div>
            <div className="sidebar-one">
                {role === "organization" && OrganizationSidebarOptions.map((option) => (
                    <div 
                        className={`sidebar-option hover-lift ${isActiveLink(option.link) ? 'active gradient-primary shadow-lg' : ''}`} 
                        key={option.name}
                    >
                        <Link href={option.link}>
                            <option.icon />
                            {option.name}
                        </Link>
                    </div>
                ))}
                {role === "admin" && AdminSidebarOptions.map((option) => (
                    <div 
                        className={`sidebar-option hover-lift ${isActiveLink(option.link) ? 'active gradient-primary shadow-lg' : ''}`} 
                        key={option.name}
                    >
                        <Link href={option.link}>
                            <option.icon />
                            {option.name}
                        </Link>
                    </div>
                ))}
                {role === "super_admin" && SuperAdminSidebarOptions.map((option) => (
                    <div 
                        className={`sidebar-option hover-lift ${isActiveLink(option.link) ? 'active gradient-primary shadow-lg' : ''}`} 
                        key={option.name}
                    >
                        <Link href={option.link}>
                            <option.icon />
                            {option.name}
                        </Link>
                    </div>
                ))}
                {role === "contractor" && ContractorSidebarOptions.map((option) => (
                    <div 
                        className={`sidebar-option hover-lift ${isActiveLink(option.link) ? 'active gradient-primary shadow-lg' : ''}`} 
                        key={option.name}
                    >
                        <Link href={option.link}>
                            <option.icon />
                            {option.name}
                        </Link>
                    </div>
                ))}
            </div>
            <div className="sidebar-footer">
                <div className="civic-score-widget">
                    <div className="text-center p-6 glass-card border border-white/20 rounded-2xl mx-3 shadow-inner hover-lift">
                        <div className="flex items-center justify-center gap-2 text-xs font-bold text-indigo-500 mb-3 uppercase tracking-tighter">
                            <PiCoin className="text-xl" />
                            Prestige Points
                        </div>
                        {loading ? (
                            <div className="text-2xl font-black text-gray-200">...</div>
                        ) : (
                            <div className="text-3xl font-black text-gradient">{availablePoints}</div>
                        )}
                        <div className="text-[10px] font-bold text-gray-400 mt-2 opacity-50">LIFETIME: {totalPoints} PTS</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}

export default sidebar