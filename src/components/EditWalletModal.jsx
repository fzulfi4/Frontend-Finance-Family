import { useState, useEffect } from 'react';
import { Wallet, Trash2 } from 'lucide-react';
import BaseModal from './ui/BaseModal';
import CurrencyInput from './ui/CurrencyInput';
import { useTranslation } from 'react-i18next';

const EditWalletModal = ({ isOpen, onClose, wallet, updateWallet, deleteWallet }) => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [type, setType] = useState('cash');
  const [balance, setBalance] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState('');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  useEffect(() => {
    if (wallet && isOpen) {
      setName(wallet.name);
      setType(wallet.type);
      setBalance(wallet.balance);
      setError('');
      setShowConfirmDelete(false);
    }
  }, [wallet, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await updateWallet(wallet.id, {
        name,
        type,
        balance: parseFloat(balance) || 0
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update wallet');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    setError('');
    try {
      await deleteWallet(wallet.id);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to delete wallet');
      setShowConfirmDelete(false);
    } finally {
      setDeleteLoading(false);
    }
  };

  if (!wallet) return null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={t('editWallet')}
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
          <label className="input-label">{t('balanceIdr')}</label>
          <CurrencyInput
            value={balance}
            onChange={(num) => setBalance(num)}
            min={0}
          />
        </div>

        {!showConfirmDelete ? (
          <div className="flex gap-4 pt-4 items-center">
            <button
              type="button"
              className="p-3 rounded-lg border border-red-500/30 text-accent-red hover:bg-red-500/10 transition-colors"
              onClick={() => setShowConfirmDelete(true)}
              title={t('deleteWallet')}
            >
              <Trash2 size={20} />
            </button>
            <button type="button" className="btn btn-secondary flex-1" onClick={onClose}>
              {t('cancel')}
            </button>
            <button type="submit" className="btn btn-primary flex-1" disabled={loading || deleteLoading}>
              {loading ? t('saving') : t('save')}
            </button>
          </div>
        ) : (
          <div className="pt-4 p-4 border border-red-500/30 rounded-xl bg-red-500/5 mt-4">
            <p className="text-sm text-gray-300 mb-4 text-center">{t('deleteWalletConfirm')}</p>
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

export default EditWalletModal;
