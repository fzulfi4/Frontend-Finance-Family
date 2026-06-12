import { useState } from 'react';
import { Plus, WalletCards, ArrowUpRight, ArrowDownRight, CheckCircle } from 'lucide-react';
import { useDebts } from '../hooks/useDebts';
import Card from '../components/ui/Card';
import AddDebtModal from '../components/AddDebtModal';
import PayDebtModal from '../components/PayDebtModal';
import EditDebtModal from '../components/EditDebtModal';
import { Edit2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Debts = () => {
  const { debts, loading, fetchDebts, totalPayable, totalReceivable, updateDebt, deleteDebt } = useDebts();
  const { t } = useTranslation();
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState(null);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  const handlePayClick = (debt) => {
    setSelectedDebt(debt);
    setIsPayModalOpen(true);
  };

  const handleEditClick = (debt) => {
    setSelectedDebt(debt);
    setIsEditModalOpen(true);
  };

  if (loading) return <div className="p-8 text-gray-400">{t('loadingDebts')}</div>;

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-5">
      <header className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl md:text-3xl font-bold mb-0.5 truncate">{t('debtsAndLoans')}</h1>
          <p className="text-gray-400 text-sm">{t('manageDebts')}</p>
        </div>
        <button className="btn btn-primary flex-shrink-0" onClick={() => setIsAddModalOpen(true)}>
          <Plus size={18} />
          <span className="hidden sm:inline">{t('recordDebt')}</span>
        </button>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="border-l-4 border-l-accent-red p-4">
          <div className="flex items-center gap-1.5 text-gray-400 mb-2 text-xs">
            <ArrowDownRight size={14} /> {t('iOwePayables')}
          </div>
          <h2 className="text-xl md:text-3xl font-bold text-accent-red truncate">{formatCurrency(totalPayable)}</h2>
        </Card>
        
        <Card className="border-l-4 border-l-accent-green p-4">
          <div className="flex items-center gap-1.5 text-gray-400 mb-2 text-xs">
            <ArrowUpRight size={14} /> {t('owedToMeReceivables')}
          </div>
          <h2 className="text-xl md:text-3xl font-bold text-accent-green truncate">{formatCurrency(totalReceivable)}</h2>
        </Card>
      </div>

      {/* Debt List */}
      <Card className="p-0 overflow-hidden">
        {debts.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <WalletCards size={48} className="mx-auto mb-4 opacity-50" />
            <p>{t('noDebtRecordsFound')}</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {debts.map((debt) => {
              const isPayable = debt.type === 'payable';
              const isPaid = debt.status === 'paid';
              const remaining = debt.remaining_amount || 0;
              const progress = ((debt.amount - remaining) / debt.amount) * 100;

              return (
                <div key={debt.id} className={`p-4 md:p-6 ${isPaid ? 'opacity-60' : ''}`}>
                  <div className="flex justify-between items-start gap-3 mb-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`flex-shrink-0 p-2.5 rounded-xl ${isPaid ? 'bg-white/5 text-gray-500' : (isPayable ? 'bg-red-500/10 text-accent-red' : 'bg-green-500/10 text-accent-green')}`}>
                        <WalletCards size={22} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-base font-semibold flex items-center gap-1.5 group/title">
                          <span className="truncate">{debt.name}</span>
                          {isPaid && <span className="text-[0.6rem] font-bold px-1.5 py-0.5 bg-white/10 rounded-full tracking-wider flex-shrink-0">{t('paid')}</span>}
                          <button 
                            onClick={() => handleEditClick(debt)}
                            className="flex-shrink-0 text-gray-500 hover:text-white transition-colors opacity-0 group-hover/title:opacity-100 p-0.5"
                            title={t('edit')}
                          >
                            <Edit2 size={14} />
                          </button>
                        </h3>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {isPayable ? t('youOweThem') : t('theyOweYou')} 
                          {debt.due_date && ` • ${new Date(debt.due_date).toLocaleDateString()}`}
                        </p>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-base">{formatCurrency(debt.amount)}</p>
                      <p className="text-xs text-gray-400">
                        {t('remaining')}: <span className={isPaid ? '' : 'text-white font-medium'}>{formatCurrency(remaining)}</span>
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2 bg-[#1a1c23] rounded-full overflow-hidden mb-4 border border-white/5">
                    <div 
                      className={`h-full transition-all duration-500 ${isPayable ? 'bg-accent-red' : 'bg-accent-green'}`}
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>

                  {/* Action Button */}
                  {!isPaid && (
                    <div className="flex justify-end">
                      <button 
                        className="btn btn-secondary text-sm py-1.5 px-4"
                        onClick={() => handlePayClick(debt)}
                      >
                        <CheckCircle size={16} /> {t('recordPayment')}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <AddDebtModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSuccess={fetchDebts} 
      />

      <PayDebtModal
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        onSuccess={fetchDebts}
        debt={selectedDebt}
      />

      <EditDebtModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        debt={selectedDebt}
        updateDebt={updateDebt}
        deleteDebt={deleteDebt}
      />
    </div>
  );
};

export default Debts;
