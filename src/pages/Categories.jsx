import { useState, useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useCategories } from '../hooks/useCategories';
import { Tags, Plus, ArrowUpRight, ArrowDownRight, AlertTriangle, Edit2 } from 'lucide-react';
import CategoryModal from '../components/CategoryModal';
import { useTranslation } from 'react-i18next';

const Categories = () => {
  const { user } = useContext(AuthContext);
  const { categories, loading, error, createCategory, updateCategory, deleteCategory } = useCategories(!!user?.family_id);
  const { t } = useTranslation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  if (!user?.family_id) {
    return <Navigate to="/onboarding" />;
  }

  const incomeCategories = categories.filter(c => c.type === 'income');
  const expenseCategories = categories.filter(c => c.type === 'expense');

  const handleOpenModal = (category = null) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const handleSubmit = async (data) => {
    if (selectedCategory) {
      await updateCategory(selectedCategory.id, data);
    } else {
      await createCategory(data);
    }
  };

  const handleDelete = async (id) => {
    await deleteCategory(id);
  };

  return (
    <div className="p-4 md:p-10 space-y-6 md:space-y-8 max-w-5xl mx-auto">
      <header className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl md:text-4xl font-bold text-white mb-0.5 flex items-center gap-2 truncate">
            <Tags className="text-accent-blue flex-shrink-0" size={22} />
            {t('categories')}
          </h1>
          <p className="text-gray-400 text-sm md:text-lg">{t('manageCategories')}</p>
        </div>
        <button 
          onClick={() => handleOpenModal()} 
          className="btn btn-primary flex-shrink-0"
        >
          <Plus size={18} />
          <span className="hidden sm:inline">{t('newCategory')}</span>
        </button>
      </header>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3">
          <AlertTriangle className="text-accent-red shrink-0" size={24} />
          <p className="text-accent-red">{error}</p>
        </div>
      )}

      {loading && categories.length === 0 ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-accent-blue/30 border-t-accent-blue rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Income Categories */}
          <div className="glass-panel flex flex-col">
            <h2 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-3 flex items-center gap-2">
              <div className="p-1.5 rounded bg-green-500/20 text-accent-green">
                <ArrowUpRight size={18} />
              </div>
              {t('income')}
            </h2>
            <div className="flex-1 space-y-3">
              {incomeCategories.length === 0 ? (
                <p className="text-gray-500 text-center py-8">{t('noIncomeCategoriesFound')}</p>
              ) : (
                incomeCategories.map(cat => (
                  <div key={cat.id} className="flex justify-between items-center p-3 rounded-xl bg-black/20 border border-white/5 group transition-colors hover:bg-white/5">
                    <p className="font-medium text-white">{cat.name}</p>
                    <button 
                      onClick={() => handleOpenModal(cat)}
                      className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100"
                      title={t('edit')}
                    >
                      <Edit2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Expense Categories */}
          <div className="glass-panel flex flex-col">
            <h2 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-3 flex items-center gap-2">
              <div className="p-1.5 rounded bg-red-500/20 text-accent-red">
                <ArrowDownRight size={18} />
              </div>
              {t('expense')}
            </h2>
            <div className="flex-1 space-y-3">
              {expenseCategories.length === 0 ? (
                <p className="text-gray-500 text-center py-8">{t('noExpenseCategoriesFound')}</p>
              ) : (
                expenseCategories.map(cat => (
                  <div key={cat.id} className="flex justify-between items-center p-3 rounded-xl bg-black/20 border border-white/5 group transition-colors hover:bg-white/5">
                    <p className="font-medium text-white">{cat.name}</p>
                    <button 
                      onClick={() => handleOpenModal(cat)}
                      className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100"
                      title={t('edit')}
                    >
                      <Edit2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      )}

      <CategoryModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        category={selectedCategory}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default Categories;
