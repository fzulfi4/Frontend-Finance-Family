import { useState, useContext, useMemo, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { useWallets } from '../hooks/useWallets';
import { useTransactions } from '../hooks/useTransactions';
import { useGoals } from '../hooks/useGoals';
import { useMonthlyExpenses } from '../hooks/useMonthlyExpenses';
import { useMonthlyIncomes } from '../hooks/useMonthlyIncomes';
import { useDebts } from '../hooks/useDebts';
import { useMembers } from '../hooks/useMembers';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { 
  Wallet, ArrowUpRight, ArrowDownRight, Activity, Plus, ReceiptText, 
  Edit2, ArrowRightLeft, CreditCard, ChevronLeft, ChevronRight, 
  TrendingUp, Target, CalendarClock, ShieldAlert, Sparkles, Scale, Info, 
  Percent, CircleDollarSign, Calendar, Users, BarChart3, AlertTriangle, 
  PiggyBank, Download
} from 'lucide-react';
import Card from '../components/ui/Card';
import AddWalletModal from '../components/AddWalletModal';
import EditWalletModal from '../components/EditWalletModal';
import AddTransactionModal from '../components/AddTransactionModal';
import EditTransactionModal from '../components/EditTransactionModal';
import TransferModal from '../components/TransferModal';
import { generateTransactionsExcel } from '../utils/excelReport';

// ─── Gradient presets for virtual cards ─────────────────────────────────────
const CARD_THEMES = [
  {
    gradient: 'from-[#1e3a5f] via-[#1a2d4a] to-[#0f1b2d]',
    accent: 'rgba(59,130,246,0.15)',
    dotColor: 'bg-blue-500',
  },
  {
    gradient: 'from-[#2d1b69] via-[#1e1245] to-[#130d2e]',
    accent: 'rgba(139,92,246,0.15)',
    dotColor: 'bg-purple-500',
  },
  {
    gradient: 'from-[#1a4a3a] via-[#0f3028] to-[#091e1a]',
    accent: 'rgba(16,185,129,0.15)',
    dotColor: 'bg-emerald-500',
  },
  {
    gradient: 'from-[#4a1942] via-[#2e1030] to-[#1a0a1e]',
    accent: 'rgba(236,72,153,0.15)',
    dotColor: 'bg-pink-500',
  },
  {
    gradient: 'from-[#3d2c1a] via-[#2a1e12] to-[#1a130c]',
    accent: 'rgba(245,158,11,0.15)',
    dotColor: 'bg-amber-500',
  },
  {
    gradient: 'from-[#1a3a4a] via-[#102830] to-[#0a1a20]',
    accent: 'rgba(6,182,212,0.15)',
    dotColor: 'bg-cyan-500',
  },
];

const getMatchedBudget = (tx, activeExpenses) => {
  if (tx.type !== 'expense') return null;

  // 1. Primary: match by monthly_expense_id
  if (tx.monthly_expense_id) {
    return activeExpenses.find(e => e.id === tx.monthly_expense_id) || null;
  }

  // 2. Fallback: match by category_id
  if (!tx.category_id) return null;

  // Cari budget aktif dengan category_id yang cocok
  // Dan filter dompet agar tidak cross-wallet (jika budget terikat dompet tertentu)
  const candidateBudgets = activeExpenses.filter(e => 
    e.category_id === tx.category_id && 
    (!e.account_id || e.account_id === tx.account_id)
  );

  if (candidateBudgets.length === 0) return null;
  if (candidateBudgets.length === 1) return candidateBudgets[0];

  // Jika konflik (ada > 1 budget aktif dengan kategori & dompet yang kompatibel)
  // Lakukan pencocokan notes cerdas
  const txNotes = (tx.notes || '').toLowerCase();
  
  const specificMatch = candidateBudgets.find(e => {
    const nameLower = e.name.toLowerCase();
    // Notes mengandung nama budget atau sebaliknya (panjang notes minimal 2 karakter)
    return txNotes.includes(nameLower) || (txNotes.length >= 2 && nameLower.includes(txNotes));
  });

  if (specificMatch) return specificMatch;

  // Jika notes tidak spesifik, default ke budget pertama (misal: TES3)
  return candidateBudgets[0];
};

const getMatchedIncome = (tx, activeIncomes) => {
  if (tx.type !== 'income') return null;

  // 1. Primary: match by monthly_income_id
  if (tx.monthly_income_id) {
    return activeIncomes.find(e => e.id === tx.monthly_income_id) || null;
  }

  // 2. Fallback: match by category_id
  if (!tx.category_id) return null;

  // Cari target pemasukan aktif dengan category_id yang cocok
  // Dan filter dompet agar tidak cross-wallet (jika target terikat dompet tertentu)
  const candidateIncomes = activeIncomes.filter(e => 
    e.category_id === tx.category_id && 
    (!e.account_id || e.account_id === tx.account_id)
  );

  if (candidateIncomes.length === 0) return null;
  if (candidateIncomes.length === 1) return candidateIncomes[0];

  // Lakukan pencocokan notes cerdas
  const txNotes = (tx.notes || '').toLowerCase();
  
  const specificMatch = candidateIncomes.find(e => {
    const nameLower = e.name.toLowerCase();
    return txNotes.includes(nameLower) || (txNotes.length >= 2 && nameLower.includes(txNotes));
  });

  if (specificMatch) return specificMatch;

  return candidateIncomes[0];
};

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const { t } = useTranslation();

  // ─── Fetch Resources ───
  const { wallets, loading: walletsLoading, fetchWallets, totalBalance, updateWallet, deleteWallet } = useWallets(!!user?.family_id);
  const { transactions, loading: txLoading, fetchTransactions, updateTransaction, deleteTransaction } = useTransactions(!!user?.family_id);
  const { goals, loading: goalsLoading } = useGoals(!!user?.family_id);
  const { expenses: monthlyExpenses, loading: expensesLoading } = useMonthlyExpenses(!!user?.family_id);
  const { incomes: monthlyIncomes, loading: incomesLoading } = useMonthlyIncomes(!!user?.family_id);
  const { totalPayable, totalReceivable, loading: debtsLoading } = useDebts(!!user?.family_id);
  const { members, loading: membersLoading } = useMembers(!!user?.family_id);

  // ─── Modals State ───
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isEditWalletModalOpen, setIsEditWalletModalOpen] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState(null);

  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isEditTxModalOpen, setIsEditTxModalOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState(null);
  const [txType, setTxType] = useState('expense');

  // ─── Filters State ───
  const [datePreset, setDatePreset] = useState('current_month');
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [endDate, setEndDate] = useState(new Date());
  const [selectedWalletId, setSelectedWalletId] = useState('all');
  const [selectedMemberId, setSelectedMemberId] = useState('all');

  // Wallet click handler to toggle selectedWalletId
  const handleWalletClick = (walletId) => {
    if (selectedWalletId === walletId) {
      setSelectedWalletId('all');
    } else {
      setSelectedWalletId(walletId);
    }
  };

  // Active hover states for charts
  const [hoveredPoint, setHoveredPoint] = useState(null); // Line chart tooltip
  const [hoveredBar, setHoveredBar] = useState(null); // Bar chart tooltip
  const [hoveredCategory, setHoveredCategory] = useState(null); // Donut chart segment

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  const handleTxSuccess = () => {
    fetchWallets();
    fetchTransactions();
  };



  // Synchronize filter ranges
  const handlePresetChange = (preset) => {
    setDatePreset(preset);
    const now = new Date();
    if (preset === 'current_month') {
      setStartDate(new Date(now.getFullYear(), now.getMonth(), 1));
      setEndDate(now);
    } else if (preset === 'last_30_days') {
      const d = new Date();
      d.setDate(now.getDate() - 30);
      setStartDate(d);
      setEndDate(now);
    } else if (preset === 'last_3_months') {
      const d = new Date();
      d.setMonth(now.getMonth() - 3);
      setStartDate(d);
      setEndDate(now);
    } else if (preset === 'this_year') {
      setStartDate(new Date(now.getFullYear(), 0, 1));
      setEndDate(now);
    }
  };

  // ─── Filter Logic (Runs on every transaction) ───
  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      // 1. Date Filter
      if (!tx.transaction_date) return false;
      const txDate = new Date(tx.transaction_date);
      const txTime = new Date(txDate.getFullYear(), txDate.getMonth(), txDate.getDate()).getTime();
      const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()).getTime();
      const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 23, 59, 59).getTime();
      if (txTime < start || txTime > end) return false;

      // 2. Wallet Filter
      if (selectedWalletId !== 'all') {
        if (tx.type === 'transfer') {
          if (tx.account_id !== selectedWalletId && tx.to_account_id !== selectedWalletId) return false;
        } else {
          if (tx.account_id !== selectedWalletId) return false;
        }
      }

      // 3. Member Filter
      if (selectedMemberId !== 'all') {
        if (tx.user_id !== selectedMemberId) return false;
      }

      return true;
    });
  }, [transactions, startDate, endDate, selectedWalletId, selectedMemberId]);

  // Currently active wallet selected for filtering details
  const selectedWalletInfo = useMemo(() => {
    if (selectedWalletId === 'all') return null;
    return wallets.find(w => w.id === selectedWalletId) || null;
  }, [wallets, selectedWalletId]);

  // Filter recent transactions list
  const transactionsForList = useMemo(() => {
    return filteredTransactions;
  }, [filteredTransactions]);

  // ─── Filtered Financial Metrics (Aggregate) ───
  const metrics = useMemo(() => {
    let income = 0;
    let expense = 0;

    filteredTransactions.forEach(tx => {
      if (tx.type === 'income') {
        income += tx.amount;
      } else if (tx.type === 'expense') {
        expense += tx.amount;
      } else if (tx.type === 'transfer') {
        // Transfer hanya dihitung sebagai pemasukan untuk dompet yang DITUJU
        if (selectedWalletId !== 'all' && tx.to_account_id === selectedWalletId) {
          income += tx.amount;
        }
        // Transfer TIDAK dihitung sebagai pengeluaran untuk dompet asal
      }
    });

    const net = income - expense;
    const savingsRate = income > 0 ? Math.max(0, Math.round((net / income) * 100)) : 0;

    return { income, expense, net, savingsRate };
  }, [filteredTransactions, selectedWalletId]);

  // Filter monthly expenses that are relevant to the current wallet selection:
  // – If 'all' wallets selected: show all active items
  // – If a specific wallet is selected:
  //     1. If there are wallet-specific items for that wallet → show ONLY those items
  //     2. If no wallet-specific items exist → fallback to global items (no account_id)
  const relevantMonthlyExpenses = useMemo(() => {
    const activeExpenses = monthlyExpenses.filter(e => e.is_active);
    if (selectedWalletId === 'all') return activeExpenses;

    // Check if there are wallet-specific entries for the selected wallet
    const walletSpecific = activeExpenses.filter(e => e.account_id && e.account_id === selectedWalletId);
    if (walletSpecific.length > 0) {
      // Show only wallet-specific items (what user assigned to this wallet)
      return walletSpecific;
    }
    // No wallet-specific items → fall back to global items (shared budget)
    return activeExpenses.filter(e => !e.account_id);
  }, [monthlyExpenses, selectedWalletId]);

  // Calculate total monthly budget limit and progress percentage
  const monthlyBudgetLimit = useMemo(() => {
    return relevantMonthlyExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [relevantMonthlyExpenses]);

  const relevantMonthlyIncomes = useMemo(() => {
    const activeIncomes = monthlyIncomes.filter(e => e.is_active);
    if (selectedWalletId === 'all') return activeIncomes;

    const walletSpecific = activeIncomes.filter(e => e.account_id && e.account_id === selectedWalletId);
    if (walletSpecific.length > 0) {
      return walletSpecific;
    }
    return activeIncomes.filter(e => !e.account_id);
  }, [monthlyIncomes, selectedWalletId]);

  const monthlyIncomeTarget = useMemo(() => {
    return relevantMonthlyIncomes.reduce((sum, e) => sum + e.amount, 0);
  }, [relevantMonthlyIncomes]);

  const categoryCounts = useMemo(() => {
    const counts = {};
    // Hitung dari SEMUA anggaran aktif (bukan hanya yang relevan dengan filter)
    monthlyExpenses.filter(e => e.is_active).forEach(e => {
      if (e.category_id) {
        counts[e.category_id] = (counts[e.category_id] || 0) + 1;
      }
    });
    return counts;
  }, [monthlyExpenses]);

  const budgetProgressPercent = useMemo(() => {
    if (monthlyBudgetLimit === 0) return 0;
    return Math.min(100, Math.round((metrics.expense / monthlyBudgetLimit) * 100));
  }, [metrics.expense, monthlyBudgetLimit]);

  // ─── Date Range Calculations ───
  const daysInPeriod = useMemo(() => {
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
    return diffDays;
  }, [startDate, endDate]);

  const dailyAverageExpense = useMemo(() => {
    return metrics.expense / daysInPeriod;
  }, [metrics.expense, daysInPeriod]);

  // ─── Top Category Spending ───
  const topMonthlyBudget = useMemo(() => {
    const now = new Date();
    const activeExpenses = monthlyExpenses.filter(e => e.is_active && e.amount > 0);
    let top = null;
    let topSpent = 0;

    activeExpenses.forEach(expense => {
      const spent = transactions
        .filter(tx => {
          if (tx.type !== 'expense' || !tx.transaction_date) return false;
          const txDate = new Date(tx.transaction_date);
          const isCurrentMonth = txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
          if (!isCurrentMonth) return false;
          
          const matched = getMatchedBudget(tx, activeExpenses);
          return matched && matched.id === expense.id;
        })
        .reduce((sum, tx) => sum + tx.amount, 0);

      if (spent > topSpent) {
        topSpent = spent;
        top = { ...expense, spent };
      }
    });

    return top;
  }, [monthlyExpenses, transactions]);

  // ─── Family Member Expense Contribution ───
  const memberContributions = useMemo(() => {
    const map = {};
    let totalExpense = 0;

    filteredTransactions
      .filter(tx => tx.type === 'expense')
      .forEach(tx => {
        map[tx.user_id] = (map[tx.user_id] || 0) + tx.amount;
        totalExpense += tx.amount;
      });

    return members.map(m => {
      const value = map[m.id] || 0;
      const percentage = totalExpense > 0 ? Math.round((value / totalExpense) * 100) : 0;
      return {
        ...m,
        value,
        percentage
      };
    }).sort((a, b) => b.value - a.value);
  }, [filteredTransactions, members]);

  // Kontribusi pengeluaran per dompet
  const walletContributions = useMemo(() => {
    const map = {};

    filteredTransactions
      .filter(tx => tx.type === 'expense')
      .forEach(tx => {
        if (tx.account_id) {
          map[tx.account_id] = (map[tx.account_id] || 0) + tx.amount;
        }
      });

    return wallets
      .map(w => {
        const spent = map[w.id] || 0;
        // Kapasitas = saldo sekarang + yang sudah dipakai periode ini
        // Contoh: saldo 300rb, terpakai 700rb → kapasitas 1jt → 70%
        const capacity = (w.balance || 0) + spent;
        const percentage = capacity > 0 ? Math.min(100, Math.round((spent / capacity) * 100)) : 0;
        const remaining = w.balance || 0;
        return { ...w, spent, percentage, remaining, capacity };
      })
      .filter(w => w.spent > 0)
      .sort((a, b) => b.percentage - a.percentage);
  }, [filteredTransactions, wallets]);

  // ─── Budget Alert Center (Limits check on current selected period) ───
  const budgetAlerts = useMemo(() => {
    const alerts = [];
    const activeExpenses = monthlyExpenses.filter(e => e.is_active && e.amount > 0);
    if (activeExpenses.length === 0) return [];

    const now = new Date();

    activeExpenses.forEach(expense => {
      const limit = expense.amount;

      const actual = transactions
        .filter(tx => {
          if (tx.type !== 'expense' || !tx.transaction_date) return false;
          const txDate = new Date(tx.transaction_date);
          const isCurrentMonth = txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
          if (!isCurrentMonth) return false;
          
          const matched = getMatchedBudget(tx, activeExpenses);
          return matched && matched.id === expense.id;
        })
        .reduce((sum, tx) => sum + tx.amount, 0);

      const ratio = actual / limit;
      const walletLabel = expense.account?.name ? ` [${expense.account.name}]` : '';

      if (ratio >= 1.0) {
        alerts.push({
          id: expense.id,
          type: 'danger',
          categoryName: expense.name,
          message: `Limit Terlewati! "${expense.name}"${walletLabel} menghabiskan ${formatCurrency(actual)} dari limit ${formatCurrency(limit)}.`
        });
      } else if (ratio >= 0.8) {
        alerts.push({
          id: expense.id,
          type: 'warning',
          categoryName: expense.name,
          message: `Mendekati Limit! "${expense.name}"${walletLabel} mencapai ${Math.round(ratio * 100)}% anggaran (${formatCurrency(actual)}/${formatCurrency(limit)}).`
        });
      }
    });

    return alerts;
  }, [monthlyExpenses, transactions]);

  // ─── Generate Daily Spending Bar Chart Data ───
  const dailySpendingChart = useMemo(() => {
    const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
    const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) || 1;

    // Grouping strategy: day if <= 31 days, week if <= 90 days, else month
    const buckets = {};

    if (diffDays <= 31) {
      // Group by Day
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const key = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
        buckets[key] = { label: key, value: 0 };
      }
      filteredTransactions.forEach(tx => {
        if (tx.type !== 'expense' || !tx.transaction_date) return;
        const txDate = new Date(tx.transaction_date);
        const key = txDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
        if (buckets[key]) {
          buckets[key].value += tx.amount;
        }
      });
    } else if (diffDays <= 90) {
      // Group by Week
      filteredTransactions.forEach(tx => {
        if (tx.type !== 'expense' || !tx.transaction_date) return;
        const txDate = new Date(tx.transaction_date);
        const day = txDate.getDate() - txDate.getDay();
        const wStart = new Date(txDate.getFullYear(), txDate.getMonth(), day);
        const key = `Minggu ${wStart.getDate()}/${wStart.getMonth() + 1}`;
        if (!buckets[key]) {
          buckets[key] = { label: key, value: 0 };
        }
        buckets[key].value += tx.amount;
      });
    } else {
      // Group by Month
      filteredTransactions.forEach(tx => {
        if (tx.type !== 'expense' || !tx.transaction_date) return;
        const txDate = new Date(tx.transaction_date);
        const key = txDate.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' });
        if (!buckets[key]) {
          buckets[key] = { label: key, value: 0 };
        }
        buckets[key].value += tx.amount;
      });
    }

    const data = Object.values(buckets);
    if (data.length === 0) return null;

    const maxVal = Math.max(...data.map(d => d.value), 100000);
    const width = 500;
    const height = 150;
    const paddingLeft = 60;
    const paddingRight = 10;
    const paddingTop = 15;
    const paddingBottom = 25;

    const graphWidth = width - paddingLeft - paddingRight;
    const graphHeight = height - paddingTop - paddingBottom;

    const barWidth = Math.max(2, (graphWidth / data.length) * 0.7);
    const barGap = (graphWidth / data.length) * 0.3;

    const bars = data.map((d, i) => {
      const x = paddingLeft + i * (barWidth + barGap) + barGap / 2;
      const barHeight = (d.value / maxVal) * graphHeight;
      const y = height - paddingBottom - barHeight;
      return {
        x,
        y,
        width: barWidth,
        height: barHeight,
        ...d
      };
    });

    return {
      bars,
      maxVal,
      graphHeight,
      paddingLeft,
      height,
      paddingBottom,
      width
    };
  }, [filteredTransactions, startDate, endDate]);

  // ─── Generate 6 Months Financial Trends Data (Curved Area Chart) ───
  const chartData = useMemo(() => {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        label: d.toLocaleDateString('id-ID', { month: 'short' }),
        year: d.getFullYear(),
        month: d.getMonth(),
        income: 0,
        expense: 0,
      });
    }

    transactions.forEach(tx => {
      if (!tx.transaction_date) return;

      // Wallet filter — sertakan transfer yang masuk/keluar dari dompet terpilih
      if (selectedWalletId !== 'all') {
        if (tx.type === 'transfer') {
          if (tx.account_id !== selectedWalletId && tx.to_account_id !== selectedWalletId) return;
        } else {
          if (tx.account_id !== selectedWalletId) return;
        }
      }

      if (selectedMemberId !== 'all' && tx.user_id !== selectedMemberId) return;

      const txDate = new Date(tx.transaction_date);
      const txYear = txDate.getFullYear();
      const txMonth = txDate.getMonth();

      const bucket = months.find(m => m.year === txYear && m.month === txMonth);
      if (bucket) {
        if (tx.type === 'income') {
          bucket.income += tx.amount;
        } else if (tx.type === 'expense') {
          bucket.expense += tx.amount;
        } else if (tx.type === 'transfer' && selectedWalletId !== 'all') {
          // Transfer hanya dihitung sebagai pemasukan untuk dompet yang dituju
          if (tx.to_account_id === selectedWalletId) bucket.income += tx.amount;
          // Transfer TIDAK dihitung sebagai pengeluaran untuk dompet asal
        }
      }
    });

    return months;
  }, [transactions, selectedWalletId, selectedMemberId]);


  const curvedAreaChart = useMemo(() => {
    if (chartData.length === 0) return null;

    const maxVal = Math.max(...chartData.map(d => Math.max(d.income, d.expense)), 1000000);
    const width = 500;
    const height = 185;
    const paddingLeft = 60;
    const paddingRight = 10;
    const paddingTop = 15;
    const paddingBottom = 25;

    const graphWidth = width - paddingLeft - paddingRight;
    const graphHeight = height - paddingTop - paddingBottom;

    const points = chartData.map((d, i) => {
      const x = paddingLeft + (i / (chartData.length - 1)) * graphWidth;
      const yIncome = height - paddingBottom - (d.income / maxVal) * graphHeight;
      const yExpense = height - paddingBottom - (d.expense / maxVal) * graphHeight;
      return { x, yIncome, yExpense, ...d };
    });

    const getCurvePath = (pts, key) => {
      let path = `M ${pts[0].x} ${pts[0][key]}`;
      for (let i = 0; i < pts.length - 1; i++) {
        const cpX1 = pts[i].x + graphWidth / (chartData.length - 1) / 3;
        const cpY1 = pts[i][key];
        const cpX2 = pts[i + 1].x - graphWidth / (chartData.length - 1) / 3;
        const cpY2 = pts[i + 1][key];
        path += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${pts[i+1].x} ${pts[i+1][key]}`;
      }
      return path;
    };

    const incomeLine = getCurvePath(points, 'yIncome');
    const expenseLine = getCurvePath(points, 'yExpense');

    const incomeArea = `${incomeLine} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z`;
    const expenseArea = `${expenseLine} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z`;

    return {
      points,
      incomeLine,
      expenseLine,
      incomeArea,
      expenseArea,
      maxVal,
      graphHeight,
      paddingLeft,
      height,
      paddingBottom,
      width
    };
  }, [chartData]);

  // ─── Current Month Category Spending Distribution ───
  const budgetDistribution = useMemo(() => {
    // Gunakan relevantMonthlyExpenses agar mengikuti filter dompet
    const activeExpenses = relevantMonthlyExpenses.filter(e => e.is_active);
    const COLORS = [
      '#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6',
      '#06b6d4','#ec4899','#84cc16','#f97316','#a78bfa'
    ];

    const map = {};
    activeExpenses.forEach((expense, idx) => {
      map[expense.id] = {
        id: expense.id,
        name: expense.name,
        walletName: expense.account?.name || null,
        value: 0,
        color: COLORS[idx % COLORS.length],
      };
    });

    filteredTransactions.forEach(tx => {
      if (tx.type !== 'expense' || !tx.transaction_date) return;

      const matched = getMatchedBudget(tx, activeExpenses);
      if (matched && map[matched.id]) {
        map[matched.id].value += tx.amount;
      }
    });

    // allList: semua anggaran (termasuk yang belum terpakai), urut terbesar
    const allList = Object.values(map).sort((a, b) => b.value - a.value);
    // spentList: hanya yang terpakai (untuk donut)
    const spentList = allList.filter(b => b.value > 0);
    const total = spentList.reduce((sum, b) => sum + b.value, 0);

    return { allList, spentList, total };
  }, [relevantMonthlyExpenses, filteredTransactions]);

  const donutChart = useMemo(() => {
    const list = budgetDistribution.spentList;
    const total = budgetDistribution.total;
    if (list.length === 0) return null;

    let accumulatedPercentage = 0;
    const r = 50;
    const circ = 2 * Math.PI * r;

    const slices = list.map(item => {
      const percentage = item.value / total;
      const strokeLength = percentage * circ;
      const strokeOffset = circ - strokeLength + (accumulatedPercentage * circ);
      accumulatedPercentage -= percentage;
      return {
        ...item,
        percentage: Math.round(percentage * 100),
        strokeLength,
        strokeOffset,
        circ
      };
    });

    return { slices, total };
  }, [budgetDistribution]);

  // ─── Top Cards Sparklines ──────────────────────────────────────────────────
  const drawSparkline = (data, key, color) => {
    if (data.length < 2) return null;
    const maxVal = Math.max(...data.map(d => d[key]), 100);
    const width = 80;
    const height = 24;
    const points = data.map((d, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - (d[key] / maxVal) * height;
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg width={width} height={height} className="overflow-visible opacity-60">
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </svg>
    );
  };

  const [activeTab, setActiveTab] = useState('general'); // 'general', 'transactions'
  const [activeBudgetTab, setActiveBudgetTab] = useState('expenses'); // 'expenses', 'incomes'

  const handleExportExcel = () => {
    if (filteredTransactions.length === 0) return;

    // Resolve filter labels
    const periodLabel = datePreset === 'custom'
      ? `${startDate ? startDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '...'} - ${endDate ? endDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '...'}`
      : datePreset === 'current_month' ? 'Bulan Ini'
      : datePreset === 'last_30_days' ? '30 Hari Terakhir'
      : datePreset === 'last_3_months' ? '3 Bulan Terakhir'
      : datePreset === 'this_year' ? 'Tahun Ini'
      : 'Semua';

    const walletLabel = selectedWalletId === 'all'
      ? 'Semua Dompet'
      : wallets.find(w => w.id === selectedWalletId)?.name || 'Dompet Terpilih';

    const memberLabel = selectedMemberId === 'all'
      ? 'Semua Anggota'
      : members.find(m => m.id === selectedMemberId)?.full_name || 'Anggota Terpilih';

    generateTransactionsExcel({
      transactions: filteredTransactions,
      wallets,
      members,
      activeFilters: {
        period: periodLabel,
        wallet: walletLabel,
        member: memberLabel,
      },
      familyName: user?.family?.name
    });
  };

  if (!user?.family_id) {
    return <Navigate to="/onboarding" replace />;
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto pb-safe">
      {/* ── Header ── */}
      <header className="page-header relative overflow-hidden p-6 rounded-3xl bg-gradient-to-r from-accent-blue/10 via-accent-violet/5 to-transparent border border-white/5 backdrop-blur-xl">
        <div className="absolute -right-16 -top-16 w-48 h-48 bg-accent-blue/10 rounded-full blur-3xl pointer-events-none" />
        <div>
          <h1 className="page-title tracking-tight">
            {t('welcomeBack')}, <span className="text-gradient-brand">{user?.full_name?.split(' ')[0] || 'User'}</span>!
          </h1>
          <p className="page-subtitle flex items-center gap-2 mt-1">
            <Sparkles size={14} className="text-accent-blue animate-pulse" />
            Pusat Analisis dan Kontrol Finansial Keluarga
          </p>
        </div>
        <div className="text-left sm:text-right shrink-0 mt-3 sm:mt-0 relative z-10">
          <span className="text-[10px] text-gray-500 block uppercase tracking-widest font-extrabold mb-1">{t('family')}</span>
          <span className="inline-flex items-center gap-2 text-sm font-bold text-accent-blue bg-accent-blue/10 px-4 py-2 rounded-full border border-accent-blue/20 shadow-[0_0_12px_rgba(59,130,246,0.15)]">
            <span className="text-base">👪</span> {user?.family?.name || 'Keluarga'}
          </span>
        </div>
      </header>

      {/* ── Quick Action Tiles ── */}
      <div className="grid grid-cols-3 gap-4">
        <button
          id="tour-dashboard-income"
          onClick={() => { setTxType('income'); setIsTxModalOpen(true); }}
          className="flex flex-col items-center justify-center gap-2.5 p-5 bg-gradient-to-br from-[#102a22]/60 to-[#071d13]/60 hover:from-[#133e30]/80 hover:to-[#09291b]/80 border border-accent-green/20 hover:border-accent-green/45 rounded-2xl transition-all shadow-[0_4px_20px_rgba(16,185,129,0.06)] hover:shadow-[0_4px_28px_rgba(16,185,129,0.15)] group active:scale-95 cursor-pointer"
        >
          <div className="p-3.5 bg-accent-green/12 text-accent-green rounded-2xl group-hover:scale-110 group-hover:bg-accent-green/20 transition-all duration-300 shadow-inner">
            <ArrowUpRight size={24} className="stroke-[2.5]" />
          </div>
          <span className="text-xs md:text-sm font-bold text-accent-greenLt">Pemasukan</span>
        </button>
        <button
          id="tour-dashboard-expense"
          onClick={() => { setTxType('expense'); setIsTxModalOpen(true); }}
          className="flex flex-col items-center justify-center gap-2.5 p-5 bg-gradient-to-br from-[#3b1717]/60 to-[#1e0b0b]/60 hover:from-[#4c1c1c]/80 hover:to-[#2b0d0d]/80 border border-accent-red/20 hover:border-accent-red/45 rounded-2xl transition-all shadow-[0_4px_20px_rgba(239,68,68,0.06)] hover:shadow-[0_4px_28px_rgba(239,68,68,0.15)] group active:scale-95 cursor-pointer"
        >
          <div className="p-3.5 bg-accent-red/12 text-accent-red rounded-2xl group-hover:scale-110 group-hover:bg-accent-red/20 transition-all duration-300 shadow-inner">
            <ArrowDownRight size={24} className="stroke-[2.5]" />
          </div>
          <span className="text-xs md:text-sm font-bold text-accent-redLt">Pengeluaran</span>
        </button>
        <button
          id="tour-dashboard-transfer"
          onClick={() => setIsTransferModalOpen(true)}
          className="flex flex-col items-center justify-center gap-2.5 p-5 bg-gradient-to-br from-[#131d35]/60 to-[#0a0f1d]/60 hover:from-[#1b2b4b]/80 hover:to-[#0f1b35]/80 border border-accent-blue/20 hover:border-accent-blue/45 rounded-2xl transition-all shadow-[0_4px_20px_rgba(59,130,246,0.06)] hover:shadow-[0_4px_28px_rgba(59,130,246,0.15)] group active:scale-95 cursor-pointer"
        >
          <div className="p-3.5 bg-accent-blue/12 text-accent-blue rounded-2xl group-hover:scale-110 group-hover:bg-accent-blue/20 transition-all duration-300 shadow-inner">
            <ArrowRightLeft size={24} className="stroke-[2.5]" />
          </div>
          <span className="text-xs md:text-sm font-bold text-accent-blueLt">Transfer</span>
        </button>
      </div>

      {/* ── Wallet Overview Section (Always Visible) ── */}
      <div id="tour-dashboard-wallets" className="space-y-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <h3 className="font-bold text-base flex items-center gap-2.5 text-gray-200">
            <CreditCard size={18} className="text-accent-blue" />
            Dompet & Rekening Keluarga
          </h3>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">{wallets.length} Dompet</span>
            <button
              onClick={() => setIsWalletModalOpen(true)}
              className="text-[10px] text-accent-blue hover:text-blue-400 font-bold px-3 py-1.5 rounded-xl bg-accent-blue/10 hover:bg-accent-blue/20 transition-all flex items-center gap-1 border border-accent-blue/15 cursor-pointer shadow-md active:scale-95 shrink-0"
            >
              <Plus size={12} /> Baru
            </button>
          </div>
        </div>

        {walletsLoading ? (
          <div className="h-[140px] flex items-center justify-center text-gray-500 text-sm bg-black/10 rounded-2xl border border-white/5 animate-pulse">Memuat dompet...</div>
        ) : wallets.length === 0 ? (
          <button
            onClick={() => setIsWalletModalOpen(true)}
            className="w-full h-[140px] rounded-2xl border border-dashed border-white/10 hover:border-white/20 flex flex-col items-center justify-center gap-2.5 text-gray-500 hover:text-gray-300 transition-all hover:bg-white/[0.01] cursor-pointer"
          >
            <Plus size={24} />
            <span className="text-xs font-bold uppercase tracking-wider">Buat Dompet Pertama</span>
          </button>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {wallets.map((wallet, idx) => {
              const theme = CARD_THEMES[idx % CARD_THEMES.length];
              const isActive = selectedWalletId === wallet.id;
              return (
                <div
                  key={wallet.id}
                  onClick={() => handleWalletClick(wallet.id)}
                  className={`relative rounded-3xl p-5 bg-gradient-to-br ${theme.gradient} border transition-all duration-300 group cursor-pointer w-[260px] shrink-0 snap-start ${
                    isActive 
                      ? 'border-white/50 shadow-lg shadow-blue-500/10 scale-[1.02] ring-2 ring-accent-blue/50' 
                      : 'border-white/[0.04] hover:border-white/25 hover:scale-[1.01]'
                  }`}
                >
                  <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full blur-xl pointer-events-none" style={{ background: theme.accent }} />
                  <div className="flex flex-col justify-between h-[110px] relative z-10">
                    <div className="flex justify-between items-start">
                      <span className="text-[9px] text-white/70 font-extrabold uppercase tracking-widest bg-white/5 px-2.5 py-0.5 rounded-full border border-white/10">{wallet.type}</span>
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            setSelectedWallet(wallet); 
                            setIsEditWalletModalOpen(true); 
                          }}
                          className="p-1 rounded-lg bg-white/5 hover:bg-white/15 text-white/40 hover:text-white border border-white/5 transition-all cursor-pointer opacity-0 group-hover:opacity-100 focus:opacity-100"
                          title={t('edit')}
                        >
                          <Edit2 size={11} />
                        </button>
                      </div>
                    </div>
                    <div>
                      <p className="text-xl font-extrabold text-white mb-0.5 tracking-tight truncate">
                        {formatCurrency(wallet.balance)}
                      </p>
                      <p className="text-xs text-white/80 font-bold truncate">{wallet.name}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Segmented Tab Selector ── */}
      <div className="flex bg-[#0f1224]/85 border border-white/5 p-1 rounded-2xl w-full max-w-md shadow-2xl relative z-10">
        <button
          type="button"
          onClick={() => setActiveTab('general')}
          className={`flex-1 py-2.5 px-4 text-xs md:text-sm font-bold rounded-xl transition-all duration-200 cursor-pointer ${activeTab === 'general' ? 'bg-gradient-to-r from-accent-blue to-accent-violet text-white shadow-lg shadow-blue-500/15' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
        >
          Beranda
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('transactions')}
          className={`flex-1 py-2.5 px-4 text-xs md:text-sm font-bold rounded-xl transition-all duration-200 cursor-pointer ${activeTab === 'transactions' ? 'bg-gradient-to-r from-accent-blue to-accent-violet text-white shadow-lg shadow-blue-500/15' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
        >
          Transaksi
        </button>
      </div>

      {/* ── Interactive Filter Bar ── */}
      <div className="card p-5 flex flex-wrap gap-5 items-center justify-between shadow-[0_12px_40px_-10px_rgba(0,0,0,0.5)] border-white/5 bg-[#0e1122]/60">
        <div className="flex flex-wrap items-center gap-5 w-full lg:w-auto">
          {/* Preset Date Range */}
          <div className="flex flex-col gap-1.5 w-full sm:w-auto">
            <label className="text-[10px] text-gray-400 font-extrabold uppercase flex items-center gap-1.5 tracking-wider">
              <Calendar size={13} className="text-accent-blue" /> Periode Waktu
            </label>
            <select
              value={datePreset}
              onChange={(e) => handlePresetChange(e.target.value)}
              className="input-field py-2 px-3 text-xs w-full sm:w-[170px]"
            >
              <option value="current_month">Bulan Ini</option>
              <option value="last_30_days">30 Hari Terakhir</option>
              <option value="last_3_months">3 Bulan Terakhir</option>
              <option value="this_year">Tahun Ini</option>
              <option value="custom">Rentang Kustom...</option>
            </select>
          </div>

          {/* Custom Date Pickers */}
          {datePreset === 'custom' && (
            <div className="flex items-center gap-3 w-full sm:w-auto animate-in slide-in-from-left-4 duration-300">
              <div className="flex flex-col gap-1.5 w-1/2 sm:w-auto">
                <span className="text-[10px] text-gray-500 uppercase font-extrabold tracking-wider">Mulai</span>
                <DatePicker
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                  selectsStart
                  startDate={startDate}
                  endDate={endDate}
                  className="input-field py-2 px-3 text-xs max-w-[130px]"
                  dateFormat="dd/MM/yyyy"
                />
              </div>
              <div className="flex flex-col gap-1.5 w-1/2 sm:w-auto">
                <span className="text-[10px] text-gray-500 uppercase font-extrabold tracking-wider">Selesai</span>
                <DatePicker
                  selected={endDate}
                  onChange={(date) => setEndDate(date)}
                  selectsEnd
                  startDate={startDate}
                  endDate={endDate}
                  minDate={startDate}
                  className="input-field py-2 px-3 text-xs max-w-[130px]"
                  dateFormat="dd/MM/yyyy"
                />
              </div>
            </div>
          )}

          {/* Wallet Filter */}
          <div className="flex flex-col gap-1.5 w-full sm:w-auto">
            <label className="text-[10px] text-gray-400 font-extrabold uppercase flex items-center gap-1.5 tracking-wider">
              <CreditCard size={13} className="text-accent-blue" /> Dompet
            </label>
            <select
              value={selectedWalletId}
              onChange={(e) => setSelectedWalletId(e.target.value)}
              className="input-field py-2 px-3 text-xs w-full sm:w-[170px]"
            >
              <option value="all">Semua Dompet</option>
              {wallets.map(w => (
                <option key={w.id} value={w.id}>💳 {w.name}</option>
              ))}
            </select>
          </div>

          {/* Member Filter */}
          <div className="flex flex-col gap-1.5 w-full sm:w-auto">
            <label className="text-[10px] text-gray-400 font-extrabold uppercase flex items-center gap-1.5 tracking-wider">
              <Users size={13} className="text-accent-blue" /> Anggota
            </label>
            <select
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
              className="input-field py-2 px-3 text-xs w-full sm:w-[170px]"
            >
              <option value="all">Semua Anggota</option>
              {members.map(m => (
                <option key={m.id} value={m.id}>👤 {m.full_name?.split(' ')[0]}</option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Reset Filters button */}
        {(datePreset !== 'current_month' || selectedWalletId !== 'all' || selectedMemberId !== 'all') && (
          <button
            onClick={() => {
              handlePresetChange('current_month');
              setSelectedWalletId('all');
              setSelectedMemberId('all');
            }}
            className="text-xs text-accent-blue hover:text-blue-400 font-bold cursor-pointer pt-2 sm:pt-0 transition-colors flex items-center gap-1 bg-accent-blue/8 px-3.5 py-2 rounded-xl border border-accent-blue/15 hover:bg-accent-blue/15"
          >
            Reset Filter
          </button>
        )}
      </div>

      {/* ── Budget Alerts Section ── */}
      {budgetAlerts.length > 0 && (
        <div className="space-y-2.5 animate-in fade-in duration-300">
          {budgetAlerts.slice(0, 2).map((alert, idx) => (
            <div 
              key={idx} 
              className={`p-4 rounded-2xl border flex items-start gap-3.5 text-xs shadow-md ${
                alert.type === 'danger' 
                  ? 'bg-red-500/10 border-red-500/20 text-red-300 shadow-red-500/5' 
                  : 'bg-amber-500/10 border-amber-500/20 text-amber-300 shadow-amber-500/5'
              }`}
            >
              <AlertTriangle size={18} className="flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold tracking-tight text-sm">{alert.type === 'danger' ? 'Limit Anggaran Terlewati' : 'Limit Anggaran Mendekati Batas'}</p>
                <p className="opacity-90 mt-1 leading-relaxed">{alert.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Tab Content ── */}
      {activeTab === 'general' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* ── Row of 4 Financial Metric Cards ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Total Balance Card */}
            <Card className="bg-gradient-to-br from-[#121c37] to-[#080d19] border-blue-500/10 flex flex-col justify-between h-[160px] relative overflow-hidden group hover:border-accent-blue/25 hover:shadow-card-hover transition-all duration-300">
              <div className="absolute -top-12 -right-12 w-28 h-28 bg-accent-blue/8 rounded-full blur-2xl pointer-events-none" />
              <div className="flex justify-between items-start p-5">
                <div>
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Total Saldo Terfilter</p>
                  <h3 className="text-xl md:text-2xl font-extrabold truncate tracking-tight text-white mt-1">
                    {walletsLoading ? '...' : formatCurrency(totalBalance)}
                  </h3>
                </div>
                <div className="p-2.5 bg-accent-blue/10 text-accent-blue rounded-xl border border-accent-blue/20 shadow-inner group-hover:scale-105 transition-transform">
                  <Wallet size={18} />
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-white/5 px-5 py-3.5 bg-black/10">
                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">{wallets.length} Dompet terdaftar</span>
                <button 
                  onClick={() => setIsWalletModalOpen(true)}
                  className="text-xs font-bold text-accent-blue hover:text-blue-400 cursor-pointer flex items-center gap-0.5"
                >
                  + Tambah
                </button>
              </div>
            </Card>

            {/* Monthly Income Card */}
            <Card className="bg-gradient-to-br from-[#0c2f21] to-[#051810] border-emerald-500/10 flex flex-col justify-between h-[160px] relative overflow-hidden group hover:border-accent-green/25 hover:shadow-card-hover transition-all duration-300">
              <div className="absolute -top-12 -right-12 w-28 h-28 bg-accent-green/8 rounded-full blur-2xl pointer-events-none" />
              <div className="flex justify-between items-start p-5">
                <div>
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Pemasukan Periode Ini</p>
                  <h3 className="text-xl md:text-2xl font-extrabold text-accent-greenLt truncate tracking-tight mt-1">
                    {txLoading ? '...' : formatCurrency(metrics.income)}
                  </h3>
                </div>
                <div className="p-2.5 bg-accent-green/10 text-accent-green rounded-xl border border-accent-green/20 shadow-inner group-hover:scale-105 transition-transform">
                  <ArrowUpRight size={18} />
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-white/5 px-5 py-3.5 bg-black/10">
                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Tren Periode Terpilih</span>
                <div className="flex items-center gap-2">
                  {drawSparkline(chartData, 'income', '#10b981')}
                  <span className="text-[9px] text-accent-green font-bold bg-accent-green/10 border border-accent-green/20 px-2 py-0.5 rounded-full shrink-0">Aktif</span>
                </div>
              </div>
            </Card>

            {/* Monthly Expenses Card */}
            <Card className="bg-gradient-to-br from-[#301614] to-[#180a08] border-red-500/10 flex flex-col justify-between h-[160px] relative overflow-hidden group hover:border-accent-red/25 hover:shadow-card-hover transition-all duration-300">
              <div className="absolute -top-12 -right-12 w-28 h-28 bg-accent-red/8 rounded-full blur-2xl pointer-events-none" />
              <div className="flex justify-between items-start p-5">
                <div>
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Pengeluaran Periode Ini</p>
                  <h3 className="text-xl md:text-2xl font-extrabold text-accent-redLt truncate tracking-tight mt-1">
                    {txLoading ? '...' : formatCurrency(metrics.expense)}
                  </h3>
                </div>
                <div className="p-2.5 bg-accent-red/10 text-accent-red rounded-xl border border-accent-red/20 shadow-inner group-hover:scale-105 transition-transform">
                  <ArrowDownRight size={18} />
                </div>
              </div>
              <div className="flex flex-col gap-1.5 border-t border-white/5 px-5 py-3 bg-black/10">
                <div className="flex justify-between text-[10px] font-bold text-gray-500">
                  <span>Batas Anggaran: {monthlyBudgetLimit > 0 ? formatCurrency(monthlyBudgetLimit) : 'Statis'}</span>
                  <span className={budgetProgressPercent > 90 ? 'text-accent-red font-bold' : budgetProgressPercent > 70 ? 'text-amber-500 font-bold' : 'text-accent-blue font-bold'}>{budgetProgressPercent}%</span>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${budgetProgressPercent > 90 ? 'bg-accent-red shadow-[0_0_8px_rgba(239,68,68,0.6)]' : budgetProgressPercent > 70 ? 'bg-amber-500' : 'bg-accent-blue'}`}
                    style={{ width: `${budgetProgressPercent}%` }}
                  />
                </div>
              </div>
            </Card>

            {/* Net Savings Card */}
            <Card className="bg-gradient-to-br from-[#241738] to-[#120a1d] border-purple-500/10 flex flex-col justify-between h-[160px] relative overflow-hidden group hover:border-purple-500/25 hover:shadow-card-hover transition-all duration-300">
              <div className="absolute -top-12 -right-12 w-28 h-28 bg-purple-500/8 rounded-full blur-2xl pointer-events-none" />
              <div className="flex justify-between items-start p-5">
                <div>
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Tabungan Bersih</p>
                  <h3 className={`text-xl md:text-2xl font-extrabold truncate tracking-tight mt-1 ${metrics.net >= 0 ? 'text-purple-300' : 'text-accent-redLt'}`}>
                    {txLoading ? '...' : formatCurrency(metrics.net)}
                  </h3>
                </div>
                <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20 shadow-inner group-hover:scale-105 transition-transform">
                  <TrendingUp size={18} />
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-white/5 px-5 py-3.5 bg-black/10">
                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Rasio Tabungan: {metrics.savingsRate}%</span>
                <div className="flex items-center gap-2">
                  {drawSparkline(chartData, 'income', '#8b5cf6')}
                  <span className={`w-2 h-2 rounded-full ${metrics.net >= 0 ? 'bg-accent-green glow-green' : 'bg-accent-red glow-red animate-pulse'}`} />
                </div>
              </div>
            </Card>
          </div>

          {/* ── Detailed Financial Insights row ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Insight 1: Daily Average */}
            <Card className="p-5 bg-[#0e1122]/40 border-white/5 flex items-center gap-4 hover:border-accent-blue/15 transition-all">
              <div className="p-3.5 bg-accent-blue/10 text-accent-blue rounded-2xl border border-accent-blue/10">
                <BarChart3 size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-gray-500 font-extrabold uppercase tracking-wider">Rata-rata Pengeluaran Harian</p>
                <p className="text-base font-extrabold text-gray-200 mt-1 truncate">
                  {txLoading ? '...' : formatCurrency(dailyAverageExpense)}
                </p>
                <p className="text-[10px] text-gray-500 mt-1">Dihitung selama {daysInPeriod} hari periode</p>
              </div>
            </Card>

            {/* Insight 2: Top Monthly Budget */}
            <Card className="p-5 bg-[#0e1122]/40 border-white/5 flex items-center gap-4 hover:border-accent-red/15 transition-all">
              <div className="p-3.5 bg-accent-red/10 text-accent-red rounded-2xl border border-accent-red/10">
                <CalendarClock size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] text-gray-500 font-extrabold uppercase tracking-wider">Pengeluaran Bulanan Terbesar</p>
                {topMonthlyBudget ? (
                  <>
                    <p className="text-base font-extrabold text-gray-200 mt-1 truncate">{topMonthlyBudget.name}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-[10px] text-gray-500">Terpakai: {formatCurrency(topMonthlyBudget.spent)}</span>
                      {topMonthlyBudget.account?.name && (
                        <span className="text-[9px] font-bold text-accent-blue bg-accent-blue/10 border border-accent-blue/20 px-1.5 py-0.5 rounded-full">
                          💳 {topMonthlyBudget.account.name}
                        </span>
                      )}
                    </div>
                  </>
                ) : (
                  <p className="text-base font-extrabold text-gray-400 mt-1">-</p>
                )}
              </div>
            </Card>

            {/* Insight 3: Financial Health */}
            <Card className="p-5 bg-[#0e1122]/40 border-white/5 flex items-center gap-4 hover:border-accent-green/15 transition-all">
              <div className="p-3.5 bg-accent-green/10 text-accent-green rounded-2xl border border-accent-green/10">
                <PiggyBank size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-gray-500 font-extrabold uppercase tracking-wider">Kesehatan Finansial Keluarga</p>
                <p className="text-base font-extrabold text-gray-200 mt-1 truncate">
                  {metrics.savingsRate >= 30 ? 'Sangat Sehat 🌟' : metrics.savingsRate >= 15 ? 'Cukup Aman 👍' : 'Harap Waspada ⚠️'}
                </p>
                <p className="text-[10px] text-gray-500 mt-1">Rasio tabungan disarankan minimal 20%</p>
              </div>
            </Card>
          </div>

          {/* ── Mid Grid: Advanced Analytics ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* LEFT COLUMN: Spending Charts (8 columns) */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Chart 1: Daily Spending Bar Chart SVG */}
              <Card className="relative overflow-visible p-6 bg-[#0c0e1b]/60 border-white/5">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="font-bold text-base md:text-lg flex items-center gap-2 text-gray-200">
                      <BarChart3 size={20} className="text-accent-blue" />
                      Grafik Pengeluaran Harian
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">Total nominal pengeluaran berdasarkan rentang waktu terfilter</p>
                  </div>
                </div>

                {txLoading ? (
                  <div className="h-[170px] flex items-center justify-center text-gray-500 text-sm">Memuat grafik pengeluaran...</div>
                ) : dailySpendingChart && dailySpendingChart.bars.length > 0 ? (
                  <div className="relative">
                    {hoveredBar && (
                      <div 
                        className="absolute bg-[#0b0e1b]/95 border border-white/10 rounded-2xl p-3 shadow-2xl z-20 pointer-events-none text-xs flex flex-col gap-1 transition-all duration-150 animate-in fade-in zoom-in-95"
                        style={{ 
                          left: `${Math.min(hoveredBar.x - 30, 400)}px`,
                          top: `${Math.max(0, hoveredBar.y - 55)}px` 
                        }}
                      >
                        <p className="font-bold text-gray-400">{hoveredBar.label}</p>
                        <p className="text-accent-red font-extrabold text-sm">{formatCurrency(hoveredBar.value)}</p>
                      </div>
                    )}

                    <div className="h-[170px] w-full">
                      <svg 
                        viewBox={`0 0 ${dailySpendingChart.width} ${dailySpendingChart.height}`} 
                        className="w-full h-full select-none overflow-visible"
                      >
                        {/* Gradients */}
                        <defs>
                          <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.85" />
                            <stop offset="100%" stopColor="#f87171" stopOpacity="0.25" />
                          </linearGradient>
                          <linearGradient id="barGradHover" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#ff7d7d" stopOpacity="1" />
                            <stop offset="100%" stopColor="#ef4444" stopOpacity="0.45" />
                          </linearGradient>
                        </defs>

                        {/* Y-Axis Gridlines */}
                        {[0, 0.5, 1].map((ratio, idx) => {
                          const y = dailySpendingChart.height - dailySpendingChart.paddingBottom - (ratio * dailySpendingChart.graphHeight);
                          const gridVal = Math.round(ratio * dailySpendingChart.maxVal);
                          return (
                            <g key={idx} className="opacity-25">
                              <line x1={dailySpendingChart.paddingLeft} y1={y} x2={dailySpendingChart.width} y2={y} stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeDasharray="3 3" />
                              <text x={dailySpendingChart.paddingLeft - 10} y={y + 3} textAnchor="end" fill="#9ca3af" fontSize="9" fontWeight="600">{formatCurrency(gridVal).replace('Rp', '')}</text>
                            </g>
                          );
                        })}

                        {/* Bars */}
                        {dailySpendingChart.bars.map((bar, idx) => (
                          <g 
                            key={idx}
                            className="cursor-pointer"
                            onMouseEnter={() => setHoveredBar(bar)}
                            onMouseLeave={() => setHoveredBar(null)}
                          >
                            {/* Interactive hover trigger rect */}
                            <rect
                              x={bar.x - 4}
                              y={0}
                              width={bar.width + 8}
                              height={dailySpendingChart.height}
                              fill="transparent"
                            />
                            {/* Actual Spending Bar */}
                            <rect
                              x={bar.x}
                              y={bar.y}
                              width={bar.width}
                              height={bar.height}
                              rx={Math.min(4, bar.width/2)}
                              fill={hoveredBar?.x === bar.x ? "url(#barGradHover)" : "url(#barGrad)"}
                              className="transition-all duration-300"
                            />
                          </g>
                        ))}

                        {/* X-Axis Dates */}
                        {dailySpendingChart.bars.filter((_, i) => {
                          const step = Math.ceil(dailySpendingChart.bars.length / 7);
                          return i % step === 0 || i === dailySpendingChart.bars.length - 1;
                        }).map((bar, idx) => (
                          <text
                            key={idx}
                            x={bar.x + bar.width / 2}
                            y={dailySpendingChart.height - 5}
                            textAnchor="middle"
                            fill="#9ca3af"
                            fontSize="9"
                            fontWeight="600"
                          >
                            {bar.label}
                          </text>
                        ))}
                      </svg>
                    </div>
                  </div>
                ) : (
                  <div className="h-[170px] flex flex-col items-center justify-center text-gray-500 text-sm gap-2 bg-black/10 rounded-2xl border border-white/5">
                    <Info size={28} className="opacity-30" />
                    <p>Belum ada transaksi pengeluaran pada rentang waktu ini</p>
                  </div>
                )}
              </Card>

              {/* Chart 2: Cash Flow Trends SVG line chart */}
              <Card className="relative overflow-visible p-6 bg-[#0c0e1b]/60 border-white/5">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="font-bold text-base md:text-lg flex items-center gap-2 text-gray-200">
                      <Activity size={20} className="text-accent-blue animate-pulse" />
                      Tren Finansial Bulanan
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">Tren kumulatif cash flow masuk vs keluar keluarga</p>
                  </div>
                </div>

                {txLoading ? (
                  <div className="h-[185px] flex items-center justify-center text-gray-500 text-sm">Memuat grafik...</div>
                ) : curvedAreaChart ? (
                  <div className="relative">
                    {/* Tooltip */}
                    {hoveredPoint && (
                      <div 
                        className="absolute bg-[#0b0e1b]/95 border border-white/10 rounded-2xl p-3 shadow-2xl z-20 pointer-events-none text-xs flex flex-col gap-1 transition-all duration-150 animate-in fade-in zoom-in-95"
                        style={{ 
                          left: `${Math.min(hoveredPoint.x - 30, 360)}px`,
                          top: `${Math.max(10, hoveredPoint.yIncome - 65)}px` 
                        }}
                      >
                        <p className="font-extrabold text-gray-400 mb-1 border-b border-white/10 pb-0.5">{hoveredPoint.label}</p>
                        <p className="text-accent-greenLt flex justify-between gap-4 font-bold">Pemasukan: <span>{formatCurrency(hoveredPoint.income)}</span></p>
                        <p className="text-accent-redLt flex justify-between gap-4 font-bold">Pengeluaran: <span>{formatCurrency(hoveredPoint.expense)}</span></p>
                      </div>
                    )}

                    <div className="h-[185px] w-full">
                      <svg 
                        viewBox={`0 0 ${curvedAreaChart.width} ${curvedAreaChart.height}`} 
                        className="w-full h-full select-none overflow-visible"
                      >
                        <defs>
                          <linearGradient id="incGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" stopOpacity="0.22" />
                            <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                          </linearGradient>
                          <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.18" />
                            <stop offset="100%" stopColor="#ef4444" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>

                        {/* Y-Axis Gridlines */}
                        {[0, 0.5, 1].map((ratio, idx) => {
                          const y = curvedAreaChart.height - curvedAreaChart.paddingBottom - (ratio * curvedAreaChart.graphHeight);
                          const gridVal = Math.round(ratio * curvedAreaChart.maxVal);
                          return (
                            <g key={idx} className="opacity-25">
                              <line x1={curvedAreaChart.paddingLeft} y1={y} x2={curvedAreaChart.width} y2={y} stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeDasharray="3 3" />
                              <text x={curvedAreaChart.paddingLeft - 10} y={y + 3} textAnchor="end" fill="#9ca3af" fontSize="9" fontWeight="600">{formatCurrency(gridVal).replace('Rp', '')}</text>
                            </g>
                          );
                        })}

                        {/* Areas */}
                        <path d={curvedAreaChart.incomeArea} fill="url(#incGrad)" />
                        <path d={curvedAreaChart.expenseArea} fill="url(#expGrad)" />

                        {/* Lines */}
                        <path d={curvedAreaChart.incomeLine} fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
                        <path d={curvedAreaChart.expenseLine} fill="none" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />

                        {/* Interactivity dots */}
                        {curvedAreaChart.points.map((pt, idx) => (
                          <g 
                            key={idx}
                            className="cursor-pointer"
                            onMouseEnter={() => setHoveredPoint(pt)}
                            onMouseLeave={() => setHoveredPoint(null)}
                          >
                            <rect x={pt.x - 18} y={0} width={36} height={curvedAreaChart.height} fill="transparent" />
                            {hoveredPoint?.x === pt.x && (
                              <line x1={pt.x} y1={0} x2={pt.x} y2={curvedAreaChart.height - curvedAreaChart.paddingBottom} stroke="white" strokeWidth="1" strokeDasharray="2 2" className="opacity-20" />
                            )}
                            <circle cx={pt.x} cy={pt.yIncome} r={hoveredPoint?.x === pt.x ? 6 : 4} fill="#10b981" stroke="#051810" strokeWidth="2.5" className="transition-all duration-150" />
                            <circle cx={pt.x} cy={pt.yExpense} r={hoveredPoint?.x === pt.x ? 6 : 4} fill="#ef4444" stroke="#180a08" strokeWidth="2.5" className="transition-all duration-150" />
                          </g>
                        ))}

                        {/* Labels */}
                        {curvedAreaChart.points.map((pt, idx) => (
                          <text
                            key={idx}
                            x={pt.x}
                            y={curvedAreaChart.height - 5}
                            textAnchor="middle"
                            fill="#9ca3af"
                            fontSize="9.5"
                            fontWeight="600"
                          >
                            {pt.label}
                          </text>
                        ))}
                      </svg>
                    </div>
                  </div>
                ) : (
                  <div className="h-[185px] flex items-center justify-center text-gray-500 text-sm">Tidak ada data untuk grafik.</div>
                )}
              </Card>

              {/* Chart 3: Monthly Budget Donut Chart */}
              <Card className="p-6 bg-[#0c0e1b]/60 border-white/5">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="font-bold text-base md:text-lg flex items-center gap-2 text-gray-200">
                      <CalendarClock size={20} className="text-accent-blue" />
                      Pengeluaran Bulanan Terfilter
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">Persentase pengeluaran berdasarkan anggaran bulanan yang sudah dibuat</p>
                  </div>
                  <span className="text-[10px] text-gray-500 font-bold bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
                    {budgetDistribution.allList.length} Anggaran
                  </span>
                </div>

                {txLoading ? (
                  <div className="h-[170px] flex items-center justify-center text-gray-500 text-sm">Memuat anggaran...</div>
                ) : budgetDistribution.allList.length === 0 ? (
                  <div className="py-10 text-center text-gray-500 text-sm flex flex-col items-center justify-center gap-2 bg-black/10 rounded-2xl border border-white/5">
                    <CalendarClock size={36} className="opacity-20 mb-1 animate-float" />
                    <p>Belum ada anggaran bulanan aktif.</p>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-start justify-around gap-6">
                    {/* SVG Donut — hanya tampil jika ada pengeluaran */}
                    {donutChart && (
                      <div className="relative w-36 h-36 flex-shrink-0 self-center">
                        <svg viewBox="0 0 140 140" className="w-full h-full -rotate-90">
                          <circle cx="70" cy="70" r="50" fill="transparent" stroke="rgba(255,255,255,0.03)" strokeWidth="15" />
                          {donutChart.slices.map((slice, idx) => (
                            <circle
                              key={idx}
                              cx="70"
                              cy="70"
                              r="50"
                              fill="transparent"
                              stroke={slice.color}
                              strokeWidth="15"
                              strokeDasharray={slice.circ}
                              strokeDashoffset={slice.strokeOffset}
                              className="transition-all duration-500 ease-out cursor-pointer hover:stroke-[18px]"
                              onMouseEnter={() => setHoveredCategory(slice)}
                              onMouseLeave={() => setHoveredCategory(null)}
                            />
                          ))}
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none p-4">
                          <span className="text-[10px] text-gray-400 uppercase tracking-widest font-extrabold truncate max-w-full">
                            {hoveredCategory ? hoveredCategory.name : 'Total'}
                          </span>
                          <span className="text-sm font-extrabold text-white mt-1 truncate max-w-full">
                            {formatCurrency(hoveredCategory ? hoveredCategory.value : donutChart.total)}
                          </span>
                          {hoveredCategory && (
                            <span className="text-[10px] text-accent-blue font-bold mt-0.5 bg-accent-blue/10 px-2 py-0.5 rounded-full border border-accent-blue/25">
                              {hoveredCategory.percentage}%
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Legend: tampilkan SEMUA anggaran termasuk yang belum terpakai */}
                    <div className="flex-1 w-full space-y-1.5 max-h-56 overflow-y-auto pr-1">
                      {budgetDistribution.allList.map((item, idx) => (
                        <div
                          key={item.id}
                          className={`flex items-center justify-between p-2 rounded-xl border border-transparent transition-all cursor-pointer ${
                            hoveredCategory?.name === item.name ? 'bg-white/5 border-white/10 scale-[1.01]' : 'hover:bg-white/3'
                          }`}
                          onMouseEnter={() => item.value > 0 ? setHoveredCategory(item) : null}
                          onMouseLeave={() => setHoveredCategory(null)}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className="w-2 h-2 rounded-full flex-shrink-0"
                              style={{ backgroundColor: item.value > 0 ? item.color : 'rgba(255,255,255,0.1)' }}
                            />
                            <div className="min-w-0">
                              <span className={`text-xs font-bold truncate block ${item.value > 0 ? 'text-gray-200' : 'text-gray-500'}`}>
                                {item.name}
                              </span>
                              {item.walletName && (
                                <span className="text-[9px] text-accent-blue/60 font-bold">💳 {item.walletName}</span>
                              )}
                            </div>
                          </div>
                          <div className="text-right pl-2 shrink-0">
                            <span className={`text-xs font-extrabold ${item.value > 0 ? 'text-white' : 'text-gray-600'}`}>
                              {item.value > 0 ? formatCurrency(item.value) : '-'}
                            </span>
                            {item.value > 0 && donutChart && (
                              <span className="text-[10px] text-gray-500 block font-bold mt-0.5">
                                {Math.round((item.value / donutChart.total) * 100)}%
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            </div>

            {/* RIGHT COLUMN: Goals, Budgets, Debts, & Member Contribution (4 columns) */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Widget: Wallet Expense Contribution */}
              <Card className="space-y-5 p-5 bg-[#0c0e1b]/60 border-white/5">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-sm flex items-center gap-2.5 text-gray-200">
                    <Wallet size={18} className="text-accent-blue" />
                    Kontribusi Pengeluaran Dompet
                  </h3>
                  <span className="text-[10px] text-gray-500 font-bold bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
                    {walletContributions.length} Dompet
                  </span>
                </div>

                {walletsLoading ? (
                  <p className="text-xs text-gray-500 py-3 text-center">Memuat data dompet...</p>
                ) : walletContributions.length === 0 ? (
                  <p className="text-xs text-gray-500 text-center py-2">Belum ada pengeluaran pada periode ini.</p>
                ) : (
                  <div className="space-y-4">
                    {walletContributions.map((wallet, idx) => {
                      const dotColors = ['bg-accent-blue', 'bg-accent-green', 'bg-accent-amber', 'bg-accent-red', 'bg-purple-500'];
                      const dot = dotColors[idx % dotColors.length];
                      const barColor = wallet.percentage >= 100
                        ? 'bg-accent-red shadow-[0_0_6px_rgba(239,68,68,0.5)]'
                        : wallet.percentage >= 75
                        ? 'bg-amber-500'
                        : 'bg-gradient-to-r from-accent-blue to-accent-violet';
                      const pctColor = wallet.percentage >= 100
                        ? 'text-accent-red animate-pulse'
                        : wallet.percentage >= 75
                        ? 'text-amber-400'
                        : 'text-gray-300';
                      return (
                        <div key={wallet.id} className="space-y-1.5">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-gray-200 truncate flex items-center gap-2">
                              <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                              💳 {wallet.name}
                            </span>
                            <span className={`font-extrabold ${pctColor}`}>{wallet.percentage}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${barColor} rounded-full transition-all duration-300`}
                              style={{ width: `${wallet.percentage}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-[10px] text-gray-500 font-bold">
                            <span>Terpakai: {formatCurrency(wallet.spent)}</span>
                            <span>Total: {formatCurrency(wallet.capacity)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>

              {/* Savings Goals Widget */}
              <Card className="space-y-5 p-5 bg-[#0c0e1b]/60 border-white/5">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-sm flex items-center gap-2.5 text-gray-200">
                    <Target size={18} className="text-accent-blue" />
                    Target Tabungan (Goals)
                  </h3>
                  <span className="text-[10px] text-gray-500 font-bold bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
                    {goalsLoading ? '...' : goals.length}
                  </span>
                </div>

                {goalsLoading ? (
                  <p className="text-xs text-gray-500 py-3 text-center">Memuat tujuan...</p>
                ) : goals.length === 0 ? (
                  <p className="text-xs text-gray-500 text-center py-2">Belum ada tujuan keuangan yang diset.</p>
                ) : (
                  <div className="space-y-4">
                    {goals.slice(0, 3).map(goal => {
                      const percent = Math.min(100, Math.round((goal.current_amount / goal.target_amount) * 100)) || 0;
                      return (
                        <div key={goal.id} className="space-y-1.5">
                          <div className="flex justify-between text-xs">
                            <span className="font-bold text-gray-200 truncate">{goal.name}</span>
                            <span className="font-extrabold text-accent-blue">{percent}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-accent-blue to-accent-violet rounded-full transition-all duration-300"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-[10px] text-gray-500 font-bold">
                            <span>{formatCurrency(goal.current_amount)}</span>
                            <span>Target: {formatCurrency(goal.target_amount)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>

              {/* Monthly Budget & Income Targets Widget */}
              <Card className="space-y-4 p-5 bg-[#0c0e1b]/60 border-white/5 flex flex-col justify-between">
                <div className="flex flex-col gap-3 font-medium">
                  {/* Card Header & Tab Toggle */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
                    <h3 className="font-bold text-sm flex items-center gap-2 text-gray-200">
                      <CalendarClock size={18} className={activeBudgetTab === 'expenses' ? 'text-accent-blue animate-pulse' : 'text-accent-green animate-pulse'} />
                      Pos Anggaran & Target Bulanan
                    </h3>
                    <div className="flex bg-[#0f1224]/85 border border-white/5 p-0.5 rounded-xl text-[10px]">
                      <button
                        type="button"
                        onClick={() => setActiveBudgetTab('expenses')}
                        className={`px-2.5 py-1.5 font-bold rounded-lg transition-all duration-200 cursor-pointer ${activeBudgetTab === 'expenses' ? 'bg-accent-blue/10 text-accent-blue border border-accent-blue/20' : 'text-gray-400 hover:text-white border border-transparent'}`}
                      >
                        Batas Anggaran
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveBudgetTab('incomes')}
                        className={`px-2.5 py-1.5 font-bold rounded-lg transition-all duration-200 cursor-pointer ${activeBudgetTab === 'incomes' ? 'bg-accent-green/10 text-accent-green border border-accent-green/20' : 'text-gray-400 hover:text-white border border-transparent'}`}
                      >
                        Target Pemasukan
                      </button>
                    </div>
                  </div>

                  {/* Wallet filter notice badge */}
                  {selectedWalletId !== 'all' && (
                    <div className="flex items-center">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${activeBudgetTab === 'expenses' ? 'text-accent-blue bg-accent-blue/10 border-accent-blue/20' : 'text-accent-green bg-accent-green/10 border-accent-green/20'}`}>
                        💳 Filter Dompet Aktif
                      </span>
                    </div>
                  )}

                  {/* List Container with Capped Height & Scrollbar */}
                  <div className="max-h-[240px] overflow-y-auto pr-1 space-y-3.5 custom-scrollbar">
                    {activeBudgetTab === 'expenses' ? (
                      /* Batas Anggaran Tab */
                      expensesLoading ? (
                        <p className="text-xs text-gray-500 py-6 text-center">Memuat anggaran...</p>
                      ) : monthlyExpenses.length === 0 ? (
                        <p className="text-xs text-gray-500 text-center py-6">Belum menetapkan limit bulanan.</p>
                      ) : relevantMonthlyExpenses.length === 0 ? (
                        <p className="text-xs text-gray-500 text-center py-6">Tidak ada limit yang terkait dengan dompet ini.</p>
                      ) : (
                        relevantMonthlyExpenses.map(expense => {
                          const actualExpenseAmount = transactions
                            .filter(tx => {
                              if (tx.type !== 'expense' || !tx.transaction_date) return false;
                              const txDate = new Date(tx.transaction_date);
                              const now = new Date();
                              const isCurrentMonth = txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
                              if (!isCurrentMonth) return false;
                              if (selectedMemberId !== 'all' && tx.user_id !== selectedMemberId) return false;
                              
                              const matched = getMatchedBudget(tx, monthlyExpenses.filter(e => e.is_active));
                              return matched && matched.id === expense.id;
                            })
                            .reduce((sum, tx) => sum + tx.amount, 0);

                          const percent = Math.min(100, Math.round((actualExpenseAmount / expense.amount) * 100)) || 0;
                          
                          return (
                            <div key={expense.id} className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span className="font-bold text-gray-200 truncate flex items-center gap-1.5">
                                  {expense.name}
                                  <span className={`w-1.5 h-1.5 rounded-full ${expense.priority === 'fixed' ? 'bg-blue-400' : 'bg-orange-400'}`} title={expense.priority} />
                                </span>
                                <span className={`font-extrabold text-[11px] ${percent > 90 ? 'text-accent-red animate-pulse' : percent > 75 ? 'text-amber-500' : 'text-gray-300'}`}>
                                  {percent}%
                                </span>
                              </div>
                              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full transition-all duration-300 ${percent > 90 ? 'bg-accent-red shadow-[0_0_6px_rgba(239,68,68,0.5)]' : percent > 75 ? 'bg-amber-500' : 'bg-accent-blue'}`}
                                  style={{ width: `${percent}%` }}
                                />
                              </div>
                              <div className="flex justify-between text-[9px] text-gray-500 font-bold">
                                <span>Riil: {formatCurrency(actualExpenseAmount)}</span>
                                <div className="flex items-center gap-1">
                                  {expense.account?.name && (
                                    <span className="text-[8px] text-accent-blue/80 bg-accent-blue/5 px-1 py-0.2 rounded border border-accent-blue/10">
                                      💳 {expense.account.name}
                                    </span>
                                  )}
                                  <span>Batas: {formatCurrency(expense.amount)}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )
                    ) : (
                      /* Target Pemasukan Tab */
                      incomesLoading ? (
                        <p className="text-xs text-gray-500 py-6 text-center">Memuat target pemasukan...</p>
                      ) : monthlyIncomes.length === 0 ? (
                        <p className="text-xs text-gray-500 text-center py-6">Belum menetapkan target pemasukan bulanan.</p>
                      ) : relevantMonthlyIncomes.length === 0 ? (
                        <p className="text-xs text-gray-500 text-center py-6">Tidak ada target yang terkait dengan dompet ini.</p>
                      ) : (
                        relevantMonthlyIncomes.map(income => {
                          const actualIncomeAmount = transactions
                            .filter(tx => {
                              if (tx.type !== 'income' || !tx.transaction_date) return false;
                              const txDate = new Date(tx.transaction_date);
                              const now = new Date();
                              const isCurrentMonth = txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
                              if (!isCurrentMonth) return false;
                              if (selectedMemberId !== 'all' && tx.user_id !== selectedMemberId) return false;
                              
                              const matched = getMatchedIncome(tx, monthlyIncomes.filter(i => i.is_active));
                              return matched && matched.id === income.id;
                            })
                            .reduce((sum, tx) => sum + tx.amount, 0);

                          const percent = Math.min(100, Math.round((actualIncomeAmount / income.amount) * 100)) || 0;
                          
                          return (
                            <div key={income.id} className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span className="font-bold text-gray-200 truncate flex items-center gap-1.5">
                                  {income.name}
                                </span>
                                <span className={`font-extrabold text-[11px] ${percent >= 100 ? 'text-accent-green' : percent > 75 ? 'text-emerald-400' : 'text-gray-300'}`}>
                                  {percent}%
                                </span>
                              </div>
                              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full transition-all duration-300 ${percent >= 100 ? 'bg-accent-green shadow-[0_0_6px_rgba(16,185,129,0.5)]' : percent > 75 ? 'bg-emerald-400' : 'bg-accent-blue'}`}
                                  style={{ width: `${percent}%` }}
                                />
                              </div>
                              <div className="flex justify-between text-[9px] text-gray-500 font-bold">
                                <span>Riil: {formatCurrency(actualIncomeAmount)}</span>
                                <div className="flex items-center gap-1">
                                  {income.account?.name && (
                                    <span className="text-[8px] text-accent-green/80 bg-accent-green/5 px-1 py-0.2 rounded border border-accent-green/10">
                                      💳 {income.account.name}
                                    </span>
                                  )}
                                  <span>Target: {formatCurrency(income.amount)}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )
                    )}
                  </div>
                </div>

                {/* Combined Widget Summary Footer */}
                <div className="border-t border-white/5 pt-3.5 mt-2 flex items-center justify-between text-[11px] font-bold text-gray-400 bg-black/10 -mx-5 -mb-5 px-5 py-3 rounded-b-2xl">
                  {activeBudgetTab === 'expenses' ? (
                    <>
                      <span>Total Anggaran Terfilter:</span>
                      <span className="text-accent-blue font-extrabold">{formatCurrency(monthlyBudgetLimit)}</span>
                    </>
                  ) : (
                    <>
                      <span>Total Target Pemasukan Terfilter:</span>
                      <span className="text-accent-green font-extrabold">{formatCurrency(monthlyIncomeTarget)}</span>
                    </>
                  )}
                </div>
              </Card>


              {/* Debt Summary Widget */}
              <Card className="space-y-5 p-5 bg-[#0c0e1b]/60 border-white/5">
                <h3 className="font-bold text-sm flex items-center gap-2.5 text-gray-200">
                  <Scale size={18} className="text-accent-blue" />
                  Ikhtisar Utang-Piutang (Debts)
                </h3>
                
                {debtsLoading ? (
                  <p className="text-xs text-gray-500 py-2 text-center">Memuat utang...</p>
                ) : totalPayable === 0 && totalReceivable === 0 ? (
                  <p className="text-xs text-gray-500 text-center py-2">Belum mencatat utang piutang.</p>
                ) : (
                  <div className="space-y-4">
                    {/* Visual Ratio Bar */}
                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden flex">
                      {totalPayable > 0 && (
                        <div 
                          className="bg-accent-red h-full"
                          style={{ width: `${(totalPayable / (totalPayable + totalReceivable)) * 100}%` }}
                          title="Utang"
                        />
                      )}
                      {totalReceivable > 0 && (
                        <div 
                          className="bg-accent-green h-full"
                          style={{ width: `${(totalReceivable / (totalPayable + totalReceivable)) * 100}%` }}
                          title="Piutang"
                        />
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs border-t border-white/5 pt-3">
                      <div className="border-r border-white/5 pr-2.5">
                        <p className="text-[10px] text-gray-500 font-bold mb-0.5 uppercase tracking-wide">Saya Berutang</p>
                        <p className="font-extrabold text-accent-red text-sm">{formatCurrency(totalPayable)}</p>
                      </div>
                      <div className="pl-2.5">
                        <p className="text-[10px] text-gray-500 font-bold mb-0.5 uppercase tracking-wide">Piutang Saya</p>
                        <p className="font-extrabold text-accent-green text-sm">{formatCurrency(totalReceivable)}</p>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      )}



      {activeTab === 'transactions' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <Card className="p-6 bg-[#0c0e1b]/60 border-white/5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5 border-b border-white/5 pb-4">
              <h3 className="font-bold text-base md:text-lg flex items-center gap-2.5 flex-wrap text-gray-200">
                <ReceiptText size={20} className="text-gray-400" />
                Riwayat Transaksi Terfilter
                {selectedWalletInfo && (
                  <span className="text-xs font-bold text-accent-blue bg-accent-blue/10 border border-accent-blue/20 px-3 py-1 rounded-full shadow-inner">
                    💳 Dompet: {selectedWalletInfo.name}
                  </span>
                )}
              </h3>
              
              {/* Excel Export Button */}
              {filteredTransactions.length > 0 && (
                <button
                  onClick={handleExportExcel}
                  className="flex items-center gap-2 px-3.5 py-2 bg-green-600/12 hover:bg-green-600/22 border border-green-500/20 hover:border-green-500/35 text-green-300 hover:text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer shrink-0"
                >
                  <Download size={14} />
                  Ekspor Excel (XLSX)
                </button>
              )}
            </div>

            {txLoading ? (
              <p className="text-gray-500 text-center py-6">{t('loading')}</p>
            ) : transactionsForList.length === 0 ? (
              <div className="text-center py-10 bg-black/10 rounded-2xl border border-white/5">
                <ReceiptText size={32} className="mx-auto text-gray-600 mb-2" />
                <p className="text-gray-400 text-xs">Tidak menemukan transaksi dengan filter aktif.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[450px] overflow-y-auto pr-1">
                {transactionsForList.map(tx => {
                  const isIncome = tx.type === 'income';
                  const isTransfer = tx.type === 'transfer';
                  return (
                    <div 
                      key={tx.id} 
                      className="flex justify-between items-center p-3.5 rounded-2xl bg-[#090b14]/40 hover:bg-white/5 border border-white/5 transition-all group"
                    >
                      <div className="flex items-center gap-3.5 min-w-0 flex-1">
                        {/* Visual Type Indicator */}
                        <div className={`flex-shrink-0 p-2.5 rounded-xl border ${isTransfer ? 'bg-blue-500/10 text-accent-blue border-blue-500/15 shadow-[0_0_8px_rgba(59,130,246,0.1)]' : isIncome ? 'bg-green-500/10 text-accent-green border-green-500/15 shadow-[0_0_8px_rgba(16,185,129,0.1)]' : 'bg-red-500/10 text-accent-red border-red-500/15 shadow-[0_0_8px_rgba(239,68,68,0.1)]'}`}>
                          {isTransfer ? <ArrowRightLeft size={16} /> : isIncome ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-sm text-gray-200 truncate flex items-center gap-2.5">
                            {tx.notes || (isTransfer ? t('transfer') : isIncome ? t('income') : t('expense'))}
                            <button
                              onClick={() => { setSelectedTx(tx); setIsEditTxModalOpen(true); }}
                              className="text-gray-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-white/10 cursor-pointer border border-transparent hover:border-white/5"
                              title={t('edit')}
                            >
                              <Edit2 size={11} />
                            </button>
                          </p>
                          <p className="text-[10px] text-gray-400 truncate flex items-center gap-2 mt-1">
                            <span className="font-bold text-gray-400">
                              {tx.transaction_date ? new Date(tx.transaction_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : t('unknownDate')}
                            </span>
                            <span>•</span>
                            <span className="bg-white/5 px-2 py-0.5 rounded font-extrabold text-[9px] uppercase tracking-widest text-gray-400 border border-white/5">
                              {isTransfer
                                ? `${tx.account?.name || t('wallet')} → ${tx.to_account?.name || t('wallet')}`
                                : tx.account?.name || t('wallet')
                              }
                            </span>
                            {tx.category?.name && (
                              <>
                                <span>•</span>
                                <span 
                                  className="px-2 py-0.5 rounded font-extrabold text-[9px] uppercase tracking-widest border"
                                  style={{ color: tx.category.color, backgroundColor: `${tx.category.color}12`, borderColor: `${tx.category.color}25` }}
                                >
                                  {tx.category.name}
                                </span>
                              </>
                            )}
                            <span className="hidden sm:inline">•</span>
                            <span className="hidden sm:inline text-gray-500 font-semibold">Oleh: {tx.user?.full_name?.split(' ')[0] || 'Anggota'}</span>
                          </p>
                        </div>
                      </div>
                      <div className={`flex-shrink-0 font-extrabold text-sm ml-2.5 ${isTransfer ? 'text-accent-blue' : isIncome ? 'text-accent-green' : 'text-gray-200'}`}>
                        {isTransfer ? '' : isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ── Modals ── */}
      <AddWalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        onSuccess={fetchWallets}
      />

      <EditWalletModal
        isOpen={isEditWalletModalOpen}
        onClose={() => { setIsEditWalletModalOpen(false); setSelectedWallet(null); }}
        wallet={selectedWallet}
        updateWallet={updateWallet}
        deleteWallet={deleteWallet}
      />

      <AddTransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        onSuccess={handleTxSuccess}
        accounts={wallets}
        type={txType}
      />

      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        onSuccess={handleTxSuccess}
        accounts={wallets}
      />

      <EditTransactionModal
        isOpen={isEditTxModalOpen}
        onClose={() => { setIsEditTxModalOpen(false); setSelectedTx(null); }}
        transaction={selectedTx}
        updateTransaction={updateTransaction}
        deleteTransaction={deleteTransaction}
      />
    </div>
  );
};

export default Dashboard;
