import { useMemo, useState } from 'react';
import { 
  CalendarClock, Plus, ShieldCheck, ShieldAlert, 
  Wallet2, MoreVertical, Edit2, Trash2, PieChart,
  CircleDollarSign, TrendingDown, Info
} from 'lucide-react';
import { useMonthlyExpenses } from '../hooks/useMonthlyExpenses';
import Card from '../components/ui/Card';
import MonthlyExpenseModal from '../components/MonthlyExpenseModal';
const MonthlyExpenses = () => {
  const { expenses, loading, createExpense, updateExpense, deleteExpense } = useMonthlyExpenses();

  const [selectedExpense, setSelectedExpense] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

  const fixedExpenses = useMemo(() => expenses.filter(e => e.priority === 'fixed'), [expenses]);
  const optionalExpenses = useMemo(() => expenses.filter(e => e.priority === 'optional'), [expenses]);

  const totals = useMemo(() => {
    const fixed = fixedExpenses.reduce((acc, e) => acc + (e.is_active ? e.amount : 0), 0);
    const optional = optionalExpenses.reduce((acc, e) => acc + (e.is_active ? e.amount : 0), 0);
    return { fixed, optional, total: fixed + optional };
  }, [fixedExpenses, optionalExpenses]);

  if (loading) return <div className="p-8 text-gray-400">Memuat pengeluaran bulanan...</div>;

  const ExpenseItem = ({ expense }) => (
    <div 
      className={`flex items-center justify-between p-4 hover:bg-white/5 transition-all group ${!expense.is_active ? 'opacity-50' : ''}`}
    >
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className={`p-3 rounded-xl ${expense.priority === 'fixed' ? 'bg-blue-500/10 text-accent-blue' : 'bg-orange-500/10 text-orange-400'}`}>
          <CalendarClock size={20} />
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-gray-200 truncate flex items-center gap-2">
            {expense.name}
            {expense.priority === 'fixed' ? (
              <ShieldCheck size={14} className="text-accent-blue opacity-50" />
            ) : (
              <ShieldAlert size={14} className="text-orange-400 opacity-50" />
            )}
          </p>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            {expense.category?.name && (
              <>
                <span>{expense.category.name}</span>
                <span className="w-1 h-1 rounded-full bg-gray-600" />
              </>
            )}
            <span>{expense.priority === 'fixed' ? 'Pasti' : 'Opsional'}</span>
            {!expense.is_active && (
              <>
                <span className="w-1 h-1 rounded-full bg-gray-600" />
                <span className="text-red-400">Nonaktif</span>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <p className="font-bold text-gray-100 whitespace-nowrap">{formatCurrency(expense.amount)}</p>
        <button 
          onClick={() => { setSelectedExpense(expense); setIsModalOpen(true); }}
          className="p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
        >
          <Edit2 size={16} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl md:text-3xl font-bold mb-0.5 truncate">Pengeluaran Bulanan</h1>
          <p className="text-gray-400 text-sm">Kelola pengeluaran rutin keluarga.</p>
        </div>
        <button 
          onClick={() => { setSelectedExpense(null); setIsModalOpen(true); }}
          className="btn btn-primary flex items-center gap-2 flex-shrink-0"
        >
          <Plus size={18} />
          <span className="hidden sm:inline">Tambah</span>
          <span className="sm:hidden">Tambah</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="flex items-center gap-3 bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20 p-4">
          <div className="p-2.5 rounded-xl bg-blue-500/15 flex-shrink-0">
            <ShieldCheck size={20} className="text-accent-blue" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-400 mb-0.5">Total Pasti</p>
            <p className="text-base font-bold text-accent-blue truncate">{formatCurrency(totals.fixed)}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 bg-gradient-to-br from-orange-500/10 to-transparent border-orange-500/20 p-4">
          <div className="p-2.5 rounded-xl bg-orange-500/15 flex-shrink-0">
            <ShieldAlert size={20} className="text-orange-400" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-400 mb-0.5">Total Opsional</p>
            <p className="text-base font-bold text-orange-400 truncate">{formatCurrency(totals.optional)}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 bg-gradient-to-br from-purple-500/10 to-transparent border-purple-500/20 p-4">
          <div className="p-2.5 rounded-xl bg-purple-500/15 flex-shrink-0">
            <TrendingDown size={20} className="text-purple-400" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-400 mb-0.5">Grand Total</p>
            <p className="text-base font-bold text-purple-400 truncate">{formatCurrency(totals.total)}</p>
          </div>
        </Card>
      </div>

      {/* Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fixed Expenses */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-2">
            <ShieldCheck size={18} className="text-accent-blue" />
            <h2 className="font-semibold text-lg">Pengeluaran Pasti</h2>
            <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-full ml-auto">
              {fixedExpenses.length} Items
            </span>
          </div>
          <Card className="p-0 overflow-hidden">
            {fixedExpenses.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <Info size={40} className="mx-auto mb-3 opacity-20" />
                <p className="text-sm">Belum ada pengeluaran pasti.</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {fixedExpenses.map(e => <ExpenseItem key={e.id} expense={e} />)}
              </div>
            )}
          </Card>
        </div>

        {/* Optional Expenses */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-2">
            <ShieldAlert size={18} className="text-orange-400" />
            <h2 className="font-semibold text-lg">Pengeluaran Opsional</h2>
            <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-full ml-auto">
              {optionalExpenses.length} Items
            </span>
          </div>
          <Card className="p-0 overflow-hidden">
            {optionalExpenses.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <Info size={40} className="mx-auto mb-3 opacity-20" />
                <p className="text-sm">Belum ada pengeluaran opsional.</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {optionalExpenses.map(e => <ExpenseItem key={e.id} expense={e} />)}
              </div>
            )}
          </Card>
        </div>
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
