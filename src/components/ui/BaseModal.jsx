import { useEffect } from 'react';
import { X } from 'lucide-react';

const BaseModal = ({ isOpen, onClose, title, icon: Icon, iconColor = 'text-accent-blue', children }) => {
  // Prevent body scroll when modal is open
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
      className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div 
        className="
          w-full sm:max-w-md
          bg-[#121418] border border-white/10
          rounded-t-3xl sm:rounded-2xl
          shadow-2xl
          transform transition-all
          animate-in fade-in slide-in-from-bottom-4 sm:zoom-in-95
          duration-200
          flex flex-col
        "
        style={{ maxHeight: '92dvh' }}
      >
        {/* Drag handle — mobile only */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-white/5 shrink-0">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
            {Icon && <Icon size={22} className={iconColor} />}
            {title}
          </h2>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="px-6 py-5 overflow-y-auto flex-1 pb-safe">
          {children}
        </div>
      </div>
    </div>
  );
};

export default BaseModal;
