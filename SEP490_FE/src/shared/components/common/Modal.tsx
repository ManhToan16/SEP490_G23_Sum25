import React from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

const Modal: React.FC<ModalProps> = ({ open, onClose, children, title }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl p-8 min-w-[400px] max-w-lg w-full relative">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold"
          onClick={onClose}
          type="button"
        >
          &times;
        </button>
        {title && <h2 className="text-2xl font-bold mb-6 text-center text-clinic-navy">{title}</h2>}
        {children}
      </div>
    </div>
  );
};

export default Modal; 