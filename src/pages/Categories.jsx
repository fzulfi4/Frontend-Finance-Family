import { useState, useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useCategories } from '../hooks/useCategories';
import { Tags, Plus, ArrowUpRight, ArrowDownRight, AlertTriangle, Edit2 } from 'lucide-react';
import CategoryModal from '../components/CategoryModal';
import { useTranslation } from 'react-i18next';

const CategorySection = ({ title, icon: Icon, iconClass, categories, onEdit }) => (
  <div className="card p-0 overflow-hidden bg-[#0c0e1b]/55 border-white/5 shadow-2xl">
    {/* Section header */}
    <div className={`flex items-center gap-3 px-5 py-4 border-b border-white/[0.04] bg-black/10 ${iconClass}`}>
      <Icon size={18} />
      <h2 className="font-bold text-white text-sm tracking-wide">{title}</h2>
      <span className="ml-auto badge badge-blue text-[10px] uppercase font-bold tracking-wider">{categories.length}</span>
    </div>

    {/* Items */}
    <div className="divide-y divide-white/[0.04]">
      {categories.length === 0 ? (
        <div className="p-12 text-center">
          <p className="text-sm text-gray-500 font-semibold">Belum ada kategori</p>
        </div>
      ) : (
        categories.map(cat => (
          <div
            key={cat.id}
            className="flex justify-between items-center px-5 py-3.5 group hover:bg-white/[0.02] transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              {/* Color dot */}
              <span
                className="w-3 h-3 rounded-full flex-shrink-0 border border-white/10 shadow-sm"
                style={{ backgroundColor: cat.color || '#6b7280' }}
              />
              <p className="font-bold text-gray-200 text-sm truncate">{cat.name}</p>
            </div>
            <button
              onClick={() => onEdit(cat)}
              className="flex-shrink-0 p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/10
                         opacity-0 group-hover:opacity-100 transition-all border border-transparent hover:border-white/5 cursor-pointer"
              title="Edit"
            >
              <Edit2 size={13} />
            </button>
          </div>
        ))
      )}
    </div>
  </div>
);

const Categories = () => {
  const { user }       = useContext(AuthContext);
  const { categories, loading, error, createCategory, updateCategory, deleteCategory } = useCategories(!!user?.family_id);
  const { t }          = useTranslation();

  const [isModalOpen, setIsModalOpen]         = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  if (!user?.family_id) return <Navigate to="/onboarding" />;

  const incomeCategories  = categories.filter(c => c.type === 'income');
  const expenseCategories = categories.filter(c => c.type === 'expense');

  const handleOpenModal = (category = null) => { setSelectedCategory(category); setIsModalOpen(true); };

  const handleSubmit = async (data) => {
    if (selectedCategory) await updateCategory(selectedCategory.id, data);
    else                  await createCategory(data);
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto pb-safe animate-fade-in">

      {/* Header */}
      <header className="page-header relative overflow-hidden p-6 rounded-3xl bg-gradient-to-r from-accent-blue/10 via-accent-violet/5 to-transparent border border-white/5 backdrop-blur-xl">
        <div className="absolute -right-16 -top-16 w-48 h-48 bg-accent-blue/10 rounded-full blur-3xl pointer-events-none" />
        <div>
          <h1 className="page-title flex items-center gap-2.5">
            <Tags size={24} className="text-accent-blue animate-pulse" />
            {t('categories')}
          </h1>
          <p className="page-subtitle">{t('manageCategories')}</p>
        </div>
        <button 
          onClick={() => handleOpenModal()} 
          className="btn btn-primary flex-shrink-0 mt-3 sm:mt-0 shadow-lg active:scale-95 transition-all"
        >
          <Plus size={18} />
          <span>{t('newCategory')}</span>
        </button>
      </header>

      {/* Error */}
      {error && (
        <div className="p-4 rounded-2xl bg-accent-red/8 border border-accent-red/20 flex items-center gap-3 shadow-md">
          <AlertTriangle className="text-accent-red shrink-0" size={20} />
          <p className="text-sm text-accent-red font-semibold leading-relaxed">{error}</p>
        </div>
      )}

      {/* Loading */}
      {loading && categories.length === 0 ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-white/10 border-t-accent-blue rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CategorySection
            title={t('income')}
            icon={ArrowUpRight}
            iconClass="text-accent-greenLt"
            categories={incomeCategories}
            onEdit={handleOpenModal}
          />
          <CategorySection
            title={t('expense')}
            icon={ArrowDownRight}
            iconClass="text-accent-redLt"
            categories={expenseCategories}
            onEdit={handleOpenModal}
          />
        </div>
      )}

      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        category={selectedCategory}
        onSubmit={handleSubmit}
        onDelete={deleteCategory}
      />
    </div>
  );
};

export default Categories;
