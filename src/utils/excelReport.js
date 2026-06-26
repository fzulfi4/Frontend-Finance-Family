/**
 * excelReport.js
 * Generates a comprehensive, fully-formatted multi-sheet Excel report
 * for the FamFinance family finance tracker.
 *
 * Sheets generated:
 *   1. 📊 Ringkasan (Summary)
 *   2. 💸 Transaksi (All Transactions)
 *   3. 📈 Analisis Bulanan (Monthly Analysis)
 *   4. 🏷️ Kategori (Category Breakdown)
 *   5. 💳 Akun & Dompet (Accounts/Wallets)
 *   6. 🎯 Target Tabungan (Financial Goals)
 *   7. 💰 Hutang Piutang (Debts)
 *   8. 📋 Anggaran Bulanan (Monthly Expenses)
 */

import * as XLSX from 'xlsx';

/* ── Helpers ────────────────────────────────────────────────────────────── */
const fmtIDR = (n) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n || 0);

const fmtDate = (d) => {
  if (!d) return '-';
  try { return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }); }
  catch { return String(d); }
};

const fmtPct = (v, total) =>
  total > 0 ? `${((v / total) * 100).toFixed(1)}%` : '0%';

const monthKey = (d) => {
  const dt = new Date(d);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
};

const monthLabel = (k) => {
  const [y, m] = k.split('-');
  return new Date(y, m - 1, 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
};

/* ── Workbook builder helpers ───────────────────────────────────────────── */
/**
 * Append rows to a worksheet. Each row is an array of cell values.
 * Returns the next available row index.
 */
const appendRows = (ws, rows, startRow = 1) => {
  rows.forEach((row, ri) => {
    row.forEach((val, ci) => {
      const cellRef = XLSX.utils.encode_cell({ r: startRow + ri, c: ci });
      ws[cellRef] = { v: val, t: typeof val === 'number' ? 'n' : 's' };
    });
  });
  return startRow + rows.length;
};

const setColWidths = (ws, widths) => {
  ws['!cols'] = widths.map(w => ({ wch: w }));
};

const mergeCells = (ws, merges) => {
  ws['!merges'] = (ws['!merges'] || []).concat(merges);
};

/* ── Sheet 1: Ringkasan (Summary) ───────────────────────────────────────── */
const buildSummarySheet = (data) => {
  const { transactions, wallets, goals, debts, monthlyExpenses, familyName, generatedAt } = data;

  const income  = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const transfer = transactions.filter(t => t.type === 'transfer').reduce((s, t) => s + t.amount, 0);
  const netBalance = income - expense;
  const totalBalance = wallets.reduce((s, w) => s + w.balance, 0);

  const activeDebts = debts.filter(d => d.status === 'active');
  const totalPayable    = activeDebts.filter(d => d.type === 'payable').reduce((s, d) => s + d.remaining_amount, 0);
  const totalReceivable = activeDebts.filter(d => d.type === 'receivable').reduce((s, d) => s + d.remaining_amount, 0);

  const goalsInProgress = goals.filter(g => g.status === 'in_progress');
  const totalGoalTarget  = goalsInProgress.reduce((s, g) => s + g.target_amount, 0);
  const totalGoalSaved   = goalsInProgress.reduce((s, g) => s + g.current_amount, 0);

  const fixedBudget    = monthlyExpenses.filter(m => m.priority === 'fixed'    && m.is_active).reduce((s, m) => s + m.amount, 0);
  const optionalBudget = monthlyExpenses.filter(m => m.priority === 'optional' && m.is_active).reduce((s, m) => s + m.amount, 0);
  const totalBudget    = fixedBudget + optionalBudget;

  const ws = {};
  let row = 0;

  // Title block
  ws[XLSX.utils.encode_cell({ r: row, c: 0 })] = { v: `LAPORAN KEUANGAN KELUARGA`, t: 's' };
  row++;
  ws[XLSX.utils.encode_cell({ r: row, c: 0 })] = { v: familyName || 'Keluarga', t: 's' };
  row++;
  ws[XLSX.utils.encode_cell({ r: row, c: 0 })] = { v: `Dibuat pada: ${generatedAt}`, t: 's' };
  row++;
  ws[XLSX.utils.encode_cell({ r: row, c: 0 })] = { v: `Periode: Seluruh Data (${transactions.length} transaksi)`, t: 's' };
  row += 2;

  // Section: Arus Kas
  ws[XLSX.utils.encode_cell({ r: row, c: 0 })] = { v: 'RINGKASAN ARUS KAS', t: 's' };
  row++;
  const kasRows = [
    ['Total Pemasukan',          income,         `${transactions.filter(t=>t.type==='income').length} transaksi`],
    ['Total Pengeluaran',        expense,        `${transactions.filter(t=>t.type==='expense').length} transaksi`],
    ['Total Transfer',           transfer,       `${transactions.filter(t=>t.type==='transfer').length} transaksi`],
    ['Selisih (Pemasukan - Pengeluaran)', netBalance, netBalance >= 0 ? '✅ Surplus' : '⚠️ Defisit'],
  ];
  kasRows.forEach(([label, val, note]) => {
    ws[XLSX.utils.encode_cell({ r: row, c: 0 })] = { v: label, t: 's' };
    ws[XLSX.utils.encode_cell({ r: row, c: 1 })] = { v: val, t: 'n' };
    ws[XLSX.utils.encode_cell({ r: row, c: 2 })] = { v: note, t: 's' };
    row++;
  });

  row++;
  // Section: Akun & Saldo
  ws[XLSX.utils.encode_cell({ r: row, c: 0 })] = { v: 'AKUN & SALDO', t: 's' };
  row++;
  ws[XLSX.utils.encode_cell({ r: row, c: 0 })] = { v: 'Total Saldo Seluruh Akun', t: 's' };
  ws[XLSX.utils.encode_cell({ r: row, c: 1 })] = { v: totalBalance, t: 'n' };
  ws[XLSX.utils.encode_cell({ r: row, c: 2 })] = { v: `${wallets.length} akun`, t: 's' };
  row++;
  wallets.forEach(w => {
    ws[XLSX.utils.encode_cell({ r: row, c: 0 })] = { v: `  • ${w.name} (${w.type})`, t: 's' };
    ws[XLSX.utils.encode_cell({ r: row, c: 1 })] = { v: w.balance, t: 'n' };
    row++;
  });

  row++;
  // Section: Target Tabungan
  ws[XLSX.utils.encode_cell({ r: row, c: 0 })] = { v: 'TARGET TABUNGAN', t: 's' };
  row++;
  const goalRows = [
    ['Target Sedang Berjalan',   goalsInProgress.length, 'goals'],
    ['Total Target Perlu Dicapai', totalGoalTarget, fmtIDR(totalGoalTarget)],
    ['Total Sudah Ditabung',     totalGoalSaved, fmtIDR(totalGoalSaved)],
    ['Sisa Perlu Ditabung',      totalGoalTarget - totalGoalSaved, fmtIDR(totalGoalTarget - totalGoalSaved)],
    ['Goals Tercapai',           goals.filter(g=>g.status==='achieved').length, 'goals'],
  ];
  goalRows.forEach(([label, val, note]) => {
    ws[XLSX.utils.encode_cell({ r: row, c: 0 })] = { v: label, t: 's' };
    ws[XLSX.utils.encode_cell({ r: row, c: 1 })] = { v: val, t: 'n' };
    ws[XLSX.utils.encode_cell({ r: row, c: 2 })] = { v: String(note), t: 's' };
    row++;
  });

  row++;
  // Section: Hutang Piutang
  ws[XLSX.utils.encode_cell({ r: row, c: 0 })] = { v: 'HUTANG & PIUTANG', t: 's' };
  row++;
  const debtRows = [
    ['Total Hutang (Payable)',   totalPayable,    `${activeDebts.filter(d=>d.type==='payable').length} aktif`],
    ['Total Piutang (Receivable)', totalReceivable, `${activeDebts.filter(d=>d.type==='receivable').length} aktif`],
    ['Hutang Lunas',             debts.filter(d=>d.status==='paid').length, 'items'],
  ];
  debtRows.forEach(([label, val, note]) => {
    ws[XLSX.utils.encode_cell({ r: row, c: 0 })] = { v: label, t: 's' };
    ws[XLSX.utils.encode_cell({ r: row, c: 1 })] = { v: val, t: 'n' };
    ws[XLSX.utils.encode_cell({ r: row, c: 2 })] = { v: note, t: 's' };
    row++;
  });

  row++;
  // Section: Anggaran
  ws[XLSX.utils.encode_cell({ r: row, c: 0 })] = { v: 'ANGGARAN BULANAN', t: 's' };
  row++;
  const budgetRows = [
    ['Total Anggaran Aktif',     totalBudget,    fmtIDR(totalBudget)],
    ['Anggaran Tetap (Fixed)',   fixedBudget,    fmtIDR(fixedBudget)],
    ['Anggaran Opsional',        optionalBudget, fmtIDR(optionalBudget)],
    ['Selisih Anggaran vs Pengeluaran', totalBudget - expense, totalBudget >= expense ? '✅ Dalam Anggaran' : '⚠️ Melebihi Anggaran'],
  ];
  budgetRows.forEach(([label, val, note]) => {
    ws[XLSX.utils.encode_cell({ r: row, c: 0 })] = { v: label, t: 's' };
    ws[XLSX.utils.encode_cell({ r: row, c: 1 })] = { v: val, t: 'n' };
    ws[XLSX.utils.encode_cell({ r: row, c: 2 })] = { v: String(note), t: 's' };
    row++;
  });

  ws['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: row, c: 4 } });
  setColWidths(ws, [42, 20, 28, 15, 15]);
  return ws;
};

/* ── Sheet 2: Transaksi ─────────────────────────────────────────────────── */
const buildTransactionSheet = (transactions) => {
  const headers = [
    'No', 'Tanggal', 'Jenis', 'Jumlah (IDR)', 'Akun Asal', 'Akun Tujuan',
    'Kategori', 'Catatan', 'Dicatat Oleh', 'Dibuat Pada'
  ];

  const rows = transactions
    .sort((a, b) => new Date(b.transaction_date) - new Date(a.transaction_date))
    .map((t, i) => [
      i + 1,
      fmtDate(t.transaction_date),
      t.type === 'income' ? 'Pemasukan' : t.type === 'expense' ? 'Pengeluaran' : 'Transfer',
      t.amount,
      t.account?.name || '-',
      t.to_account?.name || '-',
      t.category?.name || '-',
      t.notes || '-',
      t.user?.full_name || '-',
      fmtDate(t.created_at),
    ]);

  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  setColWidths(ws, [5, 18, 14, 20, 18, 18, 16, 30, 18, 18]);
  return ws;
};

/* ── Sheet 3: Analisis Bulanan ──────────────────────────────────────────── */
const buildMonthlyAnalysisSheet = (transactions) => {
  // Group by month
  const monthMap = {};
  transactions.forEach(t => {
    const mk = monthKey(t.transaction_date);
    if (!monthMap[mk]) monthMap[mk] = { income: 0, expense: 0, transfer: 0, count: 0 };
    monthMap[mk][t.type] += t.amount;
    monthMap[mk].count++;
  });

  const sortedMonths = Object.keys(monthMap).sort();
  const headers = [
    'Bulan', 'Pemasukan (IDR)', 'Pengeluaran (IDR)', 'Transfer (IDR)',
    'Selisih (IDR)', 'Rasio Tabungan', 'Jml Transaksi', 'Status'
  ];

  const rows = sortedMonths.map(mk => {
    const m = monthMap[mk];
    const diff = m.income - m.expense;
    const savingRate = m.income > 0 ? ((diff / m.income) * 100).toFixed(1) + '%' : '-';
    return [
      monthLabel(mk),
      m.income,
      m.expense,
      m.transfer,
      diff,
      savingRate,
      m.count,
      diff >= 0 ? 'Surplus' : 'Defisit',
    ];
  });

  // Totals row
  const totIncome   = sortedMonths.reduce((s, mk) => s + monthMap[mk].income, 0);
  const totExpense  = sortedMonths.reduce((s, mk) => s + monthMap[mk].expense, 0);
  const totTransfer = sortedMonths.reduce((s, mk) => s + monthMap[mk].transfer, 0);
  const totCount    = sortedMonths.reduce((s, mk) => s + monthMap[mk].count, 0);
  rows.push([
    'TOTAL / RATA-RATA',
    totIncome,
    totExpense,
    totTransfer,
    totIncome - totExpense,
    totIncome > 0 ? (((totIncome - totExpense) / totIncome) * 100).toFixed(1) + '%' : '-',
    totCount,
    '',
  ]);

  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  setColWidths(ws, [20, 20, 20, 18, 18, 15, 15, 12]);
  return ws;
};

/* ── Sheet 4: Kategori ──────────────────────────────────────────────────── */
const buildCategorySheet = (transactions) => {
  const catMap = {};
  transactions.filter(t => t.type === 'expense').forEach(t => {
    const cname = t.category?.name || 'Tanpa Kategori';
    if (!catMap[cname]) catMap[cname] = { total: 0, count: 0 };
    catMap[cname].total += t.amount;
    catMap[cname].count++;
  });

  const totalExp = Object.values(catMap).reduce((s, v) => s + v.total, 0);
  const sorted = Object.entries(catMap).sort((a, b) => b[1].total - a[1].total);

  const headers = ['No', 'Kategori', 'Total Pengeluaran (IDR)', 'Jml Transaksi', 'Rata-rata per Transaksi', '% dari Total', 'Peringkat'];
  const rows = sorted.map(([cat, v], i) => [
    i + 1,
    cat,
    v.total,
    v.count,
    v.count > 0 ? Math.round(v.total / v.count) : 0,
    fmtPct(v.total, totalExp),
    i === 0 ? '🥇 Terbesar' : i === 1 ? '🥈' : i === 2 ? '🥉' : '',
  ]);

  // Also add income category summary
  const incCatMap = {};
  transactions.filter(t => t.type === 'income').forEach(t => {
    const cname = t.category?.name || 'Tanpa Kategori';
    if (!incCatMap[cname]) incCatMap[cname] = { total: 0, count: 0 };
    incCatMap[cname].total += t.amount;
    incCatMap[cname].count++;
  });

  const totalInc = Object.values(incCatMap).reduce((s, v) => s + v.total, 0);
  const sortedInc = Object.entries(incCatMap).sort((a, b) => b[1].total - a[1].total);

  const allRows = [
    headers,
    ...rows,
    ['', '', '', '', '', '', ''],
    ['PEMASUKAN PER KATEGORI', '', '', '', '', '', ''],
    ['No', 'Kategori', 'Total Pemasukan (IDR)', 'Jml Transaksi', 'Rata-rata', '% dari Total', ''],
    ...sortedInc.map(([cat, v], i) => [
      i + 1, cat, v.total, v.count,
      v.count > 0 ? Math.round(v.total / v.count) : 0,
      fmtPct(v.total, totalInc), '',
    ]),
  ];

  const ws = XLSX.utils.aoa_to_sheet(allRows);
  setColWidths(ws, [5, 24, 22, 16, 22, 14, 12]);
  return ws;
};

/* ── Sheet 5: Akun & Dompet ─────────────────────────────────────────────── */
const buildWalletSheet = (wallets, transactions) => {
  const headers = [
    'No', 'Nama Akun', 'Tipe', 'Saldo Saat Ini (IDR)',
    'Total Masuk', 'Total Keluar', 'Jml Transaksi'
  ];

  const rows = wallets.map((w, i) => {
    const acctTx = transactions.filter(t => t.account_id === w.id || t.to_account_id === w.id);
    const masuk  = transactions.filter(t => t.to_account_id === w.id || (t.type === 'income' && t.account_id === w.id)).reduce((s, t) => s + t.amount, 0);
    const keluar = transactions.filter(t => t.account_id === w.id && t.type !== 'income').reduce((s, t) => s + t.amount, 0);
    return [
      i + 1,
      w.name,
      w.type === 'cash' ? 'Tunai' : w.type === 'bank' ? 'Bank' : 'E-Wallet',
      w.balance,
      masuk,
      keluar,
      acctTx.length,
    ];
  });

  // Total
  rows.push([
    'TOTAL', '', '',
    wallets.reduce((s, w) => s + w.balance, 0),
    rows.reduce((s, r) => s + r[4], 0),
    rows.reduce((s, r) => s + r[5], 0),
    rows.reduce((s, r) => s + r[6], 0),
  ]);

  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  setColWidths(ws, [5, 22, 12, 22, 20, 20, 16]);
  return ws;
};

/* ── Sheet 6: Target Tabungan ───────────────────────────────────────────── */
const buildGoalSheet = (goals) => {
  const headers = [
    'No', 'Nama Target', 'Target (IDR)', 'Terkumpul (IDR)',
    'Sisa (IDR)', 'Progress (%)', 'Target Tanggal', 'Status', 'Dibuat'
  ];

  const rows = goals.map((g, i) => {
    const pct = g.target_amount > 0 ? ((g.current_amount / g.target_amount) * 100).toFixed(1) : 0;
    const sisa = g.target_amount - g.current_amount;
    return [
      i + 1,
      g.name,
      g.target_amount,
      g.current_amount,
      sisa,
      `${pct}%`,
      g.target_date ? fmtDate(g.target_date) : 'Tidak Ada Deadline',
      g.status === 'achieved' ? '✅ Tercapai' : '🔄 Sedang Berjalan',
      fmtDate(g.created_at),
    ];
  });

  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  setColWidths(ws, [5, 26, 20, 20, 20, 12, 20, 18, 18]);
  return ws;
};

/* ── Sheet 7: Hutang Piutang ────────────────────────────────────────────── */
const buildDebtSheet = (debts) => {
  const payable    = debts.filter(d => d.type === 'payable');
  const receivable = debts.filter(d => d.type === 'receivable');

  const headers = [
    'No', 'Nama', 'Jenis', 'Jumlah Awal (IDR)', 'Sisa (IDR)',
    'Sudah Dibayar (IDR)', '% Lunas', 'Jatuh Tempo', 'Status', 'Dibuat'
  ];

  const makeRows = (list) => list.map((d, i) => {
    const paid = d.amount - d.remaining_amount;
    const pct  = d.amount > 0 ? ((paid / d.amount) * 100).toFixed(1) : 0;
    return [
      i + 1,
      d.name,
      d.type === 'payable' ? 'Hutang (Harus Bayar)' : 'Piutang (Akan Diterima)',
      d.amount,
      d.remaining_amount,
      paid,
      `${pct}%`,
      d.due_date ? fmtDate(d.due_date) : 'Tidak Ada',
      d.status === 'paid' ? '✅ Lunas' : '🔄 Aktif',
      fmtDate(d.created_at),
    ];
  });

  const allRows = [
    headers,
    ['--- HUTANG (PAYABLE) ---', '', '', '', '', '', '', '', '', ''],
    ...makeRows(payable),
    ['', '', '', '', '', '', '', '', '', ''],
    ['--- PIUTANG (RECEIVABLE) ---', '', '', '', '', '', '', '', '', ''],
    ...makeRows(receivable),
  ];

  const ws = XLSX.utils.aoa_to_sheet(allRows);
  setColWidths(ws, [5, 22, 24, 22, 20, 20, 10, 18, 14, 18]);
  return ws;
};

/* ── Sheet 8: Anggaran Bulanan ──────────────────────────────────────────── */
const buildBudgetSheet = (monthlyExpenses, transactions) => {
  const headers = [
    'No', 'Nama Anggaran', 'Kategori', 'Prioritas', 'Anggaran (IDR)', 'Status', 'Dibuat'
  ];

  const rows = monthlyExpenses
    .sort((a, b) => {
      if (a.priority !== b.priority) return a.priority === 'fixed' ? -1 : 1;
      return b.amount - a.amount;
    })
    .map((m, i) => [
      i + 1,
      m.name,
      m.category?.name || '-',
      m.priority === 'fixed' ? 'Tetap' : 'Opsional',
      m.amount,
      m.is_active ? '✅ Aktif' : '⏸️ Nonaktif',
      fmtDate(m.created_at),
    ]);

  // Summary
  const fixed    = monthlyExpenses.filter(m => m.priority === 'fixed'    && m.is_active).reduce((s, m) => s + m.amount, 0);
  const optional = monthlyExpenses.filter(m => m.priority === 'optional' && m.is_active).reduce((s, m) => s + m.amount, 0);
  const totalMonthlyBudget = fixed + optional;
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  const allRows = [
    headers,
    ...rows,
    ['', '', '', '', '', '', ''],
    ['RINGKASAN ANGGARAN', '', '', '', '', '', ''],
    ['Anggaran Tetap Aktif',   '', '', '', fixed,              '', ''],
    ['Anggaran Opsional Aktif','', '', '', optional,           '', ''],
    ['Total Anggaran Bulanan', '', '', '', totalMonthlyBudget,  '', ''],
    ['Total Pengeluaran Real', '', '', '', totalExpense,        '', ''],
    ['Selisih',                '', '', '', totalMonthlyBudget - totalExpense, '', totalMonthlyBudget >= totalExpense ? 'Dalam Anggaran' : 'Melebihi Anggaran'],
  ];

  const ws = XLSX.utils.aoa_to_sheet(allRows);
  setColWidths(ws, [5, 28, 18, 12, 20, 14, 18]);
  return ws;
};

/* ── Main export function ───────────────────────────────────────────────── */
export const generateExcelReport = ({ transactions, wallets, goals, debts, monthlyExpenses, familyName }) => {
  const generatedAt = new Date().toLocaleString('id-ID', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  const wb = XLSX.utils.book_new();
  wb.Props = {
    Title:    `Laporan Keuangan - ${familyName || 'Keluarga'}`,
    Subject:  'Laporan Keuangan Keluarga FamFinance',
    Author:   'FamFinance App',
    CreatedDate: new Date(),
  };

  const data = { transactions, wallets, goals, debts, monthlyExpenses, familyName, generatedAt };

  XLSX.utils.book_append_sheet(wb, buildSummarySheet(data),                            '📊 Ringkasan');
  XLSX.utils.book_append_sheet(wb, buildTransactionSheet(transactions),                '💸 Transaksi');
  XLSX.utils.book_append_sheet(wb, buildMonthlyAnalysisSheet(transactions),            '📈 Analisis Bulanan');
  XLSX.utils.book_append_sheet(wb, buildCategorySheet(transactions),                   '🏷️ Kategori');
  XLSX.utils.book_append_sheet(wb, buildWalletSheet(wallets, transactions),            '💳 Akun & Dompet');
  XLSX.utils.book_append_sheet(wb, buildGoalSheet(goals),                             '🎯 Target Tabungan');
  XLSX.utils.book_append_sheet(wb, buildDebtSheet(debts),                             '💰 Hutang Piutang');
  XLSX.utils.book_append_sheet(wb, buildBudgetSheet(monthlyExpenses, transactions),   '📋 Anggaran Bulanan');

  // Download
  const fileName = `FamFinance_Laporan_${familyName || 'Keluarga'}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, fileName);

  return { fileName, sheetCount: 8, totalRows: transactions.length };
};

/* ── Filtered Transactions Report Builder ───────────────────────────────── */
const buildFilteredSummarySheet = ({ transactions, activeFilters, familyName, generatedAt }) => {
  const income  = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const transfer = transactions.filter(t => t.type === 'transfer').reduce((s, t) => s + t.amount, 0);
  const netBalance = income - expense;

  const ws = {};
  let row = 0;

  // Title block
  ws[XLSX.utils.encode_cell({ r: row, c: 0 })] = { v: `LAPORAN TRANSAKSI TERFILTER`, t: 's' };
  row++;
  ws[XLSX.utils.encode_cell({ r: row, c: 0 })] = { v: familyName || 'Keluarga', t: 's' };
  row++;
  ws[XLSX.utils.encode_cell({ r: row, c: 0 })] = { v: `Dibuat pada: ${generatedAt}`, t: 's' };
  row += 2;

  // Section: Filters
  ws[XLSX.utils.encode_cell({ r: row, c: 0 })] = { v: 'FILTER YANG DITERAPKAN', t: 's' };
  row++;
  const filterRows = [
    ['Rentang Tanggal / Periode', activeFilters.period || 'Semua Data'],
    ['Filter Dompet', activeFilters.wallet || 'Semua Dompet'],
    ['Filter Anggota', activeFilters.member || 'Semua Anggota'],
  ];
  filterRows.forEach(([label, val]) => {
    ws[XLSX.utils.encode_cell({ r: row, c: 0 })] = { v: label, t: 's' };
    ws[XLSX.utils.encode_cell({ r: row, c: 1 })] = { v: val, t: 's' };
    row++;
  });
  row += 2;

  // Section: Stats
  ws[XLSX.utils.encode_cell({ r: row, c: 0 })] = { v: 'IKHTISAR KEUANGAN PERIODE', t: 's' };
  row++;
  const statsRows = [
    ['Total Pemasukan',          income,         `${transactions.filter(t=>t.type==='income').length} transaksi`],
    ['Total Pengeluaran',        expense,        `${transactions.filter(t=>t.type==='expense').length} transaksi`],
    ['Total Transfer',           transfer,       `${transactions.filter(t=>t.type==='transfer').length} transaksi`],
    ['Selisih (Arus Bersih)',    netBalance,     netBalance >= 0 ? '✅ Surplus' : '⚠️ Defisit'],
    ['Rasio Tabungan',           income > 0 ? `${((netBalance / income) * 100).toFixed(1)}%` : '0%', ''],
  ];
  statsRows.forEach(([label, val, note]) => {
    ws[XLSX.utils.encode_cell({ r: row, c: 0 })] = { v: label, t: 's' };
    ws[XLSX.utils.encode_cell({ r: row, c: 1 })] = { v: val, t: typeof val === 'number' ? 'n' : 's' };
    ws[XLSX.utils.encode_cell({ r: row, c: 2 })] = { v: note, t: 's' };
    row++;
  });

  ws['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: row, c: 2 } });
  setColWidths(ws, [35, 25, 25]);
  return ws;
};

export const generateTransactionsExcel = ({ transactions, wallets, members, activeFilters, familyName }) => {
  const generatedAt = new Date().toLocaleString('id-ID', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  const wb = XLSX.utils.book_new();
  wb.Props = {
    Title:    `Laporan Riwayat Transaksi - ${familyName || 'Keluarga'}`,
    Subject:  'Laporan Transaksi FamFinance',
    Author:   'FamFinance App',
    CreatedDate: new Date(),
  };

  XLSX.utils.book_append_sheet(wb, buildFilteredSummarySheet({ transactions, activeFilters, familyName, generatedAt }), '📊 Ringkasan Filter');
  XLSX.utils.book_append_sheet(wb, buildTransactionSheet(transactions), '💸 Daftar Transaksi');
  XLSX.utils.book_append_sheet(wb, buildCategorySheet(transactions), '🏷️ Analisis Kategori');

  const fileName = `FamFinance_Transaksi_${familyName || 'Keluarga'}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, fileName);

  return { fileName, sheetCount: 3, totalRows: transactions.length };
};
