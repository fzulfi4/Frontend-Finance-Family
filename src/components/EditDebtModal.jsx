import { useState, useEffect } from 'react';
import { WalletCards, Trash2 } from 'lucide-react';
import DatePicker from 'react-datepicker';
import BaseModal from './ui/BaseModal';
import CurrencyInput from './ui/CurrencyInput';
import { useTranslation } from 'react-i18next';

const EditDebtModal = ({ isOpen, onClose, debt, updateDebt, deleteDebt }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    type: 'payable',
    name: '',
    amount: '',
    due_date: '',
  });

  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState('');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  useEffect(() => {
    if (debt && isOpen) {
      setFormData({
        type: debt.type,
        name: debt.name,
        amount: debt.amount,
        due_date: debt.due_date ? new Date(debt.due_date).toISOString().split('T')[0] : '',
      });
      setError('');
      setShowConfirmDelete(false);
    }
  }, [debt, isOpen]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await updateDebt(debt.id, {
        ...formData,
        amount: parseFloat(formData.amount),
        due_date: formData.due_date ? formData.due_date : undefined
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update debt record');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    setError('');
    try {
      await deleteDebt(debt.id);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to delete debt');
      setShowConfirmDelete(false);
    } finally {
      setDeleteLoading(false);
    }
  };

  if (!debt) return null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={t('editDebtRecord')}
      icon={WalletCards}
    >
      {error && <div className="bg-red-500/10 text-accent-red px-4 py-3 rounded-lg mb-6 text-sm border border-red-500/20">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="input-label">{t('debtType')}</label>
          <div className="flex gap-3">
            <button
              type="button"
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                formData.type === 'payable'
                  ? 'bg-accent-red text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
              onClick={() => setFormData({ ...formData, type: 'payable' })}
            >
              {t('iOweSomeone')}
            </button>
            <button
              type="button"
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                formData.type === 'receivable'
                  ? 'bg-accent-green text-black'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
              onClick={() => setFormData({ ...formData, type: 'receivable' })}
            >
              {t('someoneOwesMe')}
            </button>
          </div>
        </div>

        <div>
          <label className="input-label">{t('personOrgName')}</label>
          <input
            type="text"
            name="name"
            className="input-field"
            placeholder={t('egJohnDoe')}
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="input-label">{t('totalAmountIdr')}</label>
          <CurrencyInput
            value={formData.amount}
            onChange={(num) => setFormData(prev => ({ ...prev, amount: num }))}
            required
            min={1}
          />
          <p className="text-xs text-gray-500 mt-1">{t('changingThisUpdatesPrincipal')}</p>
        </div>

        <div>
          <label className="input-label">{t('dueDateOptional')}</label>
          <DatePicker
            selected={formData.due_date ? new Date(formData.due_date) : null}
            onChange={(date) => {
              if (date) {
                const offsetDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
                setFormData({ ...formData, due_date: offsetDate.toISOString().split('T')[0] });
              } else {
                setFormData({ ...formData, due_date: '' });
              }
            }}
            className="input-field"
            dateFormat="yyyy-MM-dd"
            isClearable
            placeholderText={t('selectDate')}
          />
        </div>

        {!showConfirmDelete ? (
          <div className="flex gap-4 pt-4 items-center">
            <button
              type="button"
              className="p-3 rounded-lg border border-red-500/30 text-accent-red hover:bg-red-500/10 transition-colors"
              onClick={() => setShowConfirmDelete(true)}
              title={t('deleteDebt')}
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
            <p className="text-sm text-gray-300 mb-4 text-center">{t('deleteDebtConfirm')}</p>
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

export default EditDebtModal;
