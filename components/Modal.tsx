import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm bg-[#1A1A1A] border border-[#333] rounded-3xl overflow-hidden shadow-2xl transform transition-all animate-slide-up">
        <div className="flex justify-between items-center p-6 border-b border-[#333]">
          <h3 className="text-lg font-bold text-[#F2F0E9]">{title}</h3>
          <button 
            onClick={onClose}
            className="p-2 bg-[#333] rounded-full hover:bg-neutral-700 text-[#F2F0E9] transition-colors"
          >
            <X size={16} />
          </button>
        </div>
        <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;