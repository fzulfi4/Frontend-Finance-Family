import { useState } from 'react';
import { Wallet } from 'lucide-react';
import BaseModal from './ui/BaseModal';
import CurrencyInput from './ui/CurrencyInput';
import api from '../api/axios';
import { useTranslation } from 'react-i18next';

const AddWalletModal = ({ isOpen, onClose, onSuccess }) => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [type, setType] = useState('cash');
  const [balance, setBalance] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/accounts', {
        name,
        type,
        balance: parseFloat(balance) || 0
      });
      setName('');
      setType('cash');
      setBalance('');
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create wallet');
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={t('addNewWallet')}
      icon={Wallet}
    >
      {error && <div className="bg-red-500/10 text-accent-red px-4 py-3 rounded-lg mb-6 text-sm border border-red-500/20">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="input-label">{t('walletName')}</label>
          <input
            type="text"
            className="input-field"
            placeholder={t('egBank')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="input-label">{t('walletType')}</label>
          <select
            className="input-field"
            value={type}
            onChange={(e) => setType(e.target.value)}
            required
          >
            <option value="cash">{t('cash')}</option>
            <option value="bank">{t('bank')}</option>
            <option value="e-wallet">{t('eWallet')}</option>
          </select>
        </div>

        <div>
          <label className="input-label">{t('initialBalanceIdr')}</label>
          <CurrencyInput
            value={balance}
            onChange={(num) => setBalance(num)}
            min={0}
          />
        </div>

        <div className="flex gap-4 pt-4">
          <button type="button" className="btn btn-secondary flex-1" onClick={onClose}>
            {t('cancel')}
          </button>
          <button type="submit" className="btn btn-primary flex-1" disabled={loading}>
            {loading ? t('saving') : t('saveWallet')}
          </button>
        </div>
      </form>
    </BaseModal>
  );
};

export default AddWalletModal;
