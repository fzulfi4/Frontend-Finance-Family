import { useState, useContext, useMemo, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { useWallets } from '../hooks/useWallets';
import { useTransactions } from '../hooks/useTransactions';
import { Wallet, ArrowUpRight, ArrowDownRight, Activity, Plus, ReceiptText, Edit2, ArrowRightLeft, CreditCard, ChevronLeft, ChevronRight } from 'lucide-react';
import Card from '../components/ui/Card';
import AddWalletModal from '../components/AddWalletModal';
import EditWalletModal from '../components/EditWalletModal';
import AddTransactionModal from '../components/AddTransactionModal';
import EditTransactionModal from '../components/EditTransactionModal';
import TransferModal from '../components/TransferModal';

// ─── Gradient presets for virtual cards ─────────────────────────────────────
const CARD_THEMES = [
  {
    gradient: 'from-[#1e3a5f] via-[#1a2d4a] to-[#0f1b2d]',
    accent: 'rgba(59,130,246,0.15)',
    dotColor: 'bg-blue-500',
  },
  {
    gradient: 'from-[#2d1b69] via-[#1e1245] to-[#130d2e]',
    accent: 'rgba(139,92,246,0.15)',
    dotColor: 'bg-purple-500',
  },
  {
    gradient: 'from-[#1a4a3a] via-[#0f3028] to-[#091e1a]',
    accent: 'rgba(16,185,129,0.15)',
    dotColor: 'bg-emerald-500',
  },
  {
    gradient: 'from-[#4a1942] via-[#2e1030] to-[#1a0a1e]',
    accent: 'rgba(236,72,153,0.15)',
    dotColor: 'bg-pink-500',
  },
  {
    gradient: 'from-[#3d2c1a] via-[#2a1e12] to-[#1a130c]',
    accent: 'rgba(245,158,11,0.15)',
    dotColor: 'bg-amber-500',
  },
  {
    gradient: 'from-[#1a3a4a] via-[#102830] to-[#0a1a20]',
    accent: 'rgba(6,182,212,0.15)',
    dotColor: 'bg-cyan-500',
  },
];

// ─── Main Dashboard Component ───────────────────────────────────────────────
const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const { t } = useTranslation();

  const { wallets, loading: walletsLoading, fetchWallets, totalBalance, updateWallet, deleteWallet } = useWallets(!!user?.family_id);
  const { transactions, loading: txLoading, fetchTransactions, updateTransaction, deleteTransaction } = useTransactions(!!user?.family_id);

  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isEditWalletModalOpen, setIsEditWalletModalOpen] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState(null);

  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isEditTxModalOpen, setIsEditTxModalOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState(null);
  const [txType, setTxType] = useState('expense');

  // Carousel state
  const [activeCardIndex, setActiveCardIndex] = useState(0);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  const handleTxSuccess = () => {
    fetchWallets();
    fetchTransactions();
  };

  // Carousel navigation
  const goToPrev = useCallback(() => {
    setActiveCardIndex(prev => (prev <= 0 ? wallets.length - 1 : prev - 1));
  }, [wallets.length]);

  const goToNext = useCallback(() => {
    setActiveCardIndex(prev => (prev >= wallets.length - 1 ? 0 : prev + 1));
  }, [wallets.length]);

  // Currently active wallet from carousel
  const activeWallet = wallets[activeCardIndex] || null;

  // Filter transactions by the active carousel card
  const filteredTransactions = useMemo(() => {
    if (!activeWallet) return transactions;
    return transactions.filter(tx =>
      tx.account_id === activeWallet.id || tx.to_account_id === activeWallet.id
    );
  }, [transactions, activeWallet]);

  if (!user?.family_id) {
    return <Navigate to="/onboarding" replace />;
  }


  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      <header className="flex justify-between items-center mb-2">
        <div>
          <h1 className="text-xl md:text-3xl font-bold mb-1">{t('welcomeBack')}, {user?.full_name?.split(' ')[0] || 'User'}!</h1>
          <p className="text-gray-400 text-sm">{t('financialOverview')}</p>
        </div>
      </header>

      {/* ── Main Balance Card ── */}
      <Card className="bg-gradient-to-br from-[#1a1c23] to-[#0a0a0c] border-white/5 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-accent-blue/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col h-full justify-between relative z-10">
          <div>
            <div className="flex items-center gap-2 text-gray-400 mb-2">
              <Wallet size={18} /> {t('totalBalance')}
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-5 break-all">
              {walletsLoading ? '...' : formatCurrency(totalBalance)}
            </h2>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => { setTxType('income'); setIsTxModalOpen(true); }}
              className="btn btn-primary px-2 md:px-5 text-sm"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">{t('income')}</span>
              <span className="sm:hidden">{t('income')}</span>
            </button>
            <button
              onClick={() => { setTxType('expense'); setIsTxModalOpen(true); }}
              className="btn border border-red-500/30 text-accent-red hover:bg-red-500/10 px-2 md:px-5 text-sm"
            >
              <ArrowDownRight size={16} />
              <span>{t('expense')}</span>
            </button>
            <button
              onClick={() => setIsTransferModalOpen(true)}
              className="btn border border-blue-500/30 text-accent-blue hover:bg-blue-500/10 px-2 md:px-5 text-sm"
            >
              <ArrowRightLeft size={16} />
              <span>{t('transfer')}</span>
            </button>
          </div>
        </div>
      </Card>

      {/* ── Virtual Card Carousel Section ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <CreditCard size={20} className="text-accent-blue" /> {t('wallets')}
          </h3>
          <button
            onClick={() => setIsWalletModalOpen(true)}
            className="text-xs text-accent-blue hover:text-blue-400 font-medium px-3 py-1.5 rounded-lg bg-accent-blue/10 hover:bg-accent-blue/20 transition-colors flex items-center gap-1"
          >
            <Plus size={14} /> {t('new')}
          </button>
        </div>

        {walletsLoading ? (
          <p className="text-sm text-gray-500 text-center py-8">{t('loading')}</p>
        ) : wallets.length === 0 ? (
          /* Empty state */
          <div className="flex justify-center">
            <button
              onClick={() => setIsWalletModalOpen(true)}
              className="w-full max-w-sm h-[180px] rounded-2xl border-2 border-dashed border-white/10 hover:border-white/25 flex flex-col items-center justify-center gap-3 text-gray-500 hover:text-gray-300 transition-all duration-300 hover:bg-white/[0.02] cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                <Plus size={24} />
              </div>
              <span className="text-sm font-medium">{t('addNewWallet')}</span>
            </button>
          </div>
        ) : (
          /* Carousel */
          <div className="flex flex-col items-center">
            {/* Carousel container — full width on mobile, capped on desktop */}
            <div className="relative w-full max-w-sm md:max-w-[460px]">
              {/* Previous button */}
              {wallets.length > 1 && (
                <button
                  onClick={goToPrev}
                  className="absolute -left-4 md:-left-14 top-1/2 -translate-y-1/2 z-20 w-9 h-9 md:w-10 md:h-10 rounded-full bg-black/60 md:bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all backdrop-blur-sm"
                >
                  <ChevronLeft size={18} />
                </button>
              )}

              {/* Cards stack */}
              <div className="relative h-[190px] md:h-[210px] flex items-center justify-center overflow-hidden">
                {wallets.map((wallet, idx) => {
                  const theme = CARD_THEMES[idx % CARD_THEMES.length];
                  const offset = idx - activeCardIndex;

                  let adjustedOffset = offset;
                  if (wallets.length > 2) {
                    if (offset > wallets.length / 2) adjustedOffset = offset - wallets.length;
                    if (offset < -wallets.length / 2) adjustedOffset = offset + wallets.length;
                  }

                  const isActive = idx === activeCardIndex;
                  const absOffset = Math.abs(adjustedOffset);

                  if (absOffset > 2) return null;

                  const scale = isActive ? 1 : Math.max(0.78, 1 - absOffset * 0.12);
                  // Tighter translateX on mobile so side cards stay visible
                  const translateX = adjustedOffset * 90;
                  const zIndex = 10 - absOffset;
                  const opacity = isActive ? 1 : Math.max(0.3, 1 - absOffset * 0.4);

                  return (
                    <div
                      key={wallet.id}
                      onClick={() => setActiveCardIndex(idx)}
                      className="absolute cursor-pointer transition-all duration-500 ease-out"
                      style={{
                        transform: `translateX(${translateX}px) scale(${scale})`,
                        zIndex,
                        opacity,
                        filter: isActive ? 'none' : `blur(${absOffset * 1}px)`,
                        width: '100%',
                        maxWidth: '320px',
                      }}
                    >
                      <div
                        className={`
                          relative w-full h-[180px] md:h-[190px] rounded-2xl p-5 md:p-6
                          bg-gradient-to-br ${theme.gradient}
                          border transition-all duration-500
                          ${isActive
                            ? 'border-white/20 shadow-2xl shadow-black/50'
                            : 'border-white/[0.06]'
                          }
                        `}
                      >
                        {/* Decorative circles */}
                        <div
                          className="absolute -top-10 -right-10 w-36 h-36 rounded-full blur-2xl pointer-events-none"
                          style={{ background: theme.accent }}
                        />
                        <div
                          className="absolute -bottom-8 -left-8 w-28 h-28 rounded-full blur-2xl pointer-events-none opacity-50"
                          style={{ background: theme.accent }}
                        />

                        {/* Card chip */}
                        <div className="absolute top-5 right-5 flex gap-1 opacity-20">
                          <div className="w-8 h-6 rounded border border-white/30"></div>
                        </div>

                        {/* Card content */}
                        <div className="relative z-10 flex flex-col justify-between h-full">
                          <div className="flex justify-between items-start">
                            <CreditCard size={26} className="text-white/25" />
                            {isActive && (
                              <button
                                onClick={(e) => { e.stopPropagation(); setSelectedWallet(wallet); setIsEditWalletModalOpen(true); }}
                                className="p-2 rounded-lg bg-white/5 hover:bg-white/15 text-white/40 hover:text-white transition-all"
                                title={t('edit')}
                              >
                                <Edit2 size={14} />
                              </button>
                            )}
                          </div>

                          <div>
                            <p className="text-xl md:text-3xl font-bold text-white mb-1.5 tracking-tight break-all">
                              {formatCurrency(wallet.balance)}
                            </p>
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-sm text-white/70 font-medium truncate">{wallet.name}</p>
                              <span className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-medium shrink-0">{wallet.type}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Next button */}
              {wallets.length > 1 && (
                <button
                  onClick={goToNext}
                  className="absolute -right-4 md:-right-14 top-1/2 -translate-y-1/2 z-20 w-9 h-9 md:w-10 md:h-10 rounded-full bg-black/60 md:bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all backdrop-blur-sm"
                >
                  <ChevronRight size={18} />
                </button>
              )}
            </div>

            {/* Dots indicator */}
            {wallets.length > 1 && (
              <div className="flex items-center gap-2 mt-4">
                {wallets.map((_, idx) => {
                  const theme = CARD_THEMES[idx % CARD_THEMES.length];
                  return (
                    <button
                      key={idx}
                      onClick={() => setActiveCardIndex(idx)}
                      className={`rounded-full transition-all duration-300 ${
                        idx === activeCardIndex
                          ? `w-6 h-2 ${theme.dotColor}`
                          : 'w-2 h-2 bg-white/15 hover:bg-white/30'
                      }`}
                    />
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Recent Transactions (filtered by active card) ── */}
      <Card>
        <div className="flex justify-between items-center mb-5">
          <h3 className="font-semibold text-base md:text-lg flex items-center gap-2 flex-wrap">
            <ReceiptText size={20} className="text-gray-400" />
            {t('recentTransactions')}
            {activeWallet && (
              <span className="text-sm font-normal text-accent-blue bg-accent-blue/10 px-2.5 py-0.5 rounded-full">
                {activeWallet.name}
              </span>
            )}
          </h3>
        </div>

        {txLoading ? (
          <p className="text-gray-500 text-center py-8">{t('loading')}</p>
        ) : filteredTransactions.length === 0 ? (
          <div className="text-center py-10">
            <ReceiptText size={36} className="mx-auto text-gray-600 mb-3" />
            <p className="text-gray-400 text-sm">{t('noTransactionsYet')}</p>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredTransactions.slice(0, 8).map(tx => {
              const isIncome = tx.type === 'income';
              const isTransfer = tx.type === 'transfer';
              return (
                <div key={tx.id} className="flex justify-between items-center p-3 md:p-4 rounded-xl hover:bg-white/5 transition-colors group">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className={`flex-shrink-0 p-2.5 rounded-full ${isTransfer ? 'bg-blue-500/10 text-accent-blue' : isIncome ? 'bg-green-500/10 text-accent-green' : 'bg-red-500/10 text-accent-red'}`}>
                      {isTransfer ? <ArrowRightLeft size={18} /> : isIncome ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate flex items-center gap-1.5 group/title">
                        {tx.notes || (isTransfer ? t('transfer') : isIncome ? t('income') : t('expense'))}
                        <button
                          onClick={() => { setSelectedTx(tx); setIsEditTxModalOpen(true); }}
                          className="text-gray-500 hover:text-white transition-colors opacity-0 group-hover/title:opacity-100 p-1 flex-shrink-0"
                          title={t('edit')}
                        >
                          <Edit2 size={13} />
                        </button>
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {tx.transaction_date ? new Date(tx.transaction_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : t('unknownDate')}
                        {' • '}
                        {isTransfer
                          ? `${tx.account?.name || t('wallet')} → ${tx.to_account?.name || t('wallet')}`
                          : tx.account?.name || t('wallet')
                        }
                      </p>
                    </div>
                  </div>
                  <div className={`flex-shrink-0 font-bold text-sm ml-2 ${isTransfer ? 'text-accent-blue' : isIncome ? 'text-accent-green' : 'text-gray-100'}`}>
                    {isTransfer ? '' : isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <AddWalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        onSuccess={fetchWallets}
      />

      <EditWalletModal
        isOpen={isEditWalletModalOpen}
        onClose={() => { setIsEditWalletModalOpen(false); setSelectedWallet(null); }}
        wallet={selectedWallet}
        updateWallet={updateWallet}
        deleteWallet={deleteWallet}
      />

      <AddTransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        onSuccess={handleTxSuccess}
        accounts={wallets}
        type={txType}
      />

      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        onSuccess={handleTxSuccess}
        accounts={wallets}
      />

      <EditTransactionModal
        isOpen={isEditTxModalOpen}
        onClose={() => { setIsEditTxModalOpen(false); setSelectedTx(null); }}
        transaction={selectedTx}
        updateTransaction={updateTransaction}
        deleteTransaction={deleteTransaction}
      />
    </div>
  );
};

export default Dashboard;
