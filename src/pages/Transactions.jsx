import { useContext, useMemo, useState } from 'react';
import {
  ReceiptText, ArrowUpRight, ArrowDownRight, Edit2,
  TrendingUp, TrendingDown, CalendarDays, X, User2, Wallet2, ArrowRightLeft,
  Download, SlidersHorizontal
} from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useTransactions } from '../hooks/useTransactions';
import { useWallets } from '../hooks/useWallets';
import { useMembers } from '../hooks/useMembers';
import { useMonthlyExpenses } from '../hooks/useMonthlyExpenses';
import { useMonthlyIncomes } from '../hooks/useMonthlyIncomes';
import Card from '../components/ui/Card';
import EditTransactionModal from '../components/EditTransactionModal';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../context/AuthContext';
import { generateTransactionsExcel } from '../utils/excelReport';

// ─── Filter helpers ──────────────────────────────────────────────────────────
const startOf = (date, unit) => {
  const d = new Date(date);
  if (unit === 'day')   { d.setHours(0,0,0,0); return d; }
  if (unit === 'week')  { d.setDate(d.getDate() - d.getDay()); d.setHours(0,0,0,0); return d; }
  if (unit === 'month') { d.setDate(1); d.setHours(0,0,0,0); return d; }
  if (unit === 'year')  { d.setMonth(0,1); d.setHours(0,0,0,0); return d; }
  return d;
};

const PRESETS = [
  { key: 'all',   label: 'Semua' },
  { key: 'today', label: 'Hari Ini' },
  { key: 'week',  label: 'Minggu' },
  { key: 'month', label: 'Bulan' },
  { key: 'year',  label: 'Tahun' },
  { key: 'range', label: 'Periode' },
];

