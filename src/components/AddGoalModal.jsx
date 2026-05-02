import { useState } from 'react';
import { Target } from 'lucide-react';
import DatePicker from 'react-datepicker';
import BaseModal from './ui/BaseModal';
import CurrencyInput from './ui/CurrencyInput';
import api from '../api/axios';
import { useTranslation } from 'react-i18next';

const AddGoalModal = ({ isOpen, onClose, onSuccess }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    target_amount: '',
    target_date: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/goals', {
        name: formData.name,
        target_amount: parseFloat(formData.target_amount),
        target_date: formData.target_date ? formData.target_date : undefined
      });

      setFormData({ name: '', target_amount: '', target_date: '' });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create goal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={t('createFinancialGoal')}
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

        <div className="flex gap-4 pt-4">
          <button type="button" className="btn btn-secondary flex-1" onClick={onClose}>
            {t('cancel')}
          </button>
          <button type="submit" className="btn btn-primary flex-1" disabled={loading}>
            {loading ? t('saving') : t('saveGoal')}
          </button>
        </div>
      </form>
    </BaseModal>
  );
};

export default AddGoalModal;
