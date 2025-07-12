// src/components/Modal.jsx
import React from 'react';

const Modal = ({ show, title, message, onClose, onConfirm, showConfirmButton = false }) => {
  if (!show) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 font-inter">
      <div className="bg-neutral-800 rounded-xl shadow-2xl p-8 w-full max-w-md border border-neutral-700 text-white">
        <h3 className="text-2xl font-bold mb-4 text-blue-300">{title}</h3>
        <p className="text-neutral-300 mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="bg-neutral-600 text-white px-5 py-2 rounded-lg hover:bg-neutral-700 transition duration-200 ease-in-out shadow-md"
          >
            {showConfirmButton ? 'Cancel' : 'Close'}
          </button>
          {showConfirmButton && (
            <button
              onClick={onConfirm}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition duration-200 ease-in-out shadow-md"
            >
              Confirm
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;

