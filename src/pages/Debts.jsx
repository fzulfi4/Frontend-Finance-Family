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
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      <header className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-1">{t('debtsAndLoans')}</h1>
          <p className="text-gray-400">{t('manageDebts')}</p>
        </div>
        <button className="btn btn-primary w-full md:w-auto" onClick={() => setIsAddModalOpen(true)}>
          <Plus size={18} /> {t('recordDebt')}
        </button>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="border-l-4 border-l-accent-red">
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <ArrowDownRight size={18} /> {t('iOwePayables')}
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-accent-red">{formatCurrency(totalPayable)}</h2>
        </Card>
        
        <Card className="border-l-4 border-l-accent-green">
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <ArrowUpRight size={18} /> {t('owedToMeReceivables')}
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-accent-green">{formatCurrency(totalReceivable)}</h2>
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
                <div key={debt.id} className={`p-6 ${isPaid ? 'opacity-60' : ''}`}>
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${isPaid ? 'bg-white/5 text-gray-500' : (isPayable ? 'bg-red-500/10 text-accent-red' : 'bg-green-500/10 text-accent-green')}`}>
                        <WalletCards size={28} />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold flex items-center gap-2 group/title">
                          {debt.name}
                          {isPaid && <span className="text-[0.65rem] font-bold px-2 py-0.5 bg-white/10 rounded-full tracking-wider">{t('paid')}</span>}
                          <button 
                            onClick={() => handleEditClick(debt)}
                            className="text-gray-500 hover:text-white transition-colors opacity-0 group-hover/title:opacity-100 p-1"
                            title={t('edit')}
                          >
                            <Edit2 size={16} />
                          </button>
                        </h3>
                        <p className="text-sm text-gray-400 mt-1">
                          {isPayable ? t('youOweThem') : t('theyOweYou')} 
                          {debt.due_date && ` • ${t('due')}: ${new Date(debt.due_date).toLocaleDateString()}`}
                        </p>
                      </div>
                    </div>

                    <div className="text-left md:text-right bg-white/5 md:bg-transparent p-3 md:p-0 rounded-lg">
                      <p className="font-bold text-xl">{formatCurrency(debt.amount)}</p>
                      <p className="text-sm text-gray-400">
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
