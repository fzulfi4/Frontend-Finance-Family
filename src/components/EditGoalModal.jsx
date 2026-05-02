import { useState, useEffect } from 'react';
import { Target, Trash2 } from 'lucide-react';
import DatePicker from 'react-datepicker';
import BaseModal from './ui/BaseModal';
import CurrencyInput from './ui/CurrencyInput';
import { useTranslation } from 'react-i18next';

const EditGoalModal = ({ isOpen, onClose, goal, updateGoal, deleteGoal }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    target_amount: '',
    target_date: '',
  });

  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState('');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  useEffect(() => {
    if (goal && isOpen) {
      setFormData({
        name: goal.name,
        target_amount: goal.target_amount,
        target_date: goal.target_date ? new Date(goal.target_date).toISOString().split('T')[0] : '',
      });
      setError('');
      setShowConfirmDelete(false);
    }
  }, [goal, isOpen]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await updateGoal(goal.id, {
        name: formData.name,
        target_amount: parseFloat(formData.target_amount),
        target_date: formData.target_date ? formData.target_date : undefined
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update goal');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    setError('');
    try {
      await deleteGoal(goal.id);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to delete goal');
      setShowConfirmDelete(false);
    } finally {
      setDeleteLoading(false);
    }
  };

  if (!goal) return null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={t('editFinancialGoal')}
      icon={Target}
    >
      {error && <div className="bg-red-500/10 text-accent-red px-4 py-3 rounded-lg mb-6 text-sm border border-red-500/20">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="input-label">{t('goalName')}</label>
          <input
            type="text"
            name="name"
            className="input-field"
            placeholder={t('egNewLaptop')}
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="input-label">{t('targetAmountIdr')}</label>
          <CurrencyInput
            value={formData.target_amount}
            onChange={(num) => setFormData(prev => ({ ...prev, target_amount: num }))}
            required
            min={1}
          />
          <p className="text-xs text-gray-500 mt-1">{t('totalAmountToSave')}</p>
        </div>

        <div>
          <label className="input-label">{t('targetDeadlineOptional')}</label>
          <DatePicker
            selected={formData.target_date ? new Date(formData.target_date) : null}
            onChange={(date) => {
              if (date) {
                const offsetDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
                setFormData({ ...formData, target_date: offsetDate.toISOString().split('T')[0] });
              } else {
                setFormData({ ...formData, target_date: '' });
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
              title={t('deleteGoal')}
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
            <p className="text-sm text-gray-300 mb-4 text-center">{t('deleteGoalConfirm')}</p>
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

export default EditGoalModal;
