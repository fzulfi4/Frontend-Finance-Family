import { useState, useContext } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, ReceiptText, WalletCards, Target,
  LogOut, Settings, Tags, CalendarClock,
  ChevronLeft, ChevronRight, Sparkles, FileSpreadsheet, HelpCircle
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

const Sidebar = ({ collapsed, onToggle }) => {
  const { logout, user } = useContext(AuthContext);
  const { t } = useTranslation();

  const initials = user?.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  const navItems = [
    { name: t('dashboard'),       path: '/dashboard',         icon: LayoutDashboard, id: 'tour-sidebar-dashboard' },
    { name: t('transactions'),    path: '/transactions',      icon: ReceiptText,     id: 'tour-sidebar-transactions' },
    { name: t('categories'),      path: '/categories',        icon: Tags,            id: 'tour-sidebar-categories' },
    { name: t('debts'),           path: '/debts',             icon: WalletCards,     id: 'tour-sidebar-debts' },
    { name: t('goals'),           path: '/goals',             icon: Target,          id: 'tour-sidebar-goals' },
    { name: t('monthlyExpenses'), path: '/monthly-expenses',  icon: CalendarClock,   id: 'tour-sidebar-expenses' },
    { name: 'Pemasukan Bulanan',  path: '/monthly-incomes',   icon: CalendarClock,   id: 'tour-sidebar-incomes' },
    { name: t('family'),          path: '/family',            icon: Settings,        id: 'tour-sidebar-family' },
    { name: 'Laporan',            path: '/reports',           icon: FileSpreadsheet, accent: true, id: 'tour-sidebar-reports' },
    { name: 'Panduan',            path: '/guide',             icon: HelpCircle,      id: 'tour-sidebar-guide' },
  ];

  return (
    <>
      {/* ── Mobile Bottom Navigation (Floating glass container) ───────────────── */}
      <div className="md:hidden fixed bottom-4 left-4 right-4 z-50 rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-[#090b14]/85 backdrop-blur-2xl">
        <nav className="flex items-center overflow-x-auto scrollbar-none px-3 py-2.5 gap-1.5 justify-between">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              id={item.id}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl
                 text-[0.625rem] font-bold tracking-wide transition-all duration-300 flex-shrink-0 relative ${
                  isActive
                    ? 'text-accent-blue bg-accent-blue/10 shadow-[0_0_12px_rgba(59,130,246,0.15)] border border-accent-blue/15 scale-105'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/5 border border-transparent'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={`transition-transform duration-300 ${isActive ? 'scale-110' : ''}`}>
                    <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                  </span>
                  <span className="leading-none text-center whitespace-nowrap">{item.name}</span>
                </>
              )}
            </NavLink>
          ))}
          <button
            onClick={logout}
            className="flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl
                       text-[0.625rem] font-bold text-gray-400 hover:text-accent-red hover:bg-accent-red/10
                       transition-all duration-300 border border-transparent flex-shrink-0"
          >
            <LogOut size={18} strokeWidth={2} />
            <span className="leading-none">{t('logout')}</span>
          </button>
        </nav>
      </div>

      {/* ── Desktop / Tablet Sidebar ── */}
      <aside
        className={`hidden md:flex flex-col h-screen sticky top-0 shrink-0 transition-all duration-300 ease-in-out
                    border-r border-white/5 ${collapsed ? 'w-[76px]' : 'w-64'}`}
        style={{ background: 'rgba(8, 8, 16, 0.45)', backdropFilter: 'blur(30px)' }}
      >
        {/* Logo and Brand */}
        <div className={`flex items-center h-20 border-b border-white/5 px-5 ${collapsed ? 'justify-center' : 'gap-3.5'}`}>
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-accent-blue to-accent-violet flex items-center justify-center flex-shrink-0 shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all hover:rotate-12">
            <Sparkles size={17} className="text-white" />
          </div>
          {!collapsed && (
            <span className="text-xl font-extrabold text-gradient-brand tracking-tight whitespace-nowrap animate-fade-in">
              FamFinance
            </span>
          )}
        </div>

        {/* Sidebar Nav Items */}
        <nav className={`flex-1 py-6 overflow-y-auto scrollbar-none ${collapsed ? 'px-2' : 'px-4'}`}>
          <div className="space-y-1.5">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                id={item.id}
                title={collapsed ? item.name : undefined}
                className={({ isActive }) =>
                  `relative flex items-center rounded-xl font-semibold transition-all duration-200 group
                   ${collapsed ? 'justify-center w-full h-12' : 'gap-3.5 px-4 py-3'}
                   ${isActive
                     ? item.accent
                       ? 'bg-accent-green/10 text-accent-green shadow-[0_0_12px_rgba(16,185,129,0.12)] border border-accent-green/15'
                       : 'bg-accent-blue/10 text-accent-blue shadow-[0_0_12px_rgba(59,130,246,0.12)] border border-accent-blue/15'
                     : 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent'
                   }`
                }
              >
                {({ isActive }) => (
                  <>
                    {/* Active glow indicator line */}
                    {isActive && !collapsed && (
                      <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full ${
                        item.accent
                          ? 'bg-accent-green shadow-[0_0_8px_#10b981]'
                          : 'bg-accent-blue shadow-[0_0_8px_#3b82f6]'
                      }`} />
                    )}
                    <item.icon size={19} strokeWidth={isActive ? 2.25 : 1.75} className="flex-shrink-0" />
                    {!collapsed && (
                      <span className="text-sm tracking-wide">{item.name}</span>
                    )}
                    {/* New badge for Laporan */}
                    {item.accent && !collapsed && !isActive && (
                      <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-accent-green/15 text-accent-green border border-accent-green/25">NEW</span>
                    )}
                    {/* Tooltip for collapsed mode */}
                    {collapsed && (
                      <div className="absolute left-full ml-4 px-3 py-2 bg-[#0c0f1d] border border-white/10
                                      rounded-xl text-xs font-bold text-white whitespace-nowrap
                                      opacity-0 scale-95 origin-left group-hover:opacity-100 group-hover:scale-100
                                      pointer-events-none transition-all duration-200 shadow-2xl z-50">
                        {item.name}
                      </div>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Bottom Section */}
        <div className={`border-t border-white/5 py-4 space-y-2 ${collapsed ? 'px-2' : 'px-4'}`}>
          
          {/* User Profile Info card */}
          <NavLink
            to="/family"
            title={collapsed ? t('family') : undefined}
            className={({ isActive }) =>
              `flex items-center rounded-2xl transition-all duration-200 group
               ${collapsed ? 'justify-center w-full h-12' : 'gap-3 px-3 py-2.5'}
               ${isActive ? 'bg-white/8 border border-white/10' : 'hover:bg-white/5 border border-transparent'}`
            }
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent-blue/20 to-accent-violet/20
                            border border-accent-blue/30 flex items-center justify-center
                            text-xs font-bold text-accent-blue flex-shrink-0 shadow-[0_0_10px_rgba(59,130,246,0.15)]">
              {initials}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0 animate-fade-in">
                <p className="text-sm font-bold text-white truncate">{user?.full_name || 'User'}</p>
                <p className="text-[11px] text-gray-500 font-semibold truncate uppercase tracking-wider">{user?.role || 'Member'}</p>
              </div>
            )}
          </NavLink>

          {/* Language Switcher */}
          {!collapsed && (
            <div className="px-1 animate-fade-in">
              <LanguageSwitcher />
            </div>
          )}

          {/* Logout Button */}
          <button
            onClick={logout}
            title={collapsed ? t('logout') : undefined}
            className={`w-full flex items-center rounded-xl text-gray-400 text-sm font-semibold
                        hover:bg-accent-red/10 hover:text-accent-red transition-all duration-200 group relative
                        ${collapsed ? 'justify-center h-11' : 'gap-3.5 px-4 py-2.5'}`}
          >
            <LogOut size={18} strokeWidth={1.75} className="flex-shrink-0" />
            {!collapsed && <span className="tracking-wide">{t('logout')}</span>}
            {collapsed && (
              <div className="absolute left-full ml-4 px-3 py-2 bg-[#0c0f1d] border border-white/10
                              rounded-xl text-xs font-bold text-accent-red whitespace-nowrap
                              opacity-0 scale-95 origin-left group-hover:opacity-100 group-hover:scale-100
                              pointer-events-none transition-all duration-200 shadow-2xl z-50">
                {t('logout')}
              </div>
            )}
          </button>

          {/* Collapse sidebar button */}
          <button
            onClick={onToggle}
            className={`w-full flex items-center rounded-xl text-gray-500 text-xs font-semibold
                        hover:bg-white/5 hover:text-gray-300 transition-all duration-200
                        ${collapsed ? 'justify-center h-10' : 'gap-3 px-4 py-2'}`}
          >
            {collapsed ? <ChevronRight size={16} /> : (
              <>
                <ChevronLeft size={16} />
                <span className="tracking-wide">Collapse Sidebar</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
