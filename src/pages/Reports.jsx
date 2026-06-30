import { useState, useContext } from 'react';
import {
  FileSpreadsheet, Download, CheckCircle, AlertCircle,
  BarChart2, Receipt, TrendingUp, Tag, Wallet,
  Target, CreditCard, CalendarCheck, Loader2,
  Info, ChevronRight, ArrowUpRight, ArrowDownRight,
  Layers, Shield
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useTransactions }    from '../hooks/useTransactions';
import { useWallets }         from '../hooks/useWallets';
import { useGoals }           from '../hooks/useGoals';
import { useDebts }           from '../hooks/useDebts';
import { useMonthlyExpenses } from '../hooks/useMonthlyExpenses';
import { useMonthlyIncomes } from '../hooks/useMonthlyIncomes';
import { useFamily }          from '../hooks/useFamily';
import { generateExcelReport } from '../utils/excelReport';

/* ─────────────────────────────────────────────────── */
const fmtIDR = (n) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', maximumFractionDigits: 0,
  }).format(n || 0);

/* ── Sheet row (compact) ──────────────────────────── */
const SheetRow = ({ emoji, title, description, count, color }) => (
  <div className="flex items-center gap-3 px-4 py-3.5 hover:bg-white/4 transition-colors cursor-default group">
    <div
      className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-sm"
      style={{ background: `${color}15`, border: `1px solid ${color}20` }}
    >
      <span>{emoji}</span>
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-white leading-tight">{title}</p>
      <p className="text-[11px] text-gray-500 mt-0.5 truncate leading-tight">{description}</p>
    </div>
    <span
      className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 whitespace-nowrap"
      style={{ background: `${color}15`, color, border: `1px solid ${color}20` }}
    >
      {count}
    </span>
  </div>
);

/* ── KPI Tile ─────────────────────────────────────── */
const KpiTile = ({ label, value, sub, color, icon: Icon }) => (
  <div className="p-4 rounded-2xl bg-white/3 border border-white/6 flex flex-col gap-1.5">
    <div className="flex items-center justify-between">
      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{label}</p>
      {Icon && <Icon size={13} style={{ color }} className="opacity-60" />}
    </div>
    <p className="text-lg font-extrabold leading-tight" style={{ color }}>{value}</p>
    {sub && <p className="text-[10px] text-gray-600 leading-none">{sub}</p>}
  </div>
);

