import { useState } from 'react';
import { Plus, WalletCards, ArrowUpRight, ArrowDownRight, CheckCircle, Edit2, Scale } from 'lucide-react';
import { useDebts } from '../hooks/useDebts';
import Card from '../components/ui/Card';
import AddDebtModal from '../components/AddDebtModal';
import PayDebtModal from '../components/PayDebtModal';
import EditDebtModal from '../components/EditDebtModal';
import { useTranslation } from 'react-i18next';

const Debts = () => {
  const { debts, loading, fetchDebts, totalPayable, totalReceivable, updateDebt, deleteDebt } = useDebts();
  const { t } = useTranslation();

  const [isAddModalOpen, setIsAddModalOpen]   = useState(false);
  const [isPayModalOpen, setIsPayModalOpen]   = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedDebt, setSelectedDebt]       = useState(null);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

  const handlePayClick  = (debt) => { setSelectedDebt(debt); setIsPayModalOpen(true); };
  const handleEditClick = (debt) => { setSelectedDebt(debt); setIsEditModalOpen(true); };

  const netBalance = totalReceivable - totalPayable;

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-white/10 border-t-accent-blue rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-gray-500">{t('loadingDebts')}</p>
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 pb-safe animate-fade-in">

      {/* Header */}
      <header className="page-header relative overflow-hidden p-6 rounded-3xl bg-gradient-to-r from-accent-blue/10 via-accent-violet/5 to-transparent border border-white/5 backdrop-blur-xl">
        <div className="absolute -right-16 -top-16 w-48 h-48 bg-accent-blue/10 rounded-full blur-3xl pointer-events-none" />
        <div>
          <h1 className="page-title flex items-center gap-2.5">
            <WalletCards size={24} className="text-accent-blue animate-pulse" />
            {t('debtsAndLoans')}
          </h1>
          <p className="page-subtitle">{t('manageDebts')}</p>
        </div>
        <button 
          className="btn btn-primary flex-shrink-0 mt-3 sm:mt-0 shadow-lg active:scale-95 transition-all" 
          onClick={() => setIsAddModalOpen(true)}
        >
          <Plus size={18} />
          <span>{t('recordDebt')}</span>
        </button>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-5 bg-gradient-to-br from-[#301614]/60 to-transparent border-red-500/10 hover:border-red-500/20">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-400 mb-2.5 uppercase tracking-wider">
            <ArrowDownRight size={15} className="text-accent-red" />
            {t('iOwePayables')}
          </div>
          <p className="text-2xl md:text-3xl font-extrabold text-accent-redLt tracking-tight">{formatCurrency(totalPayable)}</p>
        </div>

        <div className="card p-5 bg-gradient-to-br from-[#0c2f21]/60 to-transparent border-emerald-500/10 hover:border-accent-green/20">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-400 mb-2.5 uppercase tracking-wider">
            <ArrowUpRight size={15} className="text-accent-green" />
            {t('owedToMeReceivables')}
          </div>
          <p className="text-2xl md:text-3xl font-extrabold text-accent-greenLt tracking-tight">{formatCurrency(totalReceivable)}</p>
        </div>

        <div className={`card p-5 border hover:border-white/10 ${netBalance >= 0 ? 'bg-gradient-to-br from-[#121c37]/60 to-transparent border-blue-500/10' : 'bg-gradient-to-br from-[#301614]/40 to-transparent border-red-500/5'}`}>
          <div className="flex items-center gap-2 text-xs font-bold text-gray-400 mb-2.5 uppercase tracking-wider">
            <Scale size={15} className="text-gray-400" />
            Net Saldo
          </div>
          <p className={`text-2xl md:text-3xl font-extrabold tracking-tight ${netBalance >= 0 ? 'text-accent-blueLt' : 'text-accent-redLt'}`}>
            {netBalance >= 0 ? '+' : ''}{formatCurrency(netBalance)}
          </p>
        </div>
      </div>

      {/* Debt List */}
      <Card className="p-0 overflow-hidden bg-[#0c0e1b]/55 border-white/5 shadow-2xl">
        {debts.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-5">
              <WalletCards size={30} className="text-gray-500 animate-float" />
            </div>
            <p className="text-gray-400 font-bold text-base">{t('noDebtRecordsFound')}</p>
            <p className="text-xs text-gray-500 mt-1.5">Klik tombol "+ Catat Utang" untuk menambahkan catatan baru</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {debts.map((debt) => {
              const isPayable = debt.type === 'payable';
              const isPaid    = debt.status === 'paid';
              const remaining = debt.remaining_amount || 0;
              const progress  = ((debt.amount - remaining) / debt.amount) * 100 || 0;

              return (
                <div key={debt.id} className={`p-4 md:p-5 hover:bg-white/[0.02] transition-all duration-200 ${isPaid ? 'opacity-50' : ''}`}>
                  <div className="flex justify-between items-start gap-4 mb-4">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center border ${
                        isPaid ? 'bg-white/5 text-gray-500 border-white/10' :
                        isPayable ? 'bg-accent-red/10 text-accent-redLt border-accent-red/15 shadow-[0_0_8px_rgba(239,68,68,0.1)]' : 'bg-accent-green/10 text-accent-greenLt border-accent-green/15 shadow-[0_0_8px_rgba(16,185,129,0.1)]'
                      }`}>
                        <WalletCards size={20} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-white flex items-center gap-2 group/title">
                          <span className="truncate">{debt.name}</span>
                          {isPaid && <span className="badge badge-blue text-[9px] uppercase tracking-wider">{t('paid')}</span>}
                          <button
                            onClick={() => handleEditClick(debt)}
                            className="flex-shrink-0 text-gray-500 hover:text-white opacity-0 group-hover/title:opacity-100 transition-colors p-1 rounded hover:bg-white/10 cursor-pointer"
                          >
                            <Edit2 size={11} />
                          </button>
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                          {isPayable ? t('youOweThem') : t('theyOweYou')}
                          {debt.due_date && ` · Jatuh tempo ${new Date(debt.due_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                        </p>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <p className="font-extrabold text-sm text-white">{formatCurrency(debt.amount)}</p>
                      <p className="text-[10px] text-gray-400 mt-1 font-bold">
                        Sisa: <span className={isPaid ? 'text-gray-500 font-bold' : 'text-white font-extrabold'}>{formatCurrency(remaining)}</span>
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="progress-track h-2 mb-4">
                    <div
                      className={`progress-fill ${isPayable ? 'bg-gradient-to-r from-accent-red to-accent-redLt shadow-[0_0_6px_rgba(239,68,68,0.35)]' : 'bg-gradient-to-r from-accent-green to-accent-greenLt shadow-[0_0_6px_rgba(16,185,129,0.35)]'}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  {/* Action Button */}
                  {!isPaid && (
                    <div className="flex justify-end">
                      <button
                        className="btn btn-secondary btn-sm font-bold uppercase tracking-wider flex items-center gap-1 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
                        onClick={() => handlePayClick(debt)}
                      >
                        <CheckCircle size={13} /> {t('recordPayment')}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <AddDebtModal  isOpen={isAddModalOpen}  onClose={() => setIsAddModalOpen(false)}  onSuccess={fetchDebts} />
      <PayDebtModal  isOpen={isPayModalOpen}   onClose={() => setIsPayModalOpen(false)}  onSuccess={fetchDebts} debt={selectedDebt} />
      <EditDebtModal isOpen={isEditModalOpen}  onClose={() => setIsEditModalOpen(false)} debt={selectedDebt} updateDebt={updateDebt} deleteDebt={deleteDebt} />
    </div>
  );
};

export default Debts;
