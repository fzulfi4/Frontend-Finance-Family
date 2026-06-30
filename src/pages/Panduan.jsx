import { useState } from 'react';
import { 
  HelpCircle, Sparkles, BookOpen, CreditCard, 
  Target, FileSpreadsheet, ChevronDown, ChevronUp, Play
} from 'lucide-react';
import Card from '../components/ui/Card';

const AccordionItem = ({ id, activeId, setActiveId, title, icon: Icon, color, children }) => {
  const isOpen = activeId === id;
  return (
    <div className="border border-white/5 bg-[#0e1122]/40 rounded-2xl overflow-hidden transition-all duration-300">
      <button
        onClick={() => setActiveId(isOpen ? null : id)}
        className="w-full flex items-center justify-between p-5 text-left transition-all hover:bg-white/[0.02] cursor-pointer"
      >
        <div className="flex items-center gap-4">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center border"
            style={{ 
              backgroundColor: `${color}10`, 
              color: color, 
              borderColor: `${color}25` 
            }}
          >
            <Icon size={18} />
          </div>
          <span className="font-bold text-sm md:text-base text-gray-200">{title}</span>
        </div>
        {isOpen ? <ChevronUp size={18} className="text-gray-500" /> : <ChevronDown size={18} className="text-gray-500" />}
      </button>

      {isOpen && (
        <div className="p-5 border-t border-white/5 bg-black/10 text-sm text-gray-400 space-y-4 animate-fade-in">
          {children}
        </div>
      )}
    </div>
  );
};

