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
    { name: t('dashboard'), path: '/dashboard', icon: LayoutDashboard },
    { name: t('transactions'), path: '/transactions', icon: ReceiptText },
    { name: t('categories'), path: '/categories', icon: Tags },
    { name: t('debts'), path: '/debts', icon: WalletCards },
    { name: t('goals'), path: '/goals', icon: Target },
    { name: t('monthlyExpenses'), path: '/monthly-expenses', icon: CalendarClock },
    { name: t('family'), path: '/family', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-[#0a0a0c]/90 backdrop-blur-md border-t border-white/10 z-50 px-2 py-2 flex justify-around items-center pb-safe">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center p-2 rounded-xl text-[0.7rem] transition-all duration-200 ${
                isActive ? 'text-accent-blue bg-white/5' : 'text-gray-400 hover:text-white'
              }`
            }
          >
            <item.icon size={20} className="mb-1" />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 h-screen border-r border-white/10 bg-[#0a0a0c]/50 backdrop-blur-md sticky top-0">
        <div className="p-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-accent-blue to-accent-green bg-clip-text text-transparent mb-10">
            FamFinance
          </h1>
          
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
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
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-white/10">
          <NavLink 
            to="/family"
            className={({ isActive }) => 
              `flex items-center gap-3 mb-6 p-2 -mx-2 rounded-xl transition-all duration-200 ${
                isActive ? 'bg-white/10' : 'hover:bg-white/5'
              }`
            }
          >
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-gray-300">
              <User size={20} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white m-0">{t('family')}</p>
              <p className="text-xs text-gray-500 m-0">Settings</p>
            </div>
            <Settings size={18} className="text-gray-400" />
          </NavLink>
          
          <div className="mb-4">
            <LanguageSwitcher />
          </div>

          <button 
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-gray-400 font-medium hover:bg-red-500/10 hover:text-accent-red transition-all duration-200"
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
