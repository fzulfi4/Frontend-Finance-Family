import { useContext, useMemo, useState } from 'react';
import {
  ReceiptText, ArrowUpRight, ArrowDownRight, Edit2,
  TrendingUp, TrendingDown, CalendarDays, X, User2, Wallet2, ArrowRightLeft
} from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useTransactions } from '../hooks/useTransactions';
import { useWallets } from '../hooks/useWallets';
import { useMembers } from '../hooks/useMembers';
import Card from '../components/ui/Card';
import EditTransactionModal from '../components/EditTransactionModal';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../context/AuthContext';

// ─── Filter helpers ─────────────────────────────────────────────────────────
const startOf = (date, unit) => {
  const d = new Date(date);
  if (unit === 'day')  { d.setHours(0,0,0,0); return d; }
  if (unit === 'week') { d.setDate(d.getDate() - d.getDay()); d.setHours(0,0,0,0); return d; }
  if (unit === 'month'){ d.setDate(1); d.setHours(0,0,0,0); return d; }
  if (unit === 'year') { d.setMonth(0,1); d.setHours(0,0,0,0); return d; }
  return d;
};

const PRESETS = [
  { key: 'all',   label: 'Semua' },
  { key: 'today', label: 'Hari Ini' },
  { key: 'week',  label: 'Minggu Ini' },
  { key: 'month', label: 'Bulan Ini' },
  { key: 'year',  label: 'Tahun Ini' },
  { key: 'range', label: 'Periode' },
];

