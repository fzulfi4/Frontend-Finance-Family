import { useState, useEffect } from 'react';
import { Tags, Trash2 } from 'lucide-react';
import BaseModal from './ui/BaseModal';
import { useTranslation } from 'react-i18next';

const CategoryModal = ({ isOpen, onClose, category, onSubmit, onDelete }) => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [type, setType] = useState('expense');
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState('');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const isEdit = !!category;

  useEffect(() => {
    if (isOpen) {
      if (isEdit) {
        setName(category.name);
        setType(category.type);
      } else {
        setName('');
        setType('expense');
      }
      setError('');
      setShowConfirmDelete(false);
    }
  }, [isOpen, category, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await onSubmit({ name, type, icon: '' }); // passing empty icon for now
      onClose();
    } catch (err) {
      setError(err.message || `Failed to ${isEdit ? 'update' : 'create'} category`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    setError('');
    try {
      await onDelete(category.id);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to delete category');
      setShowConfirmDelete(false);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <BaseModal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={isEdit ? t('editCategory') : t('addNewCategory')}
      icon={Tags}
    >
      {error && <div className="bg-red-500/10 text-accent-red px-4 py-3 rounded-lg mb-6 text-sm border border-red-500/20">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="input-label">{t('categoryName')}</label>
          <input 
            type="text" 
            className="input-field" 
            placeholder={t('egFood')} 
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />
        </div>

        <div>
          <label className="input-label">{t('categoryType')}</label>
          <select 
            className="input-field"
            value={type}
            onChange={(e) => setType(e.target.value)}
            required
            disabled={isEdit} // Optional: disable changing type when editing
          >
            <option value="expense">{t('expense')}</option>
            <option value="income">{t('income')}</option>
          </select>
          {isEdit && <p className="text-xs text-gray-500 mt-2">{t('typeCannotBeChanged')}</p>}
        </div>

        {!showConfirmDelete ? (
          <div className="flex gap-4 pt-4 items-center">
            {isEdit && (
              <button 
                type="button" 
                className="p-3 rounded-lg border border-red-500/30 text-accent-red hover:bg-red-500/10 transition-colors"
                onClick={() => setShowConfirmDelete(true)}
                title={t('deleteCategory')}
              >
                <Trash2 size={20} />
              </button>
            )}
            <button type="button" className="btn btn-secondary flex-1" onClick={onClose}>
              {t('cancel')}
            </button>
            <button type="submit" className="btn btn-primary flex-1" disabled={loading || deleteLoading}>
              {loading ? t('saving') : t('save')}
            </button>
          </div>
        ) : (
          <div className="pt-4 p-4 border border-red-500/30 rounded-xl bg-red-500/5 mt-4">
            <p className="text-sm text-gray-300 mb-4 text-center">{t('deleteCategoryConfirm')}</p>
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

export default CategoryModal;
