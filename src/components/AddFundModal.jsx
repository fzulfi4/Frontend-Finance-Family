import { useState, useEffect } from 'react';
import { TrendingUp } from 'lucide-react';
import BaseModal from './ui/BaseModal';
import api from '../api/axios';
import { useTranslation } from 'react-i18next';

const AddFundModal = ({ isOpen, onClose, onSuccess, goal }) => {
  const { t } = useTranslation();
  const [accounts, setAccounts] = useState([]);
  const [accountId, setAccountId] = useState('');
  const [rawAmount, setRawAmount] = useState(''); // actual numeric string
  const [displayAmount, setDisplayAmount] = useState(''); // formatted display

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchAccounts = async () => {
    try {
      const res = await api.get('/accounts');
      const fetchedAccounts = res.data.data || [];
      setAccounts(fetchedAccounts);
      if (fetchedAccounts.length > 0) {
        setAccountId(fetchedAccounts[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch accounts', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAccounts();
      setRawAmount('');
      setDisplayAmount('');
      setError('');
    }
  }, [isOpen]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  const handleAmountChange = (e) => {
    // Strip all non-digits
    const digits = e.target.value.replace(/\D/g, '');
    setRawAmount(digits);

    // Format display with thousand separators
    if (digits === '') {
      setDisplayAmount('');
    } else {
      const num = parseInt(digits, 10);
      setDisplayAmount(new Intl.NumberFormat('id-ID').format(num));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!accountId) {
      setError(t('pleaseSelectWallet'));
      return;
    }
    if (!rawAmount || parseInt(rawAmount, 10) < 1) {
      setError('Masukkan nominal yang valid');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post(`/goals/${goal.id}/add-fund`, {
        account_id: accountId,
        amount: parseInt(rawAmount, 10)
      });

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add funds');
    } finally {
      setLoading(false);
    }
  };

  if (!goal) return null;

  const remaining = goal.target_amount - goal.current_amount;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={t('addFundsToGoal')}
      icon={TrendingUp}
    >
      {error && <div className="bg-red-500/10 text-accent-red px-4 py-3 rounded-lg mb-6 text-sm border border-red-500/20">{error}</div>}

      <div className="bg-white/5 border border-white/10 p-4 rounded-xl mb-6">
        <p className="text-sm text-gray-400 mb-1">{t('funding')}</p>
        <p className="font-bold text-lg mb-2">{goal.name}</p>
        <p className="text-sm">
          {t('remainingToGoal')}
          <span className="font-bold ml-2 text-white">
            {formatCurrency(remaining)}
          </span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="input-label">{t('depositAmountIdr')}</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-sm select-none">Rp</span>
            <input
              type="text"
              inputMode="numeric"
              className="input-field pl-10"
              placeholder="0"
              value={displayAmount}
              onChange={handleAmountChange}
              required
            />
          </div>
          {rawAmount && parseInt(rawAmount, 10) > remaining && (
            <p className="text-xs text-accent-red mt-1">
              Nominal melebihi sisa target ({formatCurrency(remaining)})
            </p>
          )}
        </div>

        <div>
          <label className="input-label">{t('sourceWallet')}</label>
          <select
            className="input-field"
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            required
          >
            <option value="" disabled>{t('selectWalletPlaceholder')}</option>
            {accounts.map(acc => (
              <option key={acc.id} value={acc.id}>
                {acc.name} ({formatCurrency(acc.balance)})
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-4 pt-4">
          <button type="button" className="btn btn-secondary flex-1" onClick={onClose}>
            {t('cancel')}
          </button>
          <button type="submit" className="btn btn-primary flex-1" disabled={loading}>
            {loading ? t('processing') : t('confirmDeposit')}
          </button>
        </div>
      </form>
    </BaseModal>
  );
};

export default AddFundModal;
