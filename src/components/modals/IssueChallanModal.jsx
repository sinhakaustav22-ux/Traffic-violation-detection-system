import React, { useState } from 'react';
import { X } from 'lucide-react';

const IssueChallanModal = ({ isOpen, onClose, onConfirm, violation, loading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none bg-black bg-opacity-50">
      <div className="relative w-full max-w-md mx-auto my-6 z-50">
        <div className="relative flex flex-col w-full bg-white border-0 rounded-xl shadow-lg outline-none focus:outline-none">
          <div className="flex items-start justify-between p-5 border-b border-solid rounded-t border-slate-200">
            <h3 className="text-xl font-semibold text-gray-900">Issue Challan</h3>
            <button
              className="p-1 ml-auto bg-transparent border-0 text-gray-400 hover:text-gray-900 float-right text-3xl leading-none font-semibold outline-none focus:outline-none transition-colors"
              onClick={onClose}
              disabled={loading}
            >
              <X size={24} />
            </button>
          </div>
          
          <div className="relative p-6 flex-auto">
            <p className="text-sm text-gray-500 mb-4">
              You are about to issue a challan for the following violation:
            </p>
            
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="block text-gray-500">Vehicle No</span>
                  <span className="font-medium text-gray-900">{violation?.vehicle_number}</span>
                </div>
                <div>
                  <span className="block text-gray-500">Type</span>
                  <span className="font-medium text-gray-900">{violation?.violation_type?.replace(/_/g, ' ')}</span>
                </div>
                <div>
                  <span className="block text-gray-500">Fine Amount</span>
                  <span className="font-medium text-gray-900">₹{violation?.fine_amount}</span>
                </div>
                <div>
                  <span className="block text-gray-500">Date</span>
                  <span className="font-medium text-gray-900">{new Date(violation?.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            
            <p className="text-sm text-gray-600">
              This action will generate a PDF document and mark the violation status as <span className="font-semibold text-red-600">CHALLAN ISSUED</span>. This cannot be undone.
            </p>
          </div>
          
          <div className="flex items-center justify-end p-6 border-t border-solid rounded-b border-slate-200">
            <button
              className="text-gray-500 background-transparent font-medium px-6 py-2 text-sm outline-none focus:outline-none mr-2 ease-linear transition-all duration-150"
              type="button"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              className="bg-[#138808] text-white active:bg-green-700 font-medium text-sm px-6 py-2.5 rounded shadow hover:shadow-lg outline-none focus:outline-none ease-linear transition-all duration-150 flex items-center disabled:opacity-70 disabled:cursor-not-allowed"
              type="button"
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : 'Confirm & Issue'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueChallanModal;