/* ═══════════════════════════════════════════════════ */
const Reports = () => {
  const { user }   = useContext(AuthContext);
  const { family } = useFamily();

  const { transactions, loading: loadingTx } = useTransactions();
  const { wallets,      loading: loadingW  } = useWallets();
  const { goals,        loading: loadingG  } = useGoals();
  const { debts,        loading: loadingD  } = useDebts();
  const { expenses: monthlyExpenses, loading: loadingM } = useMonthlyExpenses();
  const { incomes: monthlyIncomes, loading: loadingI } = useMonthlyIncomes();

  const isLoading = loadingTx || loadingW || loadingG || loadingD || loadingM || loadingI;
  const [status, setStatus] = useState('idle');
  const [result, setResult] = useState(null);
  const [errMsg, setErrMsg] = useState('');

  const income       = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expense      = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const totalBalance = wallets.reduce((s, w) => s + w.balance, 0);
  const netFlow      = income - expense;

  const handleExport = async () => {
    if (isLoading || status === 'generating') return;
    setStatus('generating');
    setErrMsg('');
    try {
      await new Promise(r => setTimeout(r, 300));
      const res = generateExcelReport({
        transactions, wallets, goals, debts, monthlyExpenses, monthlyIncomes,
        familyName: family?.name || user?.full_name || 'Keluarga',
      });
      setResult(res);
      setStatus('success');
    } catch (e) {
      setErrMsg(e.message || 'Gagal membuat laporan');
      setStatus('error');
    }
  };

  const uniqueMonths = [...new Set(transactions.map(t => t.transaction_date?.slice(0, 7)))].length;
  const uniqueCats   = [...new Set(transactions.map(t => t.category?.name).filter(Boolean))].length;

  const SHEETS = [
    { emoji: '📊', title: 'Ringkasan Keuangan',  description: 'Executive summary: arus kas, saldo, hutang & goals',  count: '1 sheet',             color: '#3b82f6' },
    { emoji: '💸', title: 'Semua Transaksi',      description: 'Seluruh transaksi dengan detail lengkap',             count: `${transactions.length} baris`, color: '#8b5cf6' },
    { emoji: '📈', title: 'Analisis Bulanan',     description: 'Pemasukan, pengeluaran & rasio tabungan per bulan',   count: `${uniqueMonths} bulan`,        color: '#10b981' },
    { emoji: '🏷️', title: 'Breakdown Kategori',   description: 'Pengeluaran & pemasukan per kategori + ranking',     count: `${uniqueCats} kategori`,       color: '#f59e0b' },
    { emoji: '💳', title: 'Akun & Dompet',        description: 'Saldo terkini + arus masuk/keluar per akun',         count: `${wallets.length} akun`,       color: '#06b6d4' },
    { emoji: '🎯', title: 'Target Tabungan',      description: 'Progress, sisa, dan deadline tiap goal',              count: `${goals.length} goals`,        color: '#ec4899' },
    { emoji: '💰', title: 'Hutang & Piutang',     description: 'Detail aktif & lunas + persentase pelunasan',        count: `${debts.length} items`,        color: '#ef4444' },
    { emoji: '📋', title: 'Anggaran Bulanan',     description: 'Pos anggaran tetap/opsional vs pengeluaran nyata',   count: `${monthlyExpenses.length} pos`, color: '#a78bfa' },
    { emoji: '📋', title: 'Target Pemasukan',     description: 'Pos target pemasukan bulanan vs realisasi nyata',   count: `${monthlyIncomes.length} pos`, color: '#34d399' },
    { emoji: '📊', title: 'Analisis Pos Bulanan',  description: 'Pengeluaran & pemasukan per pos anggaran & target',   count: '1 sheet',             color: '#10b981' },
  ];

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 animate-fade-in">

      {/* ── Header ─────────────────────────────────── */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title flex items-center gap-2.5">
            <FileSpreadsheet size={22} className="text-accent-green" />
            Laporan Excel
          </h1>
          <p className="page-subtitle">Ekspor seluruh data keuangan ke dalam file Excel multi-sheet yang lengkap</p>
        </div>
      </header>

      {/* ── Alert: loading data ─────────────────────── */}
      {isLoading && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-accent-blue/8 border border-accent-blue/20 text-accent-blue text-sm animate-fade-in">
          <Loader2 size={15} className="animate-spin flex-shrink-0" />
          Memuat data keuangan…
        </div>
      )}

      {/* ── Alert: success ─────────────────────────── */}
      {status === 'success' && result && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-accent-green/8 border border-accent-green/25 animate-fade-in">
          <CheckCircle size={16} className="text-accent-green flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-accent-green font-semibold text-sm">File berhasil diunduh!</p>
            <p className="text-[11px] text-gray-500 mt-0.5">{result.fileName} · {result.sheetCount} sheet · {result.totalRows} transaksi</p>
          </div>
        </div>
      )}

      {/* ── Alert: error ───────────────────────────── */}
      {status === 'error' && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-accent-red/8 border border-accent-red/25 animate-fade-in">
          <AlertCircle size={16} className="text-accent-red flex-shrink-0 mt-0.5" />
          <p className="text-accent-red text-sm">{errMsg}</p>
        </div>
      )}

      {/* ── Main 2-column grid ─────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

        {/* LEFT — Sheet list ──────────────────────── */}
        <div className="lg:col-span-3 card overflow-hidden">
          {/* Card header */}
          <div className="flex items-center gap-2.5 px-5 py-4 border-b border-dark-border">
            <Layers size={14} className="text-accent-blue" />
            <h2 className="text-sm font-bold text-white">Isi Laporan Excel</h2>
            <span className="ml-auto badge badge-blue">10 Sheet</span>
          </div>

          {/* Sheet rows */}
          <div className="divide-y divide-dark-border">
            {SHEETS.map((s, i) => (
              <SheetRow key={i} {...s} />
            ))}
          </div>

          {/* Footer CTA */}
          <div className="px-5 py-4 border-t border-dark-border bg-white/2">
            <button
              onClick={handleExport}
              disabled={isLoading || status === 'generating'}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl font-bold text-sm text-white transition-all duration-300 relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 60%, #8b5cf6 100%)',
                boxShadow: '0 4px 24px rgba(16,185,129,0.3)',
              }}
            >
              {/* Shimmer overlay */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: 'linear-gradient(135deg, #34d399 0%, #60a5fa 60%, #a78bfa 100%)' }} />
              <span className="relative flex items-center gap-2">
                {status === 'generating'
                  ? <><Loader2 size={17} className="animate-spin" /> Membuat Laporan…</>
                  : <><Download size={17} /> Export Laporan Excel (.xlsx)</>
                }
              </span>
            </button>
          </div>
        </div>

        {/* RIGHT — Stats + Info ───────────────────── */}
        <div className="lg:col-span-2 flex flex-col gap-4">

          {/* KPI Grid */}
          <div className="card p-4 space-y-3">
            <div className="flex items-center gap-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Snapshot Data</p>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <KpiTile
                label="Total Pemasukan"
                value={fmtIDR(income)}
                sub={`${transactions.filter(t=>t.type==='income').length} transaksi`}
                color="#10b981"
                icon={ArrowUpRight}
              />
              <KpiTile
                label="Total Pengeluaran"
                value={fmtIDR(expense)}
                sub={`${transactions.filter(t=>t.type==='expense').length} transaksi`}
                color="#ef4444"
                icon={ArrowDownRight}
              />
            </div>

            {/* Net flow bar */}
            <div className="p-3 rounded-xl bg-white/3 border border-dark-border">
              <div className="flex justify-between items-center mb-1.5">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Arus Bersih</p>
                <p className={`text-xs font-bold ${netFlow >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
                  {netFlow >= 0 ? '▲ Surplus' : '▼ Defisit'}
                </p>
              </div>
              <p className={`text-base font-extrabold ${netFlow >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
                {fmtIDR(Math.abs(netFlow))}
              </p>
              {/* Bar */}
              <div className="mt-2 h-1.5 rounded-full bg-dark-border overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: income > 0 ? `${Math.min((expense / income) * 100, 100)}%` : '0%',
                    background: expense > income
                      ? 'linear-gradient(90deg,#ef4444,#f97316)'
                      : 'linear-gradient(90deg,#10b981,#3b82f6)',
                  }}
                />
              </div>
              <div className="flex justify-between mt-1">
                <p className="text-[9px] text-gray-600">0%</p>
                <p className="text-[9px] text-gray-600">Pengeluaran vs Pemasukan</p>
                <p className="text-[9px] text-gray-600">100%</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <KpiTile label="Total Saldo"    value={fmtIDR(totalBalance)}                              sub={`${wallets.length} akun`}      color="#3b82f6"  icon={Wallet}    />
              <KpiTile label="Total Transaksi" value={transactions.length}                              sub="semua tipe"                    color="#8b5cf6"  icon={Receipt}   />
              <KpiTile label="Goals Aktif"    value={goals.filter(g=>g.status==='in_progress').length} sub="sedang berjalan"               color="#ec4899"  icon={Target}    />
              <KpiTile label="Hutang Aktif"   value={debts.filter(d=>d.status==='active').length}      sub="belum lunas"                   color="#f59e0b"  icon={CreditCard} />
            </div>
          </div>

          {/* Info box */}
          <div className="card p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Shield size={13} className="text-accent-blue" />
              <p className="text-xs font-bold text-white">Tentang Laporan Ini</p>
            </div>
            <ul className="space-y-2.5">
              {[
                { icon: '📄', text: 'Format .xlsx — kompatibel dengan Excel, Google Sheets & LibreOffice' },
                { icon: '🔒', text: '100% diproses di browser — tidak ada data dikirim ke server lain' },
                { icon: '🔢', text: 'Kolom angka dalam format numerik, siap dikalkulasi langsung' },
                { icon: '📅', text: 'Nama file otomatis menyertakan nama keluarga dan tanggal export' },
                { icon: '⚡', text: 'Data diambil secara real-time dari akun keluarga Anda' },
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-[11px] text-gray-400">
                  <span className="flex-shrink-0 mt-0.5">{item.icon}</span>
                  <span className="leading-relaxed">{item.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
