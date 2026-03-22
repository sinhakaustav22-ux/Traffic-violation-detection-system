import React, { useState } from 'react';
import { X } from 'lucide-react';

const SendAlertModal = ({ isOpen, onClose, onConfirm, violation, loading }) => {
  const [phone, setPhone] = useState('+91');
  const [channels, setChannels] = useState(['SMS']);

  if (!isOpen) return null;

  const handleChannelToggle = (channel) => {
    setChannels(prev => 
      prev.includes(channel) 
        ? prev.filter(c => c !== channel)
        : [...prev, channel]
    );
  };

  const handleSubmit = () => {
    if (phone.length < 10) return;
    if (channels.length === 0) return;
    onConfirm(phone, channels);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none bg-black bg-opacity-50">
      <div className="relative w-full max-w-md mx-auto my-6 z-50">
        <div className="relative flex flex-col w-full bg-white border-0 rounded-xl shadow-lg outline-none focus:outline-none">
          <div className="flex items-start justify-between p-5 border-b border-solid rounded-t border-slate-200">
            <h3 className="text-xl font-semibold text-gray-900">Send Alert</h3>
            <button
              className="p-1 ml-auto bg-transparent border-0 text-gray-400 hover:text-gray-900 float-right text-3xl leading-none font-semibold outline-none focus:outline-none transition-colors"
              onClick={onClose}
              disabled={loading}
            >
              <X size={24} />
            </button>
          </div>
          
          <div className="relative p-6 flex-auto">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+919876543210"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#FF9933] focus:ring-[#FF9933] sm:text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">Include country code (e.g., +91)</p>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notification Channels
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={channels.includes('SMS')}
                    onChange={() => handleChannelToggle('SMS')}
                    className="rounded border-gray-300 text-[#FF9933] focus:ring-[#FF9933] h-4 w-4"
                  />
                  <span className="ml-2 text-sm text-gray-700">SMS Message</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={channels.includes('WHATSAPP')}
                    onChange={() => handleChannelToggle('WHATSAPP')}
                    className="rounded border-gray-300 text-[#FF9933] focus:ring-[#FF9933] h-4 w-4"
                  />
                  <span className="ml-2 text-sm text-gray-700">WhatsApp Message</span>
                </label>
              </div>
            </div>
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
              className="bg-[#FF9933] text-white active:bg-orange-600 font-medium text-sm px-6 py-2.5 rounded shadow hover:shadow-lg outline-none focus:outline-none ease-linear transition-all duration-150 flex items-center disabled:opacity-70 disabled:cursor-not-allowed"
              type="button"
              onClick={handleSubmit}
              disabled={loading || phone.length < 10 || channels.length === 0}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </>
              ) : 'Send Alert'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SendAlertModal;