// ─── Main Component ───────────────────────────────────────────────────────────
const Transactions = () => {
  const { transactions, loading, updateTransaction, deleteTransaction } = useTransactions();
  const { wallets } = useWallets();
  const { members } = useMembers();
  const { expenses: monthlyExpenses } = useMonthlyExpenses();
  const { incomes: monthlyIncomes } = useMonthlyIncomes();
  const { user: currentUser } = useContext(AuthContext);
  const { t } = useTranslation();

  const [selectedTx, setSelectedTx] = useState(null);
  const [isEditOpen, setIsEditOpen]  = useState(false);

  const [activePreset, setActivePreset]       = useState('all');
  const [rangeStart, setRangeStart]           = useState(null);
  const [rangeEnd, setRangeEnd]               = useState(null);
  const [showRangePicker, setShowRangePicker] = useState(false);

  const [filterMember, setFilterMember] = useState('');
  const [filterWallet, setFilterWallet] = useState('');

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

  const handleExportExcel = () => {
    if (filtered.length === 0) return;

    // Resolve filter labels
    const periodLabel = activePreset === 'range'
      ? `${rangeStart ? rangeStart.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '...'} - ${rangeEnd ? rangeEnd.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '...'}`
      : activePreset === 'today' ? 'Hari Ini'
      : activePreset === 'week' ? 'Minggu Ini'
      : activePreset === 'month' ? 'Bulan Ini'
      : activePreset === 'year' ? 'Tahun Ini'
      : 'Semua';

    const walletLabel = !filterWallet
      ? 'Semua Dompet'
      : wallets.find(w => w.id === filterWallet)?.name || 'Dompet Terpilih';

    const memberLabel = !filterMember
      ? 'Semua Anggota'
      : members.find(m => m.id === filterMember)?.full_name || 'Anggota Terpilih';

    generateTransactionsExcel({
      transactions: filtered,
      wallets,
      members,
      monthlyExpenses,
      monthlyIncomes,
      activeFilters: {
        period: periodLabel,
        wallet: walletLabel,
        member: memberLabel,
      },
      familyName: currentUser?.family?.name
    });
  };

  const filtered = useMemo(() => {
    const now = new Date();
    return transactions.filter(tx => {
      const d = new Date(tx.transaction_date);
      if (activePreset === 'today' && d < startOf(now, 'day'))  return false;
      if (activePreset === 'week'  && d < startOf(now, 'week')) return false;
      if (activePreset === 'month' && d < startOf(now, 'month')) return false;
      if (activePreset === 'year'  && d < startOf(now, 'year')) return false;
      if (activePreset === 'range') {
        if (rangeStart && d < rangeStart) return false;
        if (rangeEnd) { const end = new Date(rangeEnd); end.setHours(23,59,59,999); if (d > end) return false; }
      }
      if (filterMember && tx.user_id !== filterMember) return false;
      if (filterWallet) {
        if (tx.type === 'transfer') {
          if (tx.account_id !== filterWallet && tx.to_account_id !== filterWallet) return false;
        } else {
          if (tx.account_id !== filterWallet) return false;
        }
      }
      return true;
    });
  }, [transactions, activePreset, rangeStart, rangeEnd, filterMember, filterWallet]);

  const { totalIncome, totalExpense } = useMemo(() =>
    filtered.reduce((acc, tx) => {
      if (tx.type === 'income') acc.totalIncome += tx.amount;
      else if (tx.type === 'expense') acc.totalExpense += tx.amount;
      else if (tx.type === 'transfer' && filterWallet) {
        if (tx.account_id === filterWallet) acc.totalExpense += tx.amount;
        else if (tx.to_account_id === filterWallet) acc.totalIncome += tx.amount;
      }
      return acc;
    }, { totalIncome: 0, totalExpense: 0 }),
  [filtered, filterWallet]);

  const grouped = useMemo(() => {
    const map = new Map();
    filtered.forEach(tx => {
      const d = new Date(tx.transaction_date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!map.has(key)) map.set(key, { label: d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }), items: [], income: 0, expense: 0 });
      const g = map.get(key);
      g.items.push(tx);
      if (tx.type === 'income') g.income += tx.amount;
      else if (tx.type === 'expense') g.expense += tx.amount;
      else if (tx.type === 'transfer' && filterWallet) {
        if (tx.account_id === filterWallet) g.expense += tx.amount;
        else if (tx.to_account_id === filterWallet) g.income += tx.amount;
      }
    });
    return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filtered, filterWallet]);

  const handlePreset = (key) => {
    setActivePreset(key);
    setShowRangePicker(key === 'range');
    if (key !== 'range') { setRangeStart(null); setRangeEnd(null); }
  };

  const rangeLabel = () => {
    if (!rangeStart && !rangeEnd) return 'Periode';
    const fmt = (d) => d?.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    return `${fmt(rangeStart) ?? '...'} – ${fmt(rangeEnd) ?? '...'}`;
  };

  const memberOptions = members.map(m => ({
    value: m.id, label: m.id === currentUser?.id ? `${m.full_name} (Saya)` : m.full_name,
  }));
  const walletOptions = wallets.map(w => ({ value: w.id, label: w.name }));
  const hasActiveFilter = filterMember || filterWallet;

  if (loading) return (
    <div className="p-6 md:p-8 flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-white/10 border-t-accent-blue rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-gray-500">{t('loadingTransactions')}</p>
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 pb-safe">

      {/* Header */}
      <header className="page-header relative overflow-hidden p-6 rounded-3xl bg-gradient-to-r from-accent-blue/10 via-accent-violet/5 to-transparent border border-white/5 backdrop-blur-xl">
        <div className="absolute -right-16 -top-16 w-48 h-48 bg-accent-blue/10 rounded-full blur-3xl pointer-events-none" />
        <div>
          <h1 className="page-title flex items-center gap-2.5">
            <ReceiptText size={24} className="text-accent-blue animate-pulse" />
            {t('transactionHistory')}
          </h1>
          <p className="page-subtitle">{t('allIncomesExpenses')}</p>
        </div>
        {filtered.length > 0 && (
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-4 py-2.5 bg-green-600/12 hover:bg-green-600/22 border border-green-500/20 hover:border-green-500/35 text-green-300 hover:text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer shrink-0 mt-3 sm:mt-0"
          >
            <Download size={14} />
            Ekspor Excel (XLSX)
          </button>
        )}
      </header>

      {/* Period filter pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap">
        {PRESETS.map(p => (
          <button
            key={p.key}
            onClick={() => handlePreset(p.key)}
            className={`filter-chip ${activePreset === p.key ? 'filter-chip-active' : 'filter-chip-inactive'}`}
          >
            {p.key === 'range' && <CalendarDays size={12} />}
            {activePreset === 'range' && p.key === 'range' ? rangeLabel() : p.label}
            {activePreset === 'range' && p.key === 'range' && (rangeStart || rangeEnd) && (
              <X size={12} className="ml-1 hover:text-red-400 p-0.5 bg-white/10 rounded-full" onClick={(e) => { e.stopPropagation(); setRangeStart(null); setRangeEnd(null); }} />
            )}
          </button>
        ))}
      </div>

      {/* Date range picker */}
      {showRangePicker && activePreset === 'range' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 card animate-fade-in bg-[#0e1122]/60 border-white/5">
          <div>
            <label className="input-label">Dari Tanggal</label>
            <DatePicker selected={rangeStart} onChange={d => setRangeStart(d)} selectsStart startDate={rangeStart} endDate={rangeEnd} className="input-field py-2" dateFormat="dd MMM yyyy" placeholderText="Pilih tanggal awal" isClearable />
          </div>
          <div>
            <label className="input-label">Sampai Tanggal</label>
            <DatePicker selected={rangeEnd} onChange={d => setRangeEnd(d)} selectsEnd startDate={rangeStart} endDate={rangeEnd} minDate={rangeStart} className="input-field py-2" dateFormat="dd MMM yyyy" placeholderText="Pilih tanggal akhir" isClearable />
          </div>
        </div>
      )}

      {/* Entity filters */}
      <div className="flex gap-3 items-center">
        <div className="flex items-center gap-2.5 bg-[#080810]/60 border border-white/10 rounded-2xl px-4 py-2.5 flex-1 min-w-0 focus-within:border-accent-violet/50 transition-colors">
          <User2 size={15} className="text-gray-500 flex-shrink-0" />
          <select className="bg-transparent text-sm text-gray-200 flex-1 outline-none appearance-none cursor-pointer min-w-0 select-reset" value={filterMember} onChange={(e) => setFilterMember(e.target.value)}>
            <option value="" className="bg-[#0f0f1a]">Semua Anggota</option>
            {memberOptions.map(o => <option key={o.value} value={o.value} className="bg-[#0f0f1a]">{o.label}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2.5 bg-[#080810]/60 border border-white/10 rounded-2xl px-4 py-2.5 flex-1 min-w-0 focus-within:border-accent-violet/50 transition-colors">
          <Wallet2 size={15} className="text-gray-500 flex-shrink-0" />
          <select className="bg-transparent text-sm text-gray-200 flex-1 outline-none appearance-none cursor-pointer min-w-0 select-reset" value={filterWallet} onChange={(e) => setFilterWallet(e.target.value)}>
            <option value="" className="bg-[#0f0f1a]">Semua Dompet</option>
            {walletOptions.map(o => <option key={o.value} value={o.value} className="bg-[#0f0f1a]">{o.label}</option>)}
          </select>
        </div>
        {hasActiveFilter && (
          <button onClick={() => { setFilterMember(''); setFilterWallet(''); }} className="btn btn-icon btn-secondary rounded-2xl flex-shrink-0 p-3 hover:text-accent-red">
            <X size={16} />
          </button>
        )}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card p-5 flex items-center gap-4 bg-gradient-to-br from-[#0c2f21] to-[#051810] border-emerald-500/10 hover:border-accent-green/20">
          <div className="stat-icon bg-accent-green/10 text-accent-green rounded-2xl border border-accent-green/20 w-11 h-11">
            <TrendingUp size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-400 mb-0.5 uppercase tracking-wider font-bold">Total Pemasukan</p>
            <p className="text-lg font-extrabold text-accent-greenLt truncate">+{formatCurrency(totalIncome)}</p>
          </div>
        </div>
        <div className="card p-5 flex items-center gap-4 bg-gradient-to-br from-[#301614] to-[#180a08] border-red-500/10 hover:border-accent-red/20">
          <div className="stat-icon bg-accent-red/10 text-accent-red rounded-2xl border border-accent-red/20 w-11 h-11">
            <TrendingDown size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-400 mb-0.5 uppercase tracking-wider font-bold">Total Pengeluaran</p>
            <p className="text-lg font-extrabold text-accent-redLt truncate">-{formatCurrency(totalExpense)}</p>
          </div>
        </div>
      </div>

      {/* Transaction list grouped by month */}
      {filtered.length === 0 ? (
        <Card className="p-16 text-center bg-[#0c0e1b]/50 border-white/5">
          <ReceiptText size={44} className="mx-auto mb-4 text-gray-600 animate-float" />
          <p className="text-gray-400 font-bold text-base">{t('noTransactionsFound')}</p>
          <p className="text-xs text-gray-500 mt-1.5">Coba ubah filter atau pilih periode waktu lainnya</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {grouped.map(([key, group]) => (
            <div key={key} className="space-y-3">
              {/* Month header */}
              <div className="flex items-center justify-between mb-1 px-1.5">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-gray-200 capitalize tracking-wide">{group.label}</h2>
                  <span className="text-[10px] font-bold text-gray-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">{group.items.length} transaksi</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs font-bold">
                  {group.income  > 0 && <span className="text-accent-greenLt">+{formatCurrency(group.income)}</span>}
                  {group.expense > 0 && <span className="text-accent-redLt">-{formatCurrency(group.expense)}</span>}
                </div>
              </div>

              <Card className="p-0 overflow-hidden bg-[#0c0e1b]/55 border-white/5 shadow-2xl">
                <div className="divide-y divide-white/[0.04]">
                  {group.items.map(tx => {
                    const isIncome   = tx.type === 'income';
                    const isMine     = tx.user_id === currentUser?.id;
                    const authorName = tx.user?.full_name || 'Tidak diketahui';

                    return (
                      <div
                        key={tx.id}
                        className="flex justify-between items-center p-4 hover:bg-white/[0.03] transition-colors group cursor-default"
                      >
                        <div className="flex items-center gap-3.5 min-w-0 flex-1">
                          {/* Type icon */}
                          <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center border ${
                            tx.type === 'transfer' ? 'bg-blue-500/10 text-accent-blue border-blue-500/15' :
                            isIncome ? 'bg-green-500/10 text-accent-green border-green-500/15' :
                            'bg-red-500/10 text-accent-red border-red-500/15'
                          }`}>
                            {tx.type === 'transfer' ? <ArrowRightLeft size={16} /> : isIncome ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-sm text-gray-200 truncate flex items-center gap-2 group/title">
                              {tx.notes || (tx.type === 'transfer' ? t('transfer') : isIncome ? t('income') : t('expense'))}
                              <button
                                onClick={() => { setSelectedTx(tx); setIsEditOpen(true); }}
                                className="flex-shrink-0 text-gray-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-white/10 cursor-pointer"
                                title={t('edit')}
                              >
                                <Edit2 size={11} />
                              </button>
                            </p>
                            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 items-center">
                              <span className="text-[10px] text-gray-400 font-semibold">
                                {tx.transaction_date ? new Date(tx.transaction_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : t('unknownDate')}
                              </span>
                              {tx.account?.name && (
                                <span className="text-[10px] text-gray-400 flex items-center gap-1 font-semibold bg-white/5 border border-white/10 px-2 py-0.2 rounded-full">
                                  <Wallet2 size={9} className="text-gray-500" />
                                  <span>
                                    {tx.type === 'transfer' && tx.to_account?.name
                                      ? `${tx.account.name} → ${tx.to_account.name}`
                                      : tx.account.name}
                                  </span>
                                </span>
                              )}
                              {tx.category?.name && (
                                <span 
                                  className="px-2 py-0.2 rounded-full font-bold text-[9px] uppercase tracking-wider border"
                                  style={{ color: tx.category.color, backgroundColor: `${tx.category.color}10`, borderColor: `${tx.category.color}25` }}
                                >
                                  {tx.category.name}
                                </span>
                              )}
                              <span className={`text-[10px] flex items-center gap-1 font-bold ${isMine ? 'text-accent-blue' : 'text-gray-500'}`}>
                                <User2 size={10} />
                                {isMine ? 'Saya' : authorName.split(' ')[0]}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Amount */}
                        <div className={`flex-shrink-0 font-extrabold text-sm ml-3 text-right ${
                          tx.type === 'transfer'
                            ? (filterWallet
                                ? (tx.account_id === filterWallet ? 'text-accent-redLt' : 'text-accent-greenLt')
                                : 'text-accent-blue')
                            : isIncome ? 'text-accent-green' : 'text-gray-200'
                        }`}>
                          {tx.type === 'transfer'
                            ? (filterWallet ? (tx.account_id === filterWallet ? '-' : '+') : '')
                            : isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
          ))}
        </div>
      )}

      <EditTransactionModal
        isOpen={isEditOpen}
        onClose={() => { setIsEditOpen(false); setSelectedTx(null); }}
        transaction={selectedTx}
        updateTransaction={updateTransaction}
        deleteTransaction={deleteTransaction}
      />
    </div>
  );
};

export default Transactions;
