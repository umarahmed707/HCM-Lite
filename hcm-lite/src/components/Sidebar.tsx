import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { User, Role } from '../types';
import {
  LayoutDashboard,
  Users,
  Clock,
  Calendar,
  CircleDollarSign,
  Bot,
  Megaphone,
  FileText,
  UserCheck,
  LogOut,
  Building2,
} from 'lucide-react';

interface SidebarProps {
  user: User;
}

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
  roles: Role[];
}

export default function Sidebar({ user }: SidebarProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navItems: NavItem[] = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'HR', 'EMPLOYEE'] },
    { label: 'Employees', path: '/employees', icon: Users, roles: ['ADMIN', 'HR'] },
    { label: 'Attendance', path: '/attendance', icon: Clock, roles: ['ADMIN', 'HR', 'EMPLOYEE'] },
    { label: 'Leave', path: '/leave', icon: Calendar, roles: ['ADMIN', 'HR', 'EMPLOYEE'] },
    { label: 'Payroll', path: '/payroll', icon: CircleDollarSign, roles: ['ADMIN', 'HR', 'EMPLOYEE'] },
    { label: 'AI Assistant', path: '/ai-assistant', icon: Bot, roles: ['ADMIN', 'HR', 'EMPLOYEE'] },
    { label: 'Announcements', path: '/announcements', icon: Megaphone, roles: ['ADMIN', 'HR', 'EMPLOYEE'] },
    { label: 'Audit Logs', path: '/audit-logs', icon: FileText, roles: ['ADMIN'] },
    { label: 'My Profile', path: '/profile', icon: UserCheck, roles: ['EMPLOYEE'] },
  ];

  const filteredNav = navItems.filter((item) => item.roles.includes(user.role));

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 h-screen sticky top-0">
      <div>
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-lg">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-white text-lg tracking-wide">HCM Lite</h1>
            <p className="text-xs text-indigo-400 font-semibold">{user.role} PORTAL</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1">
          {filteredNav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-slate-800">
        <div className="mb-3 px-2">
          <p className="text-xs text-slate-500">Signed in as</p>
          <p className="text-sm font-medium text-slate-200 truncate">{user.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-sm font-medium transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}