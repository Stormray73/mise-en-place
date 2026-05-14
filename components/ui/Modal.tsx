/**
 * @file Modal.tsx
 * @responsibility A reusable wrapper for modal dialogs with a backdrop.
 * @dependencies React
 */

import React from "react";

interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export default function Modal({ title, onClose, children }: ModalProps) {
  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 transition-opacity"
      data-testid="modal-backdrop"
    >
      <div
        className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl max-w-md w-full shadow-2xl max-h-[80vh] flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">{title}</h3>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 text-2xl leading-none"
          >
            &times;
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
        <button
          onClick={onClose}
          className="mt-6 w-full py-2 text-zinc-500 hover:text-zinc-300 text-sm"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
