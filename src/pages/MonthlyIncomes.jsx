import { useMemo, useState } from 'react';
import {
  CalendarClock, Plus, ShieldCheck, ShieldAlert,
  Edit2, TrendingUp, Info, Wallet2, X
} from 'lucide-react';
import { useMonthlyIncomes } from '../hooks/useMonthlyIncomes';
import { useWallets } from '../hooks/useWallets';
import Card from '../components/ui/Card';
import MonthlyIncomeModal from '../components/MonthlyIncomeModal';

const MonthlyIncomes = () => {
  const { incomes, loading, createIncome, updateIncome, deleteIncome } = useMonthlyIncomes();
  const { wallets } = useWallets();
  const [selectedIncome, setSelectedIncome] = useState(null);
  const [isModalOpen, setIsModalOpen]       = useState(false);
  const [filterWallet, setFilterWallet]       = useState('');

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

  const filteredIncomes = useMemo(() => {
    if (!filterWallet) return incomes;
    return incomes.filter(e => e.account_id === filterWallet || !e.account_id);
  }, [incomes, filterWallet]);

  const fixedIncomes    = useMemo(() => filteredIncomes.filter(e => e.priority === 'fixed'),    [filteredIncomes]);
  const optionalIncomes = useMemo(() => filteredIncomes.filter(e => e.priority === 'optional'), [filteredIncomes]);

  const totals = useMemo(() => {
    const fixed    = fixedIncomes.reduce((acc, e)    => acc + (e.is_active ? e.amount : 0), 0);
    const optional = optionalIncomes.reduce((acc, e) => acc + (e.is_active ? e.amount : 0), 0);
    return { fixed, optional, total: fixed + optional };
  }, [fixedIncomes, optionalIncomes]);

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-white/10 border-t-accent-green rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-gray-500">Memuat pemasukan bulanan...</p>
      </div>
    </div>
  );

  const IncomeItem = ({ income }) => (
    <div className={`flex items-center justify-between px-4 md:px-5 py-4 hover:bg-white/[0.02] transition-colors group border-b border-white/[0.04] last:border-0 ${!income.is_active ? 'opacity-45' : ''}`}>
      <div className="flex items-center gap-3.5 flex-1 min-w-0">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${
          income.priority === 'fixed' 
            ? 'bg-accent-green/10 text-accent-green border-accent-green/15 shadow-[0_0_8px_rgba(16,185,129,0.1)]' 
            : 'bg-accent-amber/10 text-accent-amber border-accent-amber/15 shadow-[0_0_8px_rgba(245,158,11,0.1)]'
        }`}>
          <CalendarClock size={17} />
        </div>
        <div className="min-w-0">
          <p className="font-bold text-sm text-gray-200 truncate">{income.name}</p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {income.category?.name && (
              <span 
                className="px-2 py-0.2 rounded-full font-bold text-[9px] uppercase tracking-wider border"
                style={{ 
                  color: income.category.color || '#6b7280', 
                  backgroundColor: `${income.category.color || '#6b7280'}10`,
                  borderColor: `${income.category.color || '#6b7280'}25`
                }}
              >
                {income.category.name}
              </span>
            )}
            <span className={`badge text-[9px] uppercase tracking-wider ${income.priority === 'fixed' ? 'badge-green' : 'badge-amber'}`}>
              {income.priority === 'fixed' ? 'Pasti' : 'Opsional'}
            </span>
            {income.account?.name ? (
              <span className="text-[9px] font-bold text-accent-blue bg-accent-blue/10 border border-accent-blue/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                💳 {income.account.name}
              </span>
            ) : (
              <span className="text-[9px] font-bold text-gray-500 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
                🌐 Global
              </span>
            )}
            {!income.is_active && <span className="badge badge-red text-[9px] uppercase tracking-wider">Nonaktif</span>}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3.5 flex-shrink-0 ml-3">
        <p className="font-extrabold text-sm text-white">{formatCurrency(income.amount)}</p>
        <button
          onClick={() => { setSelectedIncome(income); setIsModalOpen(true); }}
          className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-all border border-transparent hover:border-white/5 cursor-pointer"
        >
          <Edit2 size={13} />
        </button>
      </div>
    </div>
  );

  const IncomeSection = ({ title, icon: Icon, iconClass, items, emptyText }) => (
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
            {items.map(e => <IncomeItem key={e.id} income={e} />)}
          </div>
        )}
      </Card>
    </div>
  );

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 pb-safe animate-fade-in">

      {/* Header */}
      <header className="page-header relative overflow-hidden p-6 rounded-3xl bg-gradient-to-r from-accent-green/10 via-accent-blue/5 to-transparent border border-white/5 backdrop-blur-xl">
        <div className="absolute -right-16 -top-16 w-48 h-48 bg-accent-green/10 rounded-full blur-3xl pointer-events-none" />
        <div>
          <h1 className="page-title flex items-center gap-2.5">
            <CalendarClock size={24} className="text-accent-green animate-pulse" />
            Pemasukan Bulanan
          </h1>
          <p className="page-subtitle">Kelola rencana target pemasukan rutin keluarga</p>
        </div>
        <button
          onClick={() => { setSelectedIncome(null); setIsModalOpen(true); }}
          className="btn btn-primary flex-shrink-0 mt-3 sm:mt-0 shadow-lg active:scale-95 transition-all"
        >
          <Plus size={18} />
          <span>Tambah</span>
        </button>
      </header>

      {/* Wallet Filter */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5 bg-[#080810]/60 border border-white/10 rounded-2xl px-4 py-2.5 flex-1 max-w-xs focus-within:border-accent-violet/50 transition-colors">
          <Wallet2 size={15} className="text-gray-500 flex-shrink-0" />
          <select
            className="bg-transparent text-sm text-gray-200 flex-1 outline-none appearance-none cursor-pointer min-w-0 select-reset"
            value={filterWallet}
            onChange={(e) => setFilterWallet(e.target.value)}
          >
            <option value="" className="bg-[#0f0f1a]">🌐 Semua Dompet</option>
            {wallets.map(w => (
              <option key={w.id} value={w.id} className="bg-[#0f0f1a]">💳 {w.name}</option>
            ))}
          </select>
        </div>
        {filterWallet && (
          <button
            onClick={() => setFilterWallet('')}
            className="btn btn-icon btn-secondary rounded-2xl p-3 hover:text-accent-red"
            title="Hapus filter"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-5 flex items-center gap-4 bg-gradient-to-br from-[#123722]/60 to-transparent border-emerald-500/10 hover:border-accent-green/20">
          <div className="w-11 h-11 rounded-2xl bg-accent-green/10 text-accent-green flex items-center justify-center flex-shrink-0 border border-accent-green/20 shadow-inner">
            <ShieldCheck size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Total Pasti</p>
            <p className="font-extrabold text-accent-green text-lg truncate tracking-tight mt-0.5">{formatCurrency(totals.fixed)}</p>
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
        <div className="card p-5 flex items-center gap-4 bg-gradient-to-br from-[#1b253c]/60 to-transparent border-blue-500/10 hover:border-accent-blue/20">
          <div className="w-11 h-11 rounded-2xl bg-accent-blue/10 text-accent-blueLt flex items-center justify-center flex-shrink-0 border border-blue-500/20 shadow-inner">
            <TrendingUp size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Grand Total</p>
            <p className="font-extrabold text-accent-blueLt text-lg truncate tracking-tight mt-0.5">{formatCurrency(totals.total)}</p>
          </div>
        </div>
      </div>

      {/* Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <IncomeSection
          title="Pemasukan Pasti"
          icon={ShieldCheck}
          iconClass="text-accent-green"
          items={fixedIncomes}
          emptyText="Belum ada rencana pemasukan pasti."
        />
        <IncomeSection
          title="Pemasukan Opsional"
          icon={ShieldAlert}
          iconClass="text-accent-amber"
          items={optionalIncomes}
          emptyText="Belum ada rencana pemasukan opsional."
        />
      </div>

      <MonthlyIncomeModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedIncome(null); }}
        income={selectedIncome}
        createIncome={createIncome}
        updateIncome={updateIncome}
        deleteIncome={deleteIncome}
      />
    </div>
  );
};

export default MonthlyIncomes;
