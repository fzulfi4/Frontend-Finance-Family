import { X } from 'lucide-react';

const BaseModal = ({ isOpen, onClose, title, icon: Icon, iconColor = 'text-accent-blue', children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div 
        className="w-full max-w-md bg-[#121418] border border-white/10 rounded-2xl p-6 shadow-2xl transform transition-all animate-in fade-in zoom-in-95 duration-200"
        style={{ maxHeight: '90vh', overflowY: 'auto' }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="flex items-center gap-2 text-xl font-semibold m-0 text-white">
            {Icon && <Icon size={24} className={iconColor} />}
            {title}
          </h2>
          <button 
            onClick={onClose} 
            className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        {children}
      </div>
    </div>
  );
};

export default BaseModal;
