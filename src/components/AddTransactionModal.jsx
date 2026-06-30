import { useState, useEffect, useMemo } from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import DatePicker from 'react-datepicker';
import BaseModal from './ui/BaseModal';
import CurrencyInput from './ui/CurrencyInput';
import api from '../api/axios';
import { useCategories } from '../hooks/useCategories';
import { useMonthlyExpenses } from '../hooks/useMonthlyExpenses';
import { useMonthlyIncomes } from '../hooks/useMonthlyIncomes';
import { useTransactions } from '../hooks/useTransactions';
import { useTranslation } from 'react-i18next';

const AddTransactionModal = ({ isOpen, onClose, onSuccess, accounts, type = 'expense' }) => {
  const { categories: allCategories, createCategory } = useCategories(isOpen);
  const { expenses: allExpenses } = useMonthlyExpenses(isOpen && type === 'expense');
  const { incomes: allIncomes } = useMonthlyIncomes(isOpen && type === 'income');
  const { transactions: allTransactions } = useTransactions(isOpen);
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    account_id: '',
    category_id: '',
    monthly_expense_id: '',
    monthly_income_id: '',
    notes: '',
    amount: '',
    transaction_date: new Date().toISOString().split('T')[0],
  });

  const [newCategoryName, setNewCategoryName] = useState('');
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = allCategories.filter(cat => cat.type === type);

  // Filter monthly expenses by selected wallet
  const expenses = useMemo(() => {
    if (type !== 'expense') return [];
    return allExpenses.filter(
      exp => (!exp.account_id || exp.account_id === formData.account_id) && exp.is_active
    );
  }, [allExpenses, formData.account_id, type]);

  // Filter monthly incomes by selected wallet
  const incomes = useMemo(() => {
    if (type !== 'income') return [];
    return allIncomes.filter(
      inc => (!inc.account_id || inc.account_id === formData.account_id) && inc.is_active
    );
  }, [allIncomes, formData.account_id, type]);

  useEffect(() => {
    if (isOpen) {
      if (accounts.length > 0 && !formData.account_id) {
        setFormData(prev => ({ ...prev, account_id: accounts[0].id }));
      }
    }
  }, [isOpen, accounts, formData.account_id]);

  // Handle default selection for category or monthly expense/income
  useEffect(() => {
    if (!isOpen) return;

    if (type === 'expense') {
      if (expenses.length > 0) {
        if (!formData.monthly_expense_id || !expenses.some(e => e.id === formData.monthly_expense_id)) {
          setFormData(prev => ({
            ...prev,
            monthly_expense_id: expenses[0].id,
            category_id: expenses[0].category_id || '',
          }));
        }
      } else {
        setFormData(prev => ({
          ...prev,
          monthly_expense_id: '',
          category_id: '',
        }));
      }
    } else if (type === 'income') {
      if (incomes.length > 0) {
        if (!formData.monthly_income_id || !incomes.some(i => i.id === formData.monthly_income_id)) {
          setFormData(prev => ({
            ...prev,
            monthly_income_id: incomes[0].id,
            category_id: incomes[0].category_id || '',
          }));
        }
      } else {
        setFormData(prev => ({
          ...prev,
          monthly_income_id: '',
          category_id: '',
        }));
      }
    } else {
      if (categories.length > 0 && !formData.category_id) {
        setFormData(prev => ({ ...prev, category_id: categories[0].id }));
      }
    }
  }, [isOpen, type, expenses, incomes, categories, formData.monthly_expense_id, formData.monthly_income_id, formData.category_id]);

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      const newCat = await createCategory({ name: newCategoryName, type, icon: '' });
      setFormData(prev => ({ ...prev, category_id: newCat.id }));
      setNewCategoryName('');
      setShowNewCategory(false);
    } catch (err) {
      setError(err.message || 'Failed to create category');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (type === 'expense') {
      if (!formData.account_id || !formData.monthly_expense_id) {
        setError('Silakan pilih dompet dan anggaran pengeluaran bulanan');
        return;
      }
    } else if (type === 'income') {
      if (!formData.account_id || !formData.monthly_income_id) {
        setError('Silakan pilih dompet dan target pemasukan bulanan');
        return;
      }
    } else {
      if (!formData.account_id || !formData.category_id) {
        setError(t('pleaseSelectWalletAndCategory'));
        return;
      }
    }

    setLoading(true);
    setError('');

    try {
      await api.post('/transactions', {
        ...formData,
        type,
        amount: parseFloat(formData.amount),
        transaction_date: formData.transaction_date,
        monthly_expense_id: type === 'expense' ? formData.monthly_expense_id || undefined : undefined,
        monthly_income_id: type === 'income' ? formData.monthly_income_id || undefined : undefined,
        category_id: (type === 'expense' || type === 'income') ? formData.category_id || undefined : formData.category_id,
      });
      
      setFormData({
        account_id: accounts[0]?.id || '',
        category_id: '',
        monthly_expense_id: '',
        monthly_income_id: '',
        notes: '',
        amount: '',
        transaction_date: new Date().toISOString().split('T')[0],
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save transaction');
    } finally {
      setLoading(false);
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

  const isIncome = type === 'income';

  // Budget alert logic
  const budgetAlert = useMemo(() => {
    if (type !== 'expense' || !formData.monthly_expense_id || !formData.amount) return null;
    const selectedExpense = expenses.find(exp => exp.id === formData.monthly_expense_id);
    if (!selectedExpense) return null;

    const limit = selectedExpense.amount;
    const inputAmount = parseFloat(formData.amount) || 0;
    if (inputAmount <= 0) return null;

    const txDate = new Date(formData.transaction_date || new Date());
    const year = txDate.getFullYear();
    const month = txDate.getMonth();

    // Sum transactions in the same month for this monthly expense budget
    const monthlySpent = allTransactions
      .filter(t => {
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
  }, [type, formData.monthly_expense_id, formData.amount, formData.transaction_date, expenses, allTransactions]);

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={isIncome ? t('addIncome') : t('addExpense')}
      icon={isIncome ? ArrowUpRight : ArrowDownRight}
      iconColor={isIncome ? 'text-accent-green' : 'text-accent-red'}
    >
      {error && <div className="bg-red-500/10 text-accent-red px-4 py-3 rounded-lg mb-6 text-sm border border-red-500/20">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
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

        {type === 'expense' ? (
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

        <div className="flex gap-4 pt-4">
          <button type="button" className="btn btn-secondary flex-1" onClick={onClose}>
            {t('cancel')}
          </button>
          <button type="submit" className="btn btn-primary flex-1" disabled={loading || (type === 'expense' && expenses.length === 0) || (type === 'income' && incomes.length === 0)}>
            {loading ? t('saving') : t('saveTransaction')}
          </button>
        </div>
      </form>
    </BaseModal>
  );
};

export default AddTransactionModal;
