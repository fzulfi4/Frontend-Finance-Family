import { useMemo, useState } from 'react';
import {
  CalendarClock, Plus, ShieldCheck, ShieldAlert,
  Edit2, TrendingDown, Info
} from 'lucide-react';
import { useMonthlyExpenses } from '../hooks/useMonthlyExpenses';
import Card from '../components/ui/Card';
import MonthlyExpenseModal from '../components/MonthlyExpenseModal';

const MonthlyExpenses = () => {
  const { expenses, loading, createExpense, updateExpense, deleteExpense } = useMonthlyExpenses();
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [isModalOpen, setIsModalOpen]         = useState(false);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

  const fixedExpenses    = useMemo(() => expenses.filter(e => e.priority === 'fixed'),    [expenses]);
  const optionalExpenses = useMemo(() => expenses.filter(e => e.priority === 'optional'), [expenses]);

  const totals = useMemo(() => {
    const fixed    = fixedExpenses.reduce((acc, e)    => acc + (e.is_active ? e.amount : 0), 0);
    const optional = optionalExpenses.reduce((acc, e) => acc + (e.is_active ? e.amount : 0), 0);
    return { fixed, optional, total: fixed + optional };
  }, [fixedExpenses, optionalExpenses]);

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-white/10 border-t-accent-blue rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-gray-500">Memuat pengeluaran bulanan...</p>
      </div>
    </div>
  );

  const ExpenseItem = ({ expense }) => (
    <div className={`flex items-center justify-between px-4 md:px-5 py-4 hover:bg-white/[0.02] transition-colors group border-b border-white/[0.04] last:border-0 ${!expense.is_active ? 'opacity-45' : ''}`}>
      <div className="flex items-center gap-3.5 flex-1 min-w-0">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${
          expense.priority === 'fixed' 
            ? 'bg-accent-blue/10 text-accent-blueLt border-accent-blue/15 shadow-[0_0_8px_rgba(59,130,246,0.1)]' 
            : 'bg-accent-amber/10 text-accent-amber border-accent-amber/15 shadow-[0_0_8px_rgba(245,158,11,0.1)]'
        }`}>
          <CalendarClock size={17} />
        </div>
        <div className="min-w-0">
          <p className="font-bold text-sm text-gray-200 truncate">{expense.name}</p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {expense.category?.name && (
              <span 
                className="px-2 py-0.2 rounded-full font-bold text-[9px] uppercase tracking-wider border"
                style={{ 
                  color: expense.category.color || '#6b7280', 
                  backgroundColor: `${expense.category.color || '#6b7280'}10`,
                  borderColor: `${expense.category.color || '#6b7280'}25`
                }}
              >
                {expense.category.name}
              </span>
            )}
            <span className={`badge text-[9px] uppercase tracking-wider ${expense.priority === 'fixed' ? 'badge-blue' : 'badge-amber'}`}>
              {expense.priority === 'fixed' ? 'Pasti' : 'Opsional'}
            </span>
            {expense.account?.name ? (
              <span className="text-[9px] font-bold text-accent-blue bg-accent-blue/10 border border-accent-blue/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                💳 {expense.account.name}
              </span>
            ) : (
              <span className="text-[9px] font-bold text-gray-500 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
                🌐 Global
              </span>
            )}
            {!expense.is_active && <span className="badge badge-red text-[9px] uppercase tracking-wider">Nonaktif</span>}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3.5 flex-shrink-0 ml-3">
        <p className="font-extrabold text-sm text-white">{formatCurrency(expense.amount)}</p>
        <button
          onClick={() => { setSelectedExpense(expense); setIsModalOpen(true); }}
          className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-all border border-transparent hover:border-white/5 cursor-pointer"
        >
          <Edit2 size={13} />
        </button>
      </div>
    </div>
  );

  const ExpenseSection = ({ title, icon: Icon, iconClass, items, emptyText }) => (
    <div className="space-y-3.5">
      <div className="flex items-center gap-2.5 px-1.5">
        <Icon size={18} className={iconClass} />
        <h2 className="font-bold text-sm text-gray-300">{title}</h2>
        <span className="ml-auto text-[10px] text-gray-500 bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
          {items.length} items
        </span>
      </div>
      <Card className="p-0 overflow-hidden bg-[#0c0e1b]/55 border-white/5 shadow-2xl">
        {items.length === 0 ? (
          <div className="py-12 text-center bg-black/10">
            <Info size={30} className="mx-auto mb-2 text-gray-600 animate-float" />
            <p className="text-sm text-gray-500 font-bold">{emptyText}</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {items.map(e => <ExpenseItem key={e.id} expense={e} />)}
          </div>
        )}
      </Card>
    </div>
  );

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 pb-safe animate-fade-in">

      {/* Header */}
      <header className="page-header relative overflow-hidden p-6 rounded-3xl bg-gradient-to-r from-accent-blue/10 via-accent-violet/5 to-transparent border border-white/5 backdrop-blur-xl">
        <div className="absolute -right-16 -top-16 w-48 h-48 bg-accent-blue/10 rounded-full blur-3xl pointer-events-none" />
        <div>
          <h1 className="page-title flex items-center gap-2.5">
            <CalendarClock size={24} className="text-accent-blue animate-pulse" />
            Pengeluaran Bulanan
          </h1>
          <p className="page-subtitle">Kelola rencana limit anggaran rutin keluarga</p>
        </div>
        <button
          onClick={() => { setSelectedExpense(null); setIsModalOpen(true); }}
          className="btn btn-primary flex-shrink-0 mt-3 sm:mt-0 shadow-lg active:scale-95 transition-all"
        >
          <Plus size={18} />
          <span>Tambah</span>
        </button>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-5 flex items-center gap-4 bg-gradient-to-br from-[#121c37]/60 to-transparent border-blue-500/10 hover:border-accent-blue/20">
          <div className="w-11 h-11 rounded-2xl bg-accent-blue/10 text-accent-blueLt flex items-center justify-center flex-shrink-0 border border-accent-blue/20 shadow-inner">
            <ShieldCheck size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Total Pasti</p>
            <p className="font-extrabold text-accent-blueLt text-lg truncate tracking-tight mt-0.5">{formatCurrency(totals.fixed)}</p>
          </div>
        </div>
        <div className="card p-5 flex items-center gap-4 bg-gradient-to-br from-[#302114]/60 to-transparent border-accent-amber/10 hover:border-accent-amber/20">
          <div className="w-11 h-11 rounded-2xl bg-accent-amber/10 text-accent-amber flex items-center justify-center flex-shrink-0 border border-accent-amber/20 shadow-inner">
            <ShieldAlert size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Total Opsional</p>
            <p className="font-extrabold text-accent-amber text-lg truncate tracking-tight mt-0.5">{formatCurrency(totals.optional)}</p>
          </div>
        </div>
        <div className="card p-5 flex items-center gap-4 bg-gradient-to-br from-[#241738]/60 to-transparent border-purple-500/10 hover:border-purple-500/20">
          <div className="w-11 h-11 rounded-2xl bg-accent-violet/10 text-accent-violet flex items-center justify-center flex-shrink-0 border border-purple-500/20 shadow-inner">
            <TrendingDown size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Grand Total</p>
            <p className="font-extrabold text-accent-violet text-lg truncate tracking-tight mt-0.5">{formatCurrency(totals.total)}</p>
          </div>
        </div>
      </div>

      {/* Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ExpenseSection
          title="Pengeluaran Pasti"
          icon={ShieldCheck}
          iconClass="text-accent-blueLt"
          items={fixedExpenses}
          emptyText="Belum ada pengeluaran pasti."
        />
        <ExpenseSection
          title="Pengeluaran Opsional"
          icon={ShieldAlert}
          iconClass="text-accent-amber"
          items={optionalExpenses}
          emptyText="Belum ada pengeluaran opsional."
        />
      </div>

      <MonthlyExpenseModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedExpense(null); }}
        expense={selectedExpense}
        createExpense={createExpense}
        updateExpense={updateExpense}
        deleteExpense={deleteExpense}
      />
    </div>
  );
};

export default MonthlyExpenses;
