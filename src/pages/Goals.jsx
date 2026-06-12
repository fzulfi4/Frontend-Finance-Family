import { useState } from 'react';
import { Plus, Target, TrendingUp, CheckCircle, Flag } from 'lucide-react';
import { useGoals } from '../hooks/useGoals';
import Card from '../components/ui/Card';
import AddGoalModal from '../components/AddGoalModal';
import AddFundModal from '../components/AddFundModal';
import EditGoalModal from '../components/EditGoalModal';
import { Edit2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Goals = () => {
  const { goals, loading, fetchGoals, updateGoal, deleteGoal } = useGoals();
  const { t } = useTranslation();
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isFundModalOpen, setIsFundModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  const handleFundClick = (goal) => {
    setSelectedGoal(goal);
    setIsFundModalOpen(true);
  };

  const handleEditClick = (goal) => {
    setSelectedGoal(goal);
    setIsEditModalOpen(true);
  };

  if (loading) return <div className="p-8 text-gray-400">{t('loadingGoals')}</div>;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-5">
      <header className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl md:text-3xl font-bold mb-0.5 truncate">{t('financialGoals')}</h1>
          <p className="text-gray-400 text-sm">{t('trackAndAchieve')}</p>
        </div>
        <button className="btn btn-primary flex-shrink-0" onClick={() => setIsAddModalOpen(true)}>
          <Plus size={18} />
          <span className="hidden sm:inline">{t('newGoal')}</span>
        </button>
      </header>

      {/* Goal List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
        {goals.length === 0 ? (
          <Card className="col-span-full text-center py-16">
            <Target size={64} className="mx-auto text-gray-600 mb-6" />
            <h3 className="text-xl font-medium mb-2">{t('noGoalsSetYet')}</h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">{t('startPlanningFuture')}</p>
            <button className="btn btn-primary mx-auto" onClick={() => setIsAddModalOpen(true)}>
              {t('createYourFirstGoal')}
            </button>
          </Card>
        ) : (
          goals.map((goal) => {
            const isCompleted = goal.status === 'completed';
            const progress = Math.min((goal.current_amount / goal.target_amount) * 100, 100);

            return (
              <Card key={goal.id} className={`flex flex-col relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_40px_rgba(0,0,0,0.5)] ${isCompleted ? 'border-accent-green/30 bg-accent-green/5' : ''}`}>
                
                {isCompleted && (
                  <div className="absolute top-0 right-0 bg-accent-green text-black text-xs font-bold px-4 py-1 rounded-bl-lg z-10">
                    {t('achieved')}
                  </div>
                )}

                <div className="flex items-start gap-4 mb-6">
                  <div className={`p-3 rounded-xl ${isCompleted ? 'bg-green-500/20' : 'bg-blue-500/10'}`}>
                    {isCompleted ? <CheckCircle size={24} className="text-accent-green" /> : <Flag size={24} className="text-accent-blue" />}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold m-0 pr-10 flex items-center gap-2 group/title">
                      {goal.name}
                      <button 
                        onClick={() => handleEditClick(goal)}
                        className="text-gray-500 hover:text-white transition-colors opacity-0 group-hover/title:opacity-100 p-1"
                        title={t('edit')}
                      >
                        <Edit2 size={16} />
                      </button>
                    </h3>
                    {goal.target_date && (
                      <p className="text-sm text-gray-400 mt-1">
                        {t('target')}: {new Date(goal.target_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mb-6 flex-1">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">{t('progress')}</span>
                    <span className="font-bold">{progress.toFixed(1)}%</span>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full h-2 bg-black/50 rounded-full overflow-hidden border border-white/5">
                    <div 
                      className={`h-full transition-all duration-1000 ease-out ${isCompleted ? 'bg-accent-green' : 'bg-accent-blue shadow-[0_0_10px_rgba(41,121,255,0.8)]'}`}
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex justify-between items-end mb-6 bg-black/20 p-4 rounded-xl border border-white/5">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">{t('savedSoFar')}</p>
                    <p className={`font-bold text-lg ${isCompleted ? 'text-accent-green' : 'text-white'}`}>{formatCurrency(goal.current_amount)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400 mb-1">{t('target')}</p>
                    <p className="font-semibold text-gray-300">{formatCurrency(goal.target_amount)}</p>
                  </div>
                </div>

                {!isCompleted && (
                  <button 
                    className="btn btn-secondary w-full"
                    onClick={() => handleFundClick(goal)}
                  >
                    <TrendingUp size={18} /> {t('addFunds')}
                  </button>
                )}
              </Card>
            );
          })
        )}
      </div>

      <AddGoalModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSuccess={fetchGoals} 
      />

      <AddFundModal
        isOpen={isFundModalOpen}
        onClose={() => setIsFundModalOpen(false)}
        onSuccess={fetchGoals}
        goal={selectedGoal}
      />

      <EditGoalModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        goal={selectedGoal}
        updateGoal={updateGoal}
        deleteGoal={deleteGoal}
      />
    </div>
  );
};

export default Goals;