const Panduan = () => {
  const [activeAccordion, setActiveAccordion] = useState('getting_started');

  const triggerTour = () => {
    window.dispatchEvent(new Event('start-app-tour'));
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 pb-safe animate-fade-in">
      
      {/* ── Header ── */}
      <header className="page-header relative overflow-hidden p-6 rounded-3xl bg-gradient-to-r from-accent-blue/10 via-accent-violet/5 to-transparent border border-white/5 backdrop-blur-xl">
        <div className="absolute -right-16 -top-16 w-48 h-48 bg-accent-blue/10 rounded-full blur-3xl pointer-events-none" />
        <div>
          <h1 className="page-title flex items-center gap-2.5">
            <HelpCircle size={24} className="text-accent-blue animate-pulse" />
            Panduan Penggunaan
          </h1>
          <p className="page-subtitle">Pelajari alur cara pakai aplikasi agar pembukuan keluarga Anda teratur dan sinkron</p>
        </div>
      </header>

      {/* ── Main Content Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Quick Actions Card */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="p-5 bg-gradient-to-br from-[#13172c] to-transparent border-accent-blue/10 flex flex-col justify-between min-h-[220px]">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-accent-blue" />
                <h3 className="font-bold text-sm text-white">Butuh Panduan Interaktif?</h3>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Anda dapat mengulang kembali tur visual interaktif step-by-step yang menyorot langkah penting di dalam aplikasi kapan saja.
              </p>
            </div>
            <button
              onClick={triggerTour}
              className="mt-6 w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-xs text-white bg-accent-blue hover:bg-blue-600 shadow-[0_4px_16px_rgba(59,130,246,0.25)] hover:shadow-[0_4px_24px_rgba(59,130,246,0.45)] transition-all active:scale-[0.98] cursor-pointer"
            >
              <Play size={14} className="fill-current" />
              Mulai Tur Aplikasi
            </button>
          </Card>

          <Card className="p-5 bg-black/10 border-white/5 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xs">💡</span>
              <h4 className="text-xs font-bold text-gray-300">Tips Penting</h4>
            </div>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              Selalu hubungkan transaksi Anda dengan <strong>Pos Anggaran</strong> atau <strong>Pos Target</strong> agar sistem dapat menganalisis sisa budget & selisih pendapatan secara otomatis dan akurat.
            </p>
          </Card>
        </div>

        {/* Right Column: Documentation Accordions */}
        <div className="lg:col-span-2 space-y-4">
          
          <AccordionItem
            id="getting_started"
            activeId={activeAccordion}
            setActiveId={setActiveAccordion}
            title="📖 Alur Cara Penggunaan Cepat"
            icon={BookOpen}
            color="#3b82f6"
          >
            <p className="leading-relaxed">
              Untuk memulai pembukuan keuangan keluarga dari nol, ikuti alur 4 langkah mudah berikut:
            </p>
            <ol className="space-y-3 pl-4 list-decimal text-xs text-gray-400">
              <li>
                <strong className="text-gray-200">Tambahkan Dompet/Akun:</strong> Buka Dashboard utama dan klik <strong className="text-accent-blue">Tambah Dompet</strong>. Ini digunakan sebagai tempat penyimpanan saldo nyata Anda.
              </li>
              <li>
                <strong className="text-gray-200">Buat Kategori Transaksi:</strong> Buka menu <strong className="text-gray-200">Kategori</strong> untuk menentukan jenis pengeluaran/pemasukan Anda.
              </li>
              <li>
                <strong className="text-gray-200">Atur Anggaran Bulanan:</strong> Buka menu <strong className="text-gray-200">Pengeluaran Bulanan</strong> dan <strong className="text-gray-200">Pemasukan Bulanan</strong> untuk membuat rancangan rencana budget rutin Anda.
              </li>
              <li>
                <strong className="text-gray-200">Input Transaksi:</strong> Klik tombol pemasukan atau pengeluaran di Dashboard untuk mencatat aktivitas keuangan Anda. Hubungkan dengan Pos Anggaran/Target yang telah dibuat sebelumnya.
              </li>
            </ol>
          </AccordionItem>

          <AccordionItem
            id="wallet_management"
            activeId={activeAccordion}
            setActiveId={setActiveAccordion}
            title="💳 Manajemen Akun & Dompet"
            icon={CreditCard}
            color="#10b981"
          >
            <p className="leading-relaxed">
              Fitur <strong>Dompet/Akun</strong> mencerminkan posisi penyimpanan uang fisik Anda:
            </p>
            <ul className="space-y-2.5 list-disc pl-5 text-xs text-gray-400">
              <li>
                <strong className="text-gray-200">Tunai (Cash):</strong> Dompet fisik untuk uang tunai harian Anda.
              </li>
              <li>
                <strong className="text-gray-200">Bank Account:</strong> Rekening bank (BCA, Mandiri, dll.) untuk menampung saldo tabungan atau transfer bank.
              </li>
              <li>
                <strong className="text-gray-200">E-Wallet:</strong> Dompet elektronik seperti GoPay, OVO, ShopeePay untuk transaksi digital.
              </li>
              <li>
                <strong className="text-gray-200">Internal Transfer:</strong> Fitur untuk memindahkan uang dari dompet satu ke dompet lainnya (misal: mengambil uang di ATM dari Bank ke Tunai). Transfer ini tidak mengubah kekayaan total keluarga Anda karena hanya memindahkan dana.
              </li>
            </ul>
          </AccordionItem>

          <AccordionItem
            id="budget_targets"
            activeId={activeAccordion}
            setActiveId={setActiveAccordion}
            title="📋 Pos Anggaran vs Target Pemasukan"
            icon={HelpCircle}
            color="#f59e0b"
          >
            <p className="leading-relaxed">
              Memahami perbedaan dan cara kerja batas anggaran serta target pemasukan:
            </p>
            <div className="space-y-3.5">
              <div className="bg-white/2 p-3.5 rounded-xl border border-white/5">
                <h5 className="text-xs font-bold text-accent-amber mb-1">Batas Anggaran (Monthly Expense)</h5>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  Batasan nominal maksimal pengeluaran bulanan Anda untuk pos tertentu (misalnya limit Anggaran Belanja Dapur Rp 2.000.000). Sistem akan memberikan peringatan kuning saat pemakaian mencapai 80% dan merah jika melebihi 100%.
                </p>
              </div>
              <div className="bg-white/2 p-3.5 rounded-xl border border-white/5">
                <h5 className="text-xs font-bold text-accent-green mb-1">Target Pemasukan (Monthly Income)</h5>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  Target pendapatan bulanan yang ingin dicapai (misalnya Target Penjualan Toko Rp 10.000.000). Membantu Anda memantau seberapa jauh pendapatan riil yang sudah terkumpul bulan ini dibandingkan target awal.
                </p>
              </div>
            </div>
          </AccordionItem>

          <AccordionItem
            id="goals_debts"
            activeId={activeAccordion}
            setActiveId={setActiveAccordion}
            title="🎯 Sasaran Tabungan & Hutang Piutang"
            icon={Target}
            color="#ec4899"
          >
            <p className="leading-relaxed">
              Fitur khusus untuk rencana masa depan dan kewajiban finansial:
            </p>
            <ul className="space-y-2 list-disc pl-5 text-xs text-gray-400">
              <li>
                <strong className="text-gray-200">Target Tabungan (Goals):</strong> Digunakan untuk merencanakan tabungan impian Anda (misalnya Liburan Keluarga, Membeli Mobil). Anda dapat menyetor dana (top-up) ke goal ini dan sistem akan melacak progress persentase tercapainya goal.
              </li>
              <li>
                <strong className="text-gray-200">Hutang & Piutang (Debts):</strong> Digunakan untuk mencatat uang yang Anda pinjam dari orang lain (Hutang/Payable) maupun uang orang lain yang dipinjam dari Anda (Piutang/Receivable). Anda dapat mencatat cicilan pelunasan secara bertahap hingga statusnya berubah menjadi lunas.
              </li>
            </ul>
          </AccordionItem>

          <AccordionItem
            id="reports_analytics"
            activeId={activeAccordion}
            setActiveId={setActiveAccordion}
            title="📊 Laporan Excel & Analisis"
            icon={FileSpreadsheet}
            color="#8b5cf6"
          >
            <p className="leading-relaxed">
              Mengekspor seluruh pembukuan Anda ke format dokumen yang rapi dan terperinci:
            </p>
            <ul className="space-y-2 list-disc pl-5 text-xs text-gray-400">
              <li>
                <strong className="text-gray-200">Multi-Sheet Excel:</strong> Ekspor Laporan menghasilkan file dengan 10 tab lembar kerja terpisah untuk analisis komprehensif.
              </li>
              <li>
                <strong className="text-gray-200">Analisis Pos Bulanan:</strong> Menampilkan realisasi pemasukan dan pengeluaran per pos, disandingkan langsung dengan batas limit/target pemasukan Anda sehingga terlihat selisih surplus/defisitnya.
              </li>
              <li>
                <strong className="text-gray-200">Pencegahan Double-Count Transfer:</strong> Baris total kas keseluruhan secara cerdas mengabaikan transaksi transfer internal, sehingga nilai cash flow total yang tertera di baris bawah adalah murni pemasukan dan pengeluaran riil keluarga Anda.
              </li>
            </ul>
          </AccordionItem>

        </div>

      </div>

    </div>
  );
};

export default Panduan;
