import { useState, useEffect } from 'react';
import { CheckCircle } from 'lucide-react';
import BaseModal from './ui/BaseModal';
import CurrencyInput from './ui/CurrencyInput';
import api from '../api/axios';
import { useTranslation } from 'react-i18next';

const PayDebtModal = ({ isOpen, onClose, onSuccess, debt }) => {
  const { t } = useTranslation();
  const [accounts, setAccounts] = useState([]);
  const [accountId, setAccountId] = useState('');
  const [amount, setAmount] = useState('');

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
      if (debt) {
        setAmount(debt.remaining_amount || 0);
      }
      setError('');
    }
  }, [isOpen, debt]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!accountId) {
      setError(t('pleaseSelectWallet'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post(`/debts/${debt.id}/pay`, {
        account_id: accountId,
        amount: parseFloat(amount)
      });

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to process payment');
    } finally {
      setLoading(false);
    }
  };

  if (!debt) return null;

  const remaining = debt.remaining_amount || 0;
  const formatCurrency = (val) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={t('payDebt')}
      icon={CheckCircle}
      iconColor="text-accent-green"
    >
      {error && <div className="bg-red-500/10 text-accent-red px-4 py-3 rounded-lg mb-6 text-sm border border-red-500/20">{error}</div>}

      <div className="bg-white/5 border border-white/10 p-4 rounded-xl mb-6">
        <p className="text-sm text-gray-400 mb-1">{t('payingToFrom')}</p>
        <p className="font-bold text-lg mb-2">{debt.name}</p>
        <p className="text-sm">
          {t('remainingBalance')}
          <span className="font-bold ml-2 text-white">{formatCurrency(remaining)}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="input-label">{t('paymentAmountIdr')}</label>
          <CurrencyInput
            value={amount}
            onChange={(num) => setAmount(num)}
            required
            min={1}
            max={remaining}
          />
          {amount && parseFloat(amount) > remaining && (
            <p className="text-xs text-accent-red mt-1">
              Nominal melebihi sisa tagihan ({formatCurrency(remaining)})
            </p>
          )}
        </div>

        <div>
          <label className="input-label">{t('selectWallet')}</label>
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
            {loading ? t('processing') : t('confirm')}
          </button>
        </div>
      </form>
    </BaseModal>
  );
};

export default PayDebtModal;