// ─── FilterSelect ────────────────────────────────────────────────────────────
const FilterSelect = ({ icon: Icon, label, value, onChange, options, allLabel }) => (
  <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2 min-w-[180px]">
    <Icon size={15} className="text-gray-400 flex-shrink-0" />
    <select
      className="bg-transparent text-sm text-gray-200 flex-1 outline-none appearance-none cursor-pointer"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">{allLabel}</option>
      {options.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  </div>
);

// ─── Main Component ──────────────────────────────────────────────────────────
const Transactions = () => {
  const { transactions, loading, updateTransaction, deleteTransaction } = useTransactions();
  const { wallets } = useWallets();
  const { members } = useMembers();
  const { user: currentUser } = useContext(AuthContext);
  const { t } = useTranslation();

  const [selectedTx, setSelectedTx]   = useState(null);
  const [isEditOpen, setIsEditOpen]   = useState(false);

  // Period filter
  const [activePreset, setActivePreset] = useState('all');
  const [rangeStart, setRangeStart]     = useState(null);
  const [rangeEnd,   setRangeEnd]       = useState(null);
  const [showRangePicker, setShowRangePicker] = useState(false);

  // Entity filters
  const [filterMember, setFilterMember] = useState('');
  const [filterWallet, setFilterWallet] = useState('');

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

  // ── Apply all filters ─────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const now = new Date();
    return transactions.filter(tx => {
      const d = new Date(tx.transaction_date);

      // Period filter
      if (activePreset === 'today' && d < startOf(now, 'day'))  return false;
      if (activePreset === 'week'  && d < startOf(now, 'week')) return false;
      if (activePreset === 'month' && d < startOf(now, 'month'))return false;
      if (activePreset === 'year'  && d < startOf(now, 'year')) return false;
      if (activePreset === 'range') {
        if (rangeStart && d < rangeStart) return false;
        if (rangeEnd) {
          const end = new Date(rangeEnd); end.setHours(23,59,59,999);
          if (d > end) return false;
        }
      }

      // Member filter
      if (filterMember && tx.user_id !== filterMember) return false;

      // Wallet filter
      if (filterWallet && tx.account_id !== filterWallet) return false;

      return true;
    });
  }, [transactions, activePreset, rangeStart, rangeEnd, filterMember, filterWallet]);

  // ── Summary totals ────────────────────────────────────────────────────────
  const { totalIncome, totalExpense } = useMemo(() =>
    filtered.reduce((acc, tx) => {
      if (tx.type === 'income') acc.totalIncome  += tx.amount;
      else                      acc.totalExpense += tx.amount;
      return acc;
    }, { totalIncome: 0, totalExpense: 0 }),
  [filtered]);

  // ── Group by month ────────────────────────────────────────────────────────
  const grouped = useMemo(() => {
    const map = new Map();
    filtered.forEach(tx => {
      const d   = new Date(tx.transaction_date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!map.has(key)) map.set(key, {
        label:   d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }),
        items:   [],
        income:  0,
        expense: 0,
      });
      const g = map.get(key);
      g.items.push(tx);
      if (tx.type === 'income') g.income  += tx.amount;
      else                       g.expense += tx.amount;
    });
    return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filtered]);

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
    value: m.id,
    label: m.id === currentUser?.id ? `${m.full_name} (Saya)` : m.full_name,
  }));

  const walletOptions = wallets.map(w => ({ value: w.id, label: w.name }));

  const hasActiveFilter = filterMember || filterWallet;

  if (loading) return <div className="p-8 text-gray-400">{t('loadingTransactions')}</div>;

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <header>
        <h1 className="text-2xl md:text-3xl font-bold mb-1">{t('transactionHistory')}</h1>
        <p className="text-gray-400 text-sm">{t('allIncomesExpenses')}</p>
      </header>

      {/* ── Period filter bar ── */}
      <div className="flex flex-wrap gap-2">
        {PRESETS.map(p => (
          <button
            key={p.key}
            onClick={() => handlePreset(p.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-all ${
              activePreset === p.key
                ? 'bg-accent-blue border-accent-blue text-white shadow-lg shadow-blue-500/20'
                : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            {p.key === 'range' && <CalendarDays size={14} />}
            {activePreset === 'range' && p.key === 'range' ? rangeLabel() : p.label}
            {activePreset === 'range' && p.key === 'range' && (rangeStart || rangeEnd) && (
              <X
                size={12}
                className="ml-1 hover:text-red-400"
                onClick={(e) => { e.stopPropagation(); setRangeStart(null); setRangeEnd(null); }}
              />
            )}
          </button>
        ))}
      </div>

      {/* ── Date range picker ── */}
      {showRangePicker && activePreset === 'range' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl">
          <div>
            <label className="input-label">Dari Tanggal</label>
            <DatePicker
              selected={rangeStart}
              onChange={(d) => setRangeStart(d)}
              selectsStart
              startDate={rangeStart}
              endDate={rangeEnd}
              className="input-field"
              dateFormat="dd MMM yyyy"
              placeholderText="Pilih tanggal awal"
              isClearable
            />
          </div>
          <div>
            <label className="input-label">Sampai Tanggal</label>
            <DatePicker
              selected={rangeEnd}
              onChange={(d) => setRangeEnd(d)}
              selectsEnd
              startDate={rangeStart}
              endDate={rangeEnd}
              minDate={rangeStart}
              className="input-field"
              dateFormat="dd MMM yyyy"
              placeholderText="Pilih tanggal akhir"
              isClearable
            />
          </div>
        </div>
      )}

      {/* ── Entity filters (member + wallet) ── */}
      <div className="flex flex-wrap gap-3 items-center">
        <FilterSelect
          icon={User2}
          allLabel="Semua Anggota"
          value={filterMember}
          onChange={setFilterMember}
          options={memberOptions}
        />
        <FilterSelect
          icon={Wallet2}
          allLabel="Semua Dompet"
          value={filterWallet}
          onChange={setFilterWallet}
          options={walletOptions}
        />
        {hasActiveFilter && (
          <button
            onClick={() => { setFilterMember(''); setFilterWallet(''); }}
            className="text-xs text-gray-500 hover:text-white flex items-center gap-1 transition-colors"
          >
            <X size={12} /> Reset filter
          </button>
        )}
      </div>

      {/* ── Summary cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="flex items-center gap-4 bg-gradient-to-br from-green-500/10 to-transparent border-green-500/20">
          <div className="p-3 rounded-xl bg-green-500/15">
            <TrendingUp size={22} className="text-accent-green" />
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Total Pemasukan</p>
            <p className="text-xl font-bold text-accent-green">+{formatCurrency(totalIncome)}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4 bg-gradient-to-br from-red-500/10 to-transparent border-red-500/20">
          <div className="p-3 rounded-xl bg-red-500/15">
            <TrendingDown size={22} className="text-accent-red" />
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Total Pengeluaran</p>
            <p className="text-xl font-bold text-accent-red">-{formatCurrency(totalExpense)}</p>
          </div>
        </Card>
      </div>

      {/* ── Transaction list grouped by month ── */}
      {filtered.length === 0 ? (
        <Card>
          <div className="p-12 text-center text-gray-500">
            <ReceiptText size={48} className="mx-auto mb-4 opacity-30" />
            <p>{t('noTransactionsFound')}</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {grouped.map(([key, group]) => (
            <div key={key}>
              {/* Month header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <h2 className="text-base font-semibold text-white capitalize">{group.label}</h2>
                  <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">
                    {group.items.length} transaksi
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  {group.income > 0 && (
                    <span className="text-accent-green font-medium">+{formatCurrency(group.income)}</span>
                  )}
                  {group.expense > 0 && (
                    <span className="text-accent-red font-medium">-{formatCurrency(group.expense)}</span>
                  )}
                </div>
              </div>

              {/* Transactions */}
              <Card className="p-0 overflow-hidden">
                <div className="divide-y divide-white/5">
                  {group.items.map(tx => {
                    const isIncome  = tx.type === 'income';
                    const isMine    = tx.user_id === currentUser?.id;
                    const authorName = tx.user?.full_name || 'Tidak diketahui';

                    return (
                      <div
                        key={tx.id}
                        className="flex justify-between items-center p-4 hover:bg-white/5 transition-colors group"
                      >
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          {/* Type icon */}
                          <div className={`flex-shrink-0 p-3 rounded-full ${tx.type === 'transfer' ? 'bg-blue-500/10 text-accent-blue' : isIncome ? 'bg-green-500/10 text-accent-green' : 'bg-red-500/10 text-accent-red'}`}>
                            {tx.type === 'transfer' ? <ArrowRightLeft size={20} /> : isIncome ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                          </div>

                          <div className="min-w-0 flex-1">
                            {/* Title + edit */}
                            <p className="font-semibold truncate flex items-center gap-2 group/title">
                              {tx.notes || (tx.type === 'transfer' ? t('transfer') : isIncome ? t('income') : t('expense'))}
                              <button
                                onClick={() => { setSelectedTx(tx); setIsEditOpen(true); }}
                                className="flex-shrink-0 text-gray-500 hover:text-white transition-colors opacity-0 group-hover/title:opacity-100 p-1"
                                title={t('edit')}
                              >
                                <Edit2 size={14} />
                              </button>
                            </p>

                            {/* Meta row */}
                            <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
                              {/* Date */}
                              <span className="text-xs text-gray-400">
                                {tx.transaction_date
                                  ? new Date(tx.transaction_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
                                  : t('unknownDate')}
                              </span>

                              {/* Wallet */}
                              {tx.account?.name && (
                                <span className="text-xs text-gray-400 flex items-center gap-1">
                                  <Wallet2 size={11} />
                                  <span className="text-gray-300">{tx.account.name}</span>
                                </span>
                              )}

                              {/* Category */}
                              {tx.category?.name && (
                                <span className="text-xs text-gray-400">• {tx.category.name}</span>
                              )}

                              {/* Author */}
                              <span className={`text-xs flex items-center gap-1 ${isMine ? 'text-accent-blue' : 'text-gray-400'}`}>
                                <User2 size={11} />
                                {isMine ? 'Saya' : authorName}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Amount */}
                        <div className={`flex-shrink-0 font-bold text-base ml-4 ${tx.type === 'transfer' ? 'text-accent-blue' : isIncome ? 'text-accent-green' : 'text-white'}`}>
                          {tx.type === 'transfer' ? '' : isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
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
