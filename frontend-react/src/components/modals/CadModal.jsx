import { X } from 'lucide-react';

export default function CadModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="flex flex-col h-full p-6" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-700">
          <h2 className="text-base font-bold text-white">
            E-TWIN Digital Twin — CAD & Engineering Specification Sheet
          </h2>
          <button
            onClick={onClose}
            className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold transition-colors cursor-pointer border-none"
          >
            <X className="w-4 h-4" />
            Close
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 flex items-center justify-center overflow-auto py-6">
          <img
            src="/assets/e_twin_full_cad.jpg"
            alt="E-TWIN CAD Engineering Specification Sheet"
            className="max-w-[95%] max-h-[85vh] object-contain rounded-lg border border-slate-600 shadow-2xl"
          />
        </div>
      </div>
    </div>
  );
}
