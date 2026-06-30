import { useState, useEffect, useCallback, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { X, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const TourOverlay = ({ forceOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(AuthContext);

  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [targetRect, setTargetRect] = useState(null);
  const [lastHighlightedEl, setLastHighlightedEl] = useState(null);

  const STEPS = [
    {
      title: "Selamat Datang di FamFinance! 👪",
      emoji: "🌟",
      desc: "Aplikasi pencatatan dan kontrol keuangan keluarga. Mari pelajari alur penggunaan aplikasi dalam beberapa langkah singkat agar Anda dapat melacak dan mengendalikan keuangan bersama keluarga dengan maksimal!",
      path: "/dashboard",
      selector: null,
      placement: "center"
    },
    {
      title: "1. Daftarkan Akun / Dompet 💳",
      emoji: "👛",
      desc: "Langkah awal adalah mendaftarkan dompet fisik atau akun bank Anda di Dashboard (misal: Dompet Tunai, Tabungan BCA, Kantong GoPay). Saldo awal yang Anda isi di sini akan menjadi fondasi pencatatan uang riil Anda.",
      path: "/dashboard",
      selector: "#tour-dashboard-wallets",
      placement: "top"
    },
    {
      title: "2. Buat Kategori Transaksi 🏷️",
      emoji: "🏷️",
      desc: "Kunjungi halaman 'Kategori' di sidebar untuk menentukan kategori transaksi Anda. Bedakan kategori pengeluaran (misal: Makanan, Listrik) dan kategori pemasukan (misal: Gaji Bulanan, Cashback) untuk pengelompokan yang rapi.",
      path: "/categories",
      selector: "#tour-sidebar-categories",
      placement: "right"
    },
    {
      title: "3. Tentukan Batas Anggaran Bulanan 📋",
      emoji: "📉",
      desc: "Di menu 'Pengeluaran Bulanan', buat batas anggaran (limit) bulanan untuk pos pengeluaran Anda. Ini membantu sistem memonitor dan memperingatkan Anda saat belanja bulanan mendekati limit.",
      path: "/monthly-expenses",
      selector: "#tour-sidebar-expenses",
      placement: "right"
    },
    {
      title: "4. Tentukan Target Pemasukan Bulanan 📈",
      emoji: "🎯",
      desc: "Di menu 'Pemasukan Bulanan', atur target pendapatan rutin bulanan Anda (misal: Gaji Suami, Gaji Istri, Hasil Jualan). Ini berfungsi melacak apakah pendapatan nyata sudah memenuhi target bulanan atau belum.",
      path: "/monthly-incomes",
      selector: "#tour-sidebar-incomes",
      placement: "right"
    },
    {
      title: "5. Catat Transaksi Harian 💸",
      emoji: "🚀",
      desc: "Gunakan tombol aksi cepat 'Pemasukan', 'Pengeluaran', atau 'Transfer' di Dashboard untuk mencatat transaksi harian Anda. Pastikan untuk menghubungkan transaksi ke Pos Anggaran atau Pos Target yang sesuai agar progress limit/target otomatis terhitung dan tersinkronisasi.",
      path: "/dashboard",
      selector: "#tour-dashboard-income",
      placement: "bottom"
    },
    {
      title: "6. Pantau Grafik & Unduh Laporan Excel 📊",
      emoji: "🎉",
      desc: "Pantau grafik arus kas dan kontribusi pengeluaran di Dashboard secara real-time. Jika Anda ingin mengekspor seluruh data keuangan ke format Excel (.xlsx) yang lengkap dan rapi, kunjungi menu 'Laporan'.",
      path: "/reports",
      selector: "#tour-sidebar-reports",
      placement: "right"
    }
  ];

  const current = STEPS[step];

  const cleanLastHighlight = useCallback(() => {
    if (lastHighlightedEl) {
      lastHighlightedEl.style.removeProperty('position');
      lastHighlightedEl.style.removeProperty('z-index');
      lastHighlightedEl.style.removeProperty('pointer-events');
      lastHighlightedEl.style.removeProperty('background');
      lastHighlightedEl.style.removeProperty('border-radius');
      setLastHighlightedEl(null);
    }
  }, [lastHighlightedEl]);

  const updateSpotlight = useCallback(() => {
    cleanLastHighlight();

    if (!current || !current.selector) {
      setTargetRect(null);
      return;
    }
    
    // Find the visible element if there are duplicate selectors (responsive mobile/desktop variants)
    const elements = document.querySelectorAll(current.selector);
    let el = null;
    for (const element of elements) {
      if (element.offsetWidth > 0 || element.offsetHeight > 0 || element.getClientRects().length > 0) {
        el = element;
        break;
      }
    }
    // Fallback to first element if none are visible
    if (!el) el = elements[0];

    if (el) {
      // Scroll target instantly to the center of scroll area
      el.scrollIntoView({ behavior: 'auto', block: 'center' });

      // Elevate target above spotlight overlay
      el.style.setProperty('position', 'relative', 'important');
      el.style.setProperty('z-index', '52', 'important');
      el.style.setProperty('pointer-events', 'none', 'important');
      el.style.setProperty('background', 'rgba(255, 255, 255, 0.08)', 'important');
      el.style.setProperty('border-radius', '12px', 'important');

      setLastHighlightedEl(el);
      setTargetRect(el.getBoundingClientRect());
    } else {
      setTargetRect(null);
    }
  }, [current, cleanLastHighlight]);

  useEffect(() => {
    if (user?.id) {
      const hasSeen = localStorage.getItem(`hasSeenTour_${user.id}`);
      if (!hasSeen || forceOpen) {
        setIsOpen(true);
        setStep(0);
      }
    }
  }, [user, forceOpen]);

  useEffect(() => {
    const handleStartTour = () => {
      setIsOpen(true);
      setStep(0);
      navigate("/dashboard");
    };
    window.addEventListener('start-app-tour', handleStartTour);
    return () => window.removeEventListener('start-app-tour', handleStartTour);
  }, [navigate]);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(updateSpotlight, 350);
      window.addEventListener('resize', updateSpotlight);
      window.addEventListener('scroll', updateSpotlight, true);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', updateSpotlight);
        window.removeEventListener('scroll', updateSpotlight, true);
      };
    }
  }, [isOpen, step, updateSpotlight]);

  useEffect(() => {
    return () => {
      cleanLastHighlight();
    };
  }, [cleanLastHighlight]);

  const handleClose = () => {
    cleanLastHighlight();
    if (user?.id) {
      localStorage.setItem(`hasSeenTour_${user.id}`, 'true');
    }
    setIsOpen(false);
    if (onClose) onClose();
  };

  const handleNext = () => {
    const nextStep = step + 1;
    if (nextStep < STEPS.length) {
      const nextStepObj = STEPS[nextStep];
      if (nextStepObj.path && location.pathname !== nextStepObj.path) {
        navigate(nextStepObj.path);
      }
      setStep(nextStep);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (step > 0) {
      const prevStep = step - 1;
      const prevStepObj = STEPS[prevStep];
      if (prevStepObj.path && location.pathname !== prevStepObj.path) {
        navigate(prevStepObj.path);
      }
      setStep(prevStep);
    }
  };

  if (!isOpen) return null;

  const getTooltipStyle = () => {
    if (!targetRect || !current.selector) {
      return {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 60,
      };
    }

    const { left, top, right, bottom, width, height } = targetRect;
    const cardWidth = 380; 
    const cardHeight = 240; 
    const margin = 16;

    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    let style = {
      position: 'fixed',
      zIndex: 60,
      width: `${Math.min(cardWidth, windowWidth - 32)}px`,
      transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
    };

    const placement = current.placement || 'bottom';

    if (placement === 'right') {
      style.top = `${Math.max(margin, Math.min(top + height/2 - cardHeight/2, windowHeight - cardHeight - margin))}px`;
      style.left = `${right + margin}px`;
      // Mobile fallback if overflows horizontally
      if (right + margin + cardWidth > windowWidth) {
        style.left = '16px';
        style.top = `${Math.min(windowHeight - cardHeight - margin, bottom + margin)}px`;
      }
    } else if (placement === 'left') {
      style.top = `${Math.max(margin, Math.min(top + height/2 - cardHeight/2, windowHeight - cardHeight - margin))}px`;
      style.left = `${Math.max(margin, left - cardWidth - margin)}px`;
    } else if (placement === 'top') {
      style.top = `${Math.max(margin, top - cardHeight - margin)}px`;
      style.left = `${Math.max(margin, Math.min(left + width/2 - cardWidth/2, windowWidth - cardWidth - margin))}px`;
    } else {
      style.top = `${Math.min(windowHeight - cardHeight - margin, bottom + margin)}px`;
      style.left = `${Math.max(margin, Math.min(left + width/2 - cardWidth/2, windowWidth - cardWidth - margin))}px`;
    }

    return style;
  };

  const getSpotlightStyle = () => {
    if (!targetRect) return { display: 'none' };
    return {
      position: 'fixed',
      left: `${targetRect.left - 8}px`,
      top: `${targetRect.top - 8}px`,
      width: `${targetRect.width + 16}px`,
      height: `${targetRect.height + 16}px`,
      borderRadius: '16px',
      boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.75)',
      border: '2px solid #3b82f6',
      zIndex: 50,
      pointerEvents: 'none',
      transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
    };
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center animate-fade-in pointer-events-none">
      
      {/* Dark backdrop overlay (only visible when spotlight is off) */}
      {!targetRect && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm pointer-events-auto z-40" />
      )}

      {/* Spotlight cutout */}
      <div style={getSpotlightStyle()} />

      {/* Tooltip Card Container */}
      <div 
        style={getTooltipStyle()} 
        className="rounded-3xl bg-gradient-to-b from-[#131625] to-[#0b0c15] border border-white/10 shadow-2xl p-6 relative overflow-hidden flex flex-col justify-between min-h-[220px] pointer-events-auto"
      >
        {/* Shimmer backgrounds */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-accent-blue/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-accent-violet/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/5 relative z-10">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-accent-blue animate-pulse" />
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Panduan Memulai</span>
          </div>
          <button 
            onClick={handleClose}
            className="p-1 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col items-center text-center py-4 relative z-10">
          <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl shadow-inner mb-3">
            {current.emoji}
          </div>
          <h3 className="text-base font-bold text-white mb-1.5 leading-tight px-1">{current.title}</h3>
          <p className="text-xs text-gray-400 leading-relaxed px-1">{current.desc}</p>
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between pt-3 border-t border-white/5 relative z-10">
          {/* Progress dots */}
          <div className="flex gap-1.5">
            {STEPS.map((_, i) => (
              <span 
                key={i} 
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === step ? 'w-5 bg-accent-blue' : 'w-1.5 bg-white/15'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {step > 0 && (
              <button 
                onClick={handlePrev}
                className="px-3 py-1.5 rounded-xl border border-white/5 bg-white/5 text-xs text-gray-300 font-bold hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              >
                Kembali
              </button>
            )}
            
            <button 
              onClick={handleNext}
              className="py-1.5 px-4 rounded-xl flex items-center gap-1 text-xs text-white font-bold bg-accent-blue hover:bg-blue-600 transition-all shadow-[0_4px_12px_rgba(59,130,246,0.3)] hover:shadow-[0_4px_16px_rgba(59,130,246,0.55)] cursor-pointer"
            >
              {step < STEPS.length - 1 ? (
                <>
                  Lanjut
                  <ChevronRight size={13} />
                </>
              ) : (
                "Selesai"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourOverlay;
