import { useState } from 'react';
import { Plus, Target, TrendingUp, CheckCircle, Flag, Edit2, Calendar, PiggyBank } from 'lucide-react';
import { useGoals } from '../hooks/useGoals';
import Card from '../components/ui/Card';
import AddGoalModal from '../components/AddGoalModal';
import AddFundModal from '../components/AddFundModal';
import EditGoalModal from '../components/EditGoalModal';
import { useTranslation } from 'react-i18next';

const Goals = () => {
  const { goals, loading, fetchGoals, updateGoal, deleteGoal } = useGoals();
  const { t } = useTranslation();

  const [isAddModalOpen, setIsAddModalOpen]   = useState(false);
  const [isFundModalOpen, setIsFundModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal]       = useState(null);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

  const handleFundClick = (goal) => { setSelectedGoal(goal); setIsFundModalOpen(true); };
  const handleEditClick = (goal) => { setSelectedGoal(goal); setIsEditModalOpen(true); };

  // Stats
  const totalGoals     = goals.length;
  const completedGoals = goals.filter(g => g.status === 'completed').length;
  const totalSaved     = goals.reduce((sum, g) => sum + (g.current_amount || 0), 0);

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-white/10 border-t-accent-blue rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-gray-500">{t('loadingGoals')}</p>
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 pb-safe animate-fade-in">

      {/* Header */}
      <header className="page-header relative overflow-hidden p-6 rounded-3xl bg-gradient-to-r from-accent-blue/10 via-accent-violet/5 to-transparent border border-white/5 backdrop-blur-xl">
        <div className="absolute -right-16 -top-16 w-48 h-48 bg-accent-blue/10 rounded-full blur-3xl pointer-events-none" />
        <div>
          <h1 className="page-title flex items-center gap-2.5">
            <Target size={24} className="text-accent-blue animate-pulse" />
            {t('financialGoals')}
          </h1>
          <p className="page-subtitle">{t('trackAndAchieve')}</p>
        </div>
        <button 
          className="btn btn-primary flex-shrink-0 mt-3 sm:mt-0 shadow-lg active:scale-95 transition-all" 
          onClick={() => setIsAddModalOpen(true)}
        >
          <Plus size={18} />
          <span>{t('newGoal')}</span>
        </button>
      </header>

      {/* Summary stats */}
      {goals.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="card p-5 text-center bg-gradient-to-br from-[#121c37]/60 to-transparent border-white/5">
            <p className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">{totalGoals}</p>
            <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest font-extrabold">Total Target</p>
          </div>
          <div className="card p-5 text-center bg-gradient-to-br from-[#0c2f21]/60 to-transparent border-white/5">
            <p className="text-2xl md:text-3xl font-extrabold text-accent-greenLt tracking-tight">{completedGoals}</p>
            <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest font-extrabold">Tercapai</p>
          </div>
          <div className="card p-5 text-center bg-gradient-to-br from-[#241738]/60 to-transparent border-white/5">
            <p className="text-xl md:text-3xl font-extrabold text-accent-blue truncate tracking-tight">{formatCurrency(totalSaved)}</p>
            <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest font-extrabold">Total Ditabung</p>
          </div>
        </div>
      )}

      {/* Goal Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {goals.length === 0 ? (
          <Card className="col-span-full text-center py-20 bg-[#0c0e1b]/50 border-white/5 shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-accent-blue/10 flex items-center justify-center mx-auto mb-5 border border-accent-blue/20">
              <Target size={32} className="text-accent-blue animate-float" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{t('noGoalsSetYet')}</h3>
            <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto leading-relaxed">{t('startPlanningFuture')}</p>
            <button className="btn btn-primary mx-auto" onClick={() => setIsAddModalOpen(true)}>
              <Plus size={18} /> {t('createYourFirstGoal')}
            </button>
          </Card>
        ) : (
          goals.map((goal) => {
            const isCompleted = goal.status === 'completed';
            const progress    = Math.min((goal.current_amount / goal.target_amount) * 100, 100) || 0;

            return (
              <div
                key={goal.id}
                className={`card flex flex-col relative overflow-hidden transition-all duration-300
                            hover:-translate-y-1 hover:shadow-card-hover group/card bg-[#0c0e1b]/55
                            ${isCompleted ? 'border-accent-green/25' : 'hover:border-accent-blue/20'}`}
              >
                {/* Completed badge */}
                {isCompleted && (
                  <div className="absolute top-4 right-4 z-10">
                    <span className="badge badge-green shadow-[0_0_8px_rgba(16,185,129,0.2)]">
                      <CheckCircle size={12} />
                      {t('achieved')}
                    </span>
                  </div>
                )}

                {/* Glow blob */}
                <div className={`absolute -top-12 -right-12 w-28 h-28 rounded-full blur-2xl pointer-events-none opacity-20 transition-all duration-300 group-hover/card:scale-110
                                 ${isCompleted ? 'bg-accent-green' : 'bg-accent-blue'}`} />

                <div className="p-5 md:p-6 flex flex-col gap-5 flex-1 relative">
                  {/* Icon + title */}
                  <div className="flex items-start gap-4.5">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 border ${
                      isCompleted ? 'bg-accent-green/12 text-accent-green border-accent-green/20' : 'bg-accent-blue/12 text-accent-blue border-accent-blue/20'
                    }`}>
                      {isCompleted ? <CheckCircle size={22} /> : <Flag size={22} />}
                    </div>
                    <div className="flex-1 min-w-0 pr-6">
                      <h3 className="font-bold text-white text-base truncate flex items-center gap-2 group/title">
                        <span className="truncate">{goal.name}</span>
                        <button 
                          onClick={() => handleEditClick(goal)} 
                          className="flex-shrink-0 text-gray-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100 group-hover/title:opacity-100 p-1 rounded-md hover:bg-white/10 cursor-pointer"
                        >
                          <Edit2 size={12} />
                        </button>
                      </h3>
                      {goal.target_date && (
                        <p className="text-[10px] font-bold text-gray-500 mt-1 flex items-center gap-1.5 uppercase tracking-wider">
                          <Calendar size={12} />
                          {new Date(goal.target_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-2">
                      <span className="text-gray-500 font-bold uppercase tracking-wider text-[10px]">{t('progress')}</span>
                      <span className={`font-extrabold ${progress >= 100 ? 'text-accent-green' : progress >= 75 ? 'text-accent-amber' : 'text-accent-blue'}`}>
                        {progress.toFixed(1)}%
                      </span>
                    </div>
                    <div className="progress-track h-2">
                      <div
                        className={`progress-fill ${isCompleted ? 'bg-gradient-to-r from-accent-green to-accent-greenLt shadow-[0_0_8px_rgba(16,185,129,0.3)]' : 'bg-gradient-to-r from-accent-blue to-accent-violet shadow-[0_0_8px_rgba(59,130,246,0.3)]'}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Amounts */}
                  <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-black/35 border border-white/5">
                    <div className="border-r border-white/5 pr-1">
                      <p className="text-[10px] text-gray-500 mb-1 flex items-center gap-1 font-bold uppercase tracking-wider">
                        <PiggyBank size={11} className="text-accent-blue" /> Ditabung
                      </p>
                      <p className={`font-extrabold text-sm ${isCompleted ? 'text-accent-green' : 'text-white'}`}>
                        {formatCurrency(goal.current_amount)}
                      </p>
                    </div>
                    <div className="text-right pl-1">
                      <p className="text-[10px] text-gray-500 mb-1 font-bold uppercase tracking-wider">Target</p>
                      <p className="font-extrabold text-sm text-gray-300">{formatCurrency(goal.target_amount)}</p>
                    </div>
                  </div>

                  {/* Add funds button */}
                  {!isCompleted && (
                    <button
                      className="btn btn-secondary w-full text-xs font-bold uppercase tracking-wider py-2.5 rounded-xl flex items-center justify-center gap-1.5 hover:bg-accent-blue/10 hover:text-accent-blueLt hover:border-accent-blue/20 transition-all cursor-pointer shadow-md"
                      onClick={() => handleFundClick(goal)}
                    >
                      <TrendingUp size={14} /> {t('addFunds')}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <AddGoalModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSuccess={fetchGoals} />
      <AddFundModal isOpen={isFundModalOpen} onClose={() => setIsFundModalOpen(false)} onSuccess={fetchGoals} goal={selectedGoal} />
      <EditGoalModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} goal={selectedGoal} updateGoal={updateGoal} deleteGoal={deleteGoal} />
    </div>
  );
};

export default Goals;
