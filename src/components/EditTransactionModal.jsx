import { useState, useEffect, useMemo } from 'react';
import { ArrowUpRight, ArrowDownRight, Trash2, ArrowRightLeft } from 'lucide-react';
import DatePicker from 'react-datepicker';
import BaseModal from './ui/BaseModal';
import CurrencyInput from './ui/CurrencyInput';
import { useCategories } from '../hooks/useCategories';
import { useWallets } from '../hooks/useWallets';
import { useMonthlyExpenses } from '../hooks/useMonthlyExpenses';
import { useMonthlyIncomes } from '../hooks/useMonthlyIncomes';
import { useTransactions } from '../hooks/useTransactions';
import { useTranslation } from 'react-i18next';

const EditTransactionModal = ({ isOpen, onClose, transaction, updateTransaction, deleteTransaction }) => {
  const { categories: allCategories } = useCategories(isOpen);
  const { wallets: accounts } = useWallets(isOpen);
  const { expenses: allExpenses } = useMonthlyExpenses(isOpen && transaction?.type === 'expense');
  const { incomes: allIncomes } = useMonthlyIncomes(isOpen && transaction?.type === 'income');
  const { transactions: allTransactions } = useTransactions(isOpen);
  const { t } = useTranslation();
  
  const [formData, setFormData] = useState({
    account_id: '',
    to_account_id: '',
    category_id: '',
    monthly_expense_id: '',
    monthly_income_id: '',
    type: 'expense',
    notes: '',
    amount: '',
    transaction_date: '',
  });

  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState('');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const categories = allCategories.filter(cat => cat.type === formData.type);

  // Filter monthly expenses by selected wallet
  const expenses = useMemo(() => {
    if (formData.type !== 'expense') return [];
    return allExpenses.filter(
      exp => (!exp.account_id || exp.account_id === formData.account_id) && exp.is_active
    );
  }, [allExpenses, formData.account_id, formData.type]);

  // Filter monthly incomes by selected wallet
  const incomes = useMemo(() => {
    if (formData.type !== 'income') return [];
    return allIncomes.filter(
      inc => (!inc.account_id || inc.account_id === formData.account_id) && inc.is_active
    );
  }, [allIncomes, formData.account_id, formData.type]);

  useEffect(() => {
    if (transaction && isOpen) {
      setFormData({
        account_id: transaction.account_id || '',
        to_account_id: transaction.to_account_id || '',
        category_id: transaction.category_id || '',
        monthly_expense_id: transaction.monthly_expense_id || '',
        monthly_income_id: transaction.monthly_income_id || '',
        type: transaction.type || 'expense',
        notes: transaction.notes || '',
        amount: transaction.amount,
        transaction_date: transaction.transaction_date ? new Date(transaction.transaction_date).toISOString().split('T')[0] : '',
      });
      setError('');
      setShowConfirmDelete(false);
    }
  }, [transaction, isOpen]);

  // Handle wallet change or type change to reset or match monthly expense/income
  useEffect(() => {
    if (!isOpen) return;

    if (formData.type === 'expense' && expenses.length > 0) {
      // Hanya set otomatis jika belum ada yang terpilih, jangan timpa yang sudah ada jika tidak ada di list
      // karena mungkin saja anggaran tersebut tidak aktif atau dari dompet lain
      if (!formData.monthly_expense_id) {
        setFormData(prev => ({
          ...prev,
          monthly_expense_id: expenses[0].id,
          category_id: expenses[0].category_id || '',
        }));
      }
    } else if (formData.type === 'income' && incomes.length > 0) {
      if (!formData.monthly_income_id) {
        setFormData(prev => ({
          ...prev,
          monthly_income_id: incomes[0].id,
          category_id: incomes[0].category_id || '',
        }));
      }
    }
  }, [expenses, incomes, formData.type, isOpen, formData.monthly_expense_id, formData.monthly_income_id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.account_id) {
      setError(t('pleaseSelectWallet'));
      return;
    }
    if (formData.type === 'expense' && !formData.monthly_expense_id) {
      setError('Silakan pilih anggaran pengeluaran bulanan');
      return;
    }
    if (formData.type === 'income' && !formData.monthly_income_id) {
      setError('Silakan pilih target pemasukan bulanan');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      await updateTransaction(transaction.id, {
        account_id: formData.account_id,
        to_account_id: formData.type === 'transfer' ? formData.to_account_id : undefined,
        category_id: (formData.type === 'expense' || formData.type === 'income') ? formData.category_id || undefined : (formData.type !== 'transfer' && formData.category_id ? formData.category_id : undefined),
        monthly_expense_id: formData.type === 'expense' ? formData.monthly_expense_id || undefined : undefined,
        monthly_income_id: formData.type === 'income' ? formData.monthly_income_id || undefined : undefined,
        type: formData.type,
        amount: parseFloat(formData.amount),
        transaction_date: formData.transaction_date ? formData.transaction_date : undefined,
        notes: formData.notes
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update transaction');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    setError('');
    try {
      await deleteTransaction(transaction.id);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to delete transaction');
      setShowConfirmDelete(false);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'monthly_expense_id') {
      const selectedExp = expenses.find(exp => exp.id === value);
      setFormData(prev => ({
        ...prev,
        monthly_expense_id: value,
        category_id: selectedExp ? selectedExp.category_id || '' : '',
      }));
    } else if (name === 'monthly_income_id') {
      const selectedInc = incomes.find(inc => inc.id === value);
      setFormData(prev => ({
        ...prev,
        monthly_income_id: value,
        category_id: selectedInc ? selectedInc.category_id || '' : '',
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const isIncome = formData.type === 'income';

  // Budget alert logic for editing
  const budgetAlert = useMemo(() => {
    if (!transaction) return null;
    if (formData.type !== 'expense' || !formData.monthly_expense_id || !formData.amount) return null;
    const selectedExpense = expenses.find(exp => exp.id === formData.monthly_expense_id);
    if (!selectedExpense) return null;

    const limit = selectedExpense.amount;
    const inputAmount = parseFloat(formData.amount) || 0;
    if (inputAmount <= 0) return null;

    const txDate = new Date(formData.transaction_date || new Date());
    const year = txDate.getFullYear();
    const month = txDate.getMonth();

    // Sum other transactions in the same month (excluding the one being edited)
    const monthlySpent = allTransactions
      .filter(t => {
        if (t.id === transaction.id) return false; // exclude current transaction
        if (t.type !== 'expense' || t.monthly_expense_id !== formData.monthly_expense_id) return false;
        const d = new Date(t.transaction_date);
        return d.getFullYear() === year && d.getMonth() === month;
      })
      .reduce((sum, t) => sum + t.amount, 0);

    const projectedTotal = monthlySpent + inputAmount;
    const usagePercent = (projectedTotal / limit) * 100;

    const formatCurrency = (amt) =>
      new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amt);

    if (projectedTotal > limit) {
      return {
        type: 'danger',
        message: `🚨 Batas Anggaran Terlampaui! Pengeluaran ini membuat total pengeluaran '${selectedExpense.name}' menjadi ${formatCurrency(projectedTotal)} bulan ini (Batas limit anggaran: ${formatCurrency(limit)}).`
      };
    } else if (projectedTotal >= limit * 0.8) {
      return {
        type: 'warning',
        message: `⚠️ Mendekati Batas Anggaran! Pengeluaran ini membuat total pengeluaran '${selectedExpense.name}' bulan ini mencapai ${formatCurrency(projectedTotal)} (${usagePercent.toFixed(0)}% dari batas limit ${formatCurrency(limit)}).`
      };
    }
    return null;
  }, [formData.type, formData.monthly_expense_id, formData.amount, formData.transaction_date, expenses, allTransactions, transaction]);

  if (!transaction) return null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={t('editTransaction')}
      icon={formData.type === 'transfer' ? ArrowRightLeft : isIncome ? ArrowUpRight : ArrowDownRight}
      iconColor={formData.type === 'transfer' ? 'text-accent-blue' : isIncome ? 'text-accent-green' : 'text-accent-red'}
    >
      {error && <div className="bg-red-500/10 text-accent-red px-4 py-3 rounded-lg mb-6 text-sm border border-red-500/20">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="input-label">{t('transactionType')}</label>
          <select 
            name="type"
            className="input-field"
            value={formData.type}
            onChange={handleChange}
            required
          >
            <option value="expense">{t('expense')}</option>
            <option value="income">{t('income')}</option>
            <option value="transfer">{t('transfer')}</option>
          </select>
        </div>

        <div>
          <label className="input-label">{t('titleNotes')}</label>
          <input 
            type="text" 
            name="notes"
            className="input-field" 
            placeholder={isIncome ? t('egSalary') : t('egGroceries')} 
            value={formData.notes}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="input-label">{t('amountIdr')}</label>
          <CurrencyInput
            value={formData.amount}
            onChange={(num) => setFormData(prev => ({ ...prev, amount: num }))}
            required
            min={1}
          />
        </div>

        <div>
          <label className="input-label">{t('date')}</label>
          <DatePicker 
            selected={formData.transaction_date ? new Date(formData.transaction_date) : null}
            onChange={(date) => {
              if (date) {
                const offsetDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
                setFormData({ ...formData, transaction_date: offsetDate.toISOString().split('T')[0] });
              } else {
                setFormData({ ...formData, transaction_date: '' });
              }
            }}
            className="input-field" 
            dateFormat="yyyy-MM-dd"
            required
          />
        </div>

        <div>
          <label className="input-label">{t('selectWallet')}</label>
          <select 
            name="account_id"
            className="input-field"
            value={formData.account_id}
            onChange={handleChange}
            required
          >
            <option value="" disabled>{t('selectWalletPlaceholder')}</option>
            {accounts.map(acc => (
              <option key={acc.id} value={acc.id}>{acc.name} ({new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(acc.balance)})</option>
            ))}
          </select>
        </div>

        {formData.type === 'transfer' ? (
          <div>
            <label className="input-label">{t('toWallet')}</label>
            <select 
              name="to_account_id"
              className="input-field"
              value={formData.to_account_id}
              onChange={handleChange}
              required
            >
              <option value="" disabled>{t('selectToWalletPlaceholder')}</option>
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>{acc.name} ({new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(acc.balance)})</option>
              ))}
            </select>
          </div>
        ) : formData.type === 'expense' ? (
          <div>
            <label className="input-label">Anggaran Bulanan (Pengeluaran)</label>
            <select 
              name="monthly_expense_id"
              className="input-field"
              value={formData.monthly_expense_id}
              onChange={handleChange}
              required
            >
              <option value="" disabled>Pilih anggaran pengeluaran bulanan...</option>
              {expenses.map(exp => (
                <option key={exp.id} value={exp.id}>
                  {exp.name} (Limit: {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(exp.amount)})
                </option>
              ))}
            </select>
            {expenses.length === 0 && (
              <p className="text-[10px] text-accent-red mt-1">
                Tidak ada anggaran pengeluaran bulanan aktif untuk dompet ini. Silakan buat anggaran terlebih dahulu di menu Anggaran.
              </p>
            )}
          </div>
        ) : (
          <div>
            <label className="input-label">Pemasukan Bulanan (Target)</label>
            <select 
              name="monthly_income_id"
              className="input-field"
              value={formData.monthly_income_id}
              onChange={handleChange}
              required
            >
              <option value="" disabled>Pilih target pemasukan bulanan...</option>
              {incomes.map(inc => (
                <option key={inc.id} value={inc.id}>
                  {inc.name} (Target: {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(inc.amount)})
                </option>
              ))}
            </select>
            {incomes.length === 0 && (
              <p className="text-[10px] text-accent-red mt-1">
                Tidak ada target pemasukan bulanan aktif untuk dompet ini. Silakan buat terlebih dahulu di menu Pemasukan Bulanan.
              </p>
            )}
          </div>
        )}

        {budgetAlert && (
          <div className={`p-3.5 rounded-xl border text-xs font-semibold leading-relaxed animate-fade-in ${
            budgetAlert.type === 'danger'
              ? 'bg-red-500/10 border-red-500/20 text-red-300'
              : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-300'
          }`}>
            {budgetAlert.message}
          </div>
        )}

        {!showConfirmDelete ? (
          <div className="flex gap-4 pt-4 items-center">
            <button 
              type="button" 
              className="p-3 rounded-lg border border-red-500/30 text-accent-red hover:bg-red-500/10 transition-colors"
              onClick={() => setShowConfirmDelete(true)}
              title={t('deleteTransaction')}
            >
              <Trash2 size={20} />
            </button>
            <button type="button" className="btn btn-secondary flex-1" onClick={onClose}>
              {t('cancel')}
            </button>
            <button type="submit" className="btn btn-primary flex-1" disabled={loading || deleteLoading || (formData.type === 'expense' && expenses.length === 0) || (formData.type === 'income' && incomes.length === 0)}>
              {loading ? t('saving') : t('saveChanges')}
            </button>
          </div>
        ) : (
          <div className="pt-4 p-4 border border-red-500/30 rounded-xl bg-red-500/5 mt-4">
            <p className="text-sm text-gray-300 mb-4 text-center">{t('deleteTransactionConfirm')}</p>
            <div className="flex gap-3">
              <button 
                type="button" 
                className="btn border border-red-500 text-white bg-accent-red hover:bg-red-600 flex-1"
                onClick={handleDelete}
                disabled={deleteLoading || loading}
              >
                {deleteLoading ? t('deleting') : t('yesDelete')}
              </button>
              <button 
                type="button" 
                className="btn btn-secondary flex-1"
                onClick={() => setShowConfirmDelete(false)}
                disabled={deleteLoading}
              >
                {t('cancel')}
              </button>
            </div>
          </div>
        )}
      </form>
    </BaseModal>
  );
};

export default EditTransactionModal;
