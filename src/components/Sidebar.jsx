import { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ReceiptText, WalletCards, Target, LogOut, User, Settings, Tags, CalendarClock } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

const Sidebar = () => {
  const { logout } = useContext(AuthContext);
  const { t } = useTranslation();

  const navItems = [
    { name: t('dashboard'),       path: '/dashboard',         icon: LayoutDashboard },
    { name: t('transactions'),    path: '/transactions',      icon: ReceiptText },
    { name: t('categories'),      path: '/categories',        icon: Tags },
    { name: t('debts'),           path: '/debts',             icon: WalletCards },
    { name: t('goals'),           path: '/goals',             icon: Target },
    { name: t('monthlyExpenses'), path: '/monthly-expenses',  icon: CalendarClock },
    { name: t('family'),          path: '/family',            icon: Settings },
  ];

  return (
    <>
      {/* ── Mobile Bottom Navigation ─────────────────────────────────────── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a0c]/95 backdrop-blur-lg border-t border-white/10 pb-safe">
        {/* Horizontally scrollable nav strip */}
        <nav className="flex items-center overflow-x-auto scrollbar-none px-1 py-1 gap-0.5">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 min-w-[68px] px-2 py-2.5 rounded-xl text-[0.65rem] font-medium transition-all duration-200 flex-shrink-0 ${
                  isActive
                    ? 'text-accent-blue bg-accent-blue/10'
                    : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                }`
              }
            >
              <item.icon size={20} strokeWidth={1.75} />
              <span className="leading-none text-center whitespace-nowrap">{item.name}</span>
            </NavLink>
          ))}
          {/* Logout squeezed in at end */}
          <button
            onClick={logout}
            className="flex flex-col items-center justify-center gap-1 min-w-[68px] px-2 py-2.5 rounded-xl text-[0.65rem] font-medium text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 flex-shrink-0"
          >
            <LogOut size={20} strokeWidth={1.75} />
            <span className="leading-none">{t('logout')}</span>
          </button>
        </nav>
      </div>

      {/* ── Desktop Sidebar ───────────────────────────────────────────────── */}
      <aside className="hidden md:flex flex-col w-64 h-screen border-r border-white/10 bg-[#0a0a0c]/50 backdrop-blur-md sticky top-0 shrink-0">
        <div className="p-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-accent-blue to-accent-green bg-clip-text text-transparent mb-10">
            FamFinance
          </h1>
          
          <nav className="flex flex-col gap-1.5">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                    isActive 
                      ? 'bg-accent-blue/10 text-accent-blue border-l-2 border-accent-blue' 
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`
                }
              >
                <item.icon size={20} />
                <span className="text-sm">{item.name}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-white/10 space-y-4">
          <NavLink 
            to="/family"
            className={({ isActive }) => 
              `flex items-center gap-3 p-2 -mx-2 rounded-xl transition-all duration-200 ${
                isActive ? 'bg-white/10' : 'hover:bg-white/5'
              }`
            }
          >
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-gray-300 shrink-0">
              <User size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{t('family')}</p>
              <p className="text-xs text-gray-500">Settings</p>
            </div>
            <Settings size={16} className="text-gray-400 shrink-0" />
          </NavLink>
          
          <LanguageSwitcher />

          <button 
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-gray-400 text-sm font-medium hover:bg-red-500/10 hover:text-accent-red transition-all duration-200"
          >
            <LogOut size={18} />
            {t('logout')}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
