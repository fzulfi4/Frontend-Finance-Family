import { useEffect } from 'react';
import { X } from 'lucide-react';

const BaseModal = ({ isOpen, onClose, title, icon: Icon, iconColor = 'text-accent-blue', children }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-md p-0 sm:p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="
          w-full sm:max-w-md
          bg-dark-surface border border-dark-border
          rounded-t-3xl sm:rounded-2xl
          shadow-modal
          animate-slide-up
          flex flex-col
          relative overflow-hidden
        "
        style={{ maxHeight: '94dvh' }}
      >
        {/* Subtle top glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        {/* Drag handle — mobile only */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-white/15" />
        </div>

        {/* Header */}
        <div className="flex justify-between items-center px-5 md:px-6 py-4 border-b border-dark-border shrink-0">
          <h2 className="flex items-center gap-2.5 text-base font-semibold text-white">
            {Icon && (
              <span className={`p-1.5 rounded-lg bg-white/5 ${iconColor}`}>
                <Icon size={18} />
              </span>
            )}
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-gray-500 hover:text-white hover:bg-white/10 transition-all duration-150"
            aria-label="Tutup"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="px-5 md:px-6 py-5 overflow-y-auto flex-1 pb-safe scrollbar-none">
          {children}
        </div>
      </div>
    </div>
  );
};

export default BaseModal;
