import React, { useState, useEffect } from 'react';
import { ClubEvent } from '../types';
import { Button } from './Button';
import { X, ShieldCheck, Smartphone, CreditCard, Wallet, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface PaymentModalProps {
  event: ClubEvent;
  onClose: () => void;
  onSuccess: (transactionId: string, method: string) => void;
}

type PaymentStep = 'summary' | 'method' | 'processing' | 'success' | 'failed';

export const PaymentModal: React.FC<PaymentModalProps> = ({ event, onClose, onSuccess }) => {
  const [step, setStep] = useState<PaymentStep>('summary');
  const [selectedMethod, setSelectedMethod] = useState<string>('UPI');
  const [processingTime, setProcessingTime] = useState(0);

  // Parse fee string to number for calculation (mock logic)
  const baseFee = parseInt(event.fee?.replace(/[^0-9]/g, '') || '0');
  const platformFee = Math.round(baseFee * 0.02); // 2% fee
  const totalAmount = baseFee + platformFee;

  useEffect(() => {
    let interval: any;
    if (step === 'processing') {
      interval = setInterval(() => {
        setProcessingTime((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setStep('success');
            return 100;
          }
          return prev + 2; // Progress speed
        });
      }, 50);
    }
    return () => clearInterval(interval);
  }, [step]);

  const handlePay = () => {
    setStep('processing');
  };

  const handleFinish = () => {
    const transactionId = `TXN_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    onSuccess(transactionId, selectedMethod);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900">
          <div className="flex items-center gap-2 text-[#0ea5e9] dark:text-blue-400 font-bold">
            <ShieldCheck size={20} />
            <span>Secure Checkout</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          
          {step === 'summary' && (
            <div className="space-y-6 animate-in slide-in-from-right">
              <div>
                <h3 className="text-gray-500 dark:text-gray-400 text-xs uppercase font-bold tracking-wider mb-1">Paying For</h3>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">{event.title}</h2>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{new Date(event.date).toLocaleDateString()} at {event.location}</p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl space-y-2 border border-dashed border-gray-200 dark:border-gray-600">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-300">Ticket Price</span>
                  <span className="font-medium text-gray-900 dark:text-white">₹{baseFee}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-300">Platform Fee (2%)</span>
                  <span className="font-medium text-gray-900 dark:text-white">₹{platformFee}</span>
                </div>
                <div className="pt-2 border-t border-gray-200 dark:border-gray-600 flex justify-between text-base font-bold">
                  <span className="text-gray-900 dark:text-white">Total Payable</span>
                  <span className="text-[#0ea5e9] dark:text-blue-400">₹{totalAmount}</span>
                </div>
              </div>

              <div className="space-y-3">
                 <p className="text-sm font-medium text-gray-900 dark:text-white">Select Payment Method</p>
                 {[
                   { id: 'UPI', icon: <Smartphone size={20}/>, label: 'UPI (GPay, PhonePe, Paytm)' },
                   { id: 'Card', icon: <CreditCard size={20}/>, label: 'Credit / Debit Card' },
                   { id: 'Wallet', icon: <Wallet size={20}/>, label: 'Wallets' },
                 ].map((method) => (
                   <button
                     key={method.id}
                     onClick={() => setSelectedMethod(method.id)}
                     className={`w-full p-3 rounded-xl flex items-center gap-3 border transition-all ${
                       selectedMethod === method.id 
                         ? 'border-[#0ea5e9] bg-blue-50 dark:bg-blue-900/20 text-[#0ea5e9] dark:text-blue-300'
                         : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                     }`}
                   >
                     {method.icon}
                     <span className="text-sm font-medium">{method.label}</span>
                     <div className={`ml-auto w-4 h-4 rounded-full border flex items-center justify-center ${
                        selectedMethod === method.id ? 'border-[#0ea5e9] dark:border-blue-400' : 'border-gray-400'
                     }`}>
                        {selectedMethod === method.id && <div className="w-2 h-2 rounded-full bg-[#0ea5e9] dark:bg-blue-400" />}
                     </div>
                   </button>
                 ))}
              </div>

              <Button onClick={handlePay} fullWidth className="mt-2 text-lg">
                Pay ₹{totalAmount}
              </Button>
            </div>
          )}

          {step === 'processing' && (
            <div className="py-10 text-center animate-in fade-in zoom-in">
              <div className="relative w-20 h-20 mx-auto mb-6">
                 <svg className="w-full h-full transform -rotate-90">
                    <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-200 dark:text-gray-700" />
                    <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-[#0ea5e9] dark:text-blue-500" strokeDasharray={226} strokeDashoffset={226 - (226 * processingTime) / 100} />
                 </svg>
                 <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold text-[#0ea5e9] dark:text-blue-500">{processingTime}%</span>
                 </div>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Processing Payment...</h3>
              <p className="text-gray-500 text-sm">Please do not close this window.</p>
              <div className="mt-6 flex justify-center gap-2 text-xs text-gray-400">
                  <ShieldCheck size={14} /> Bank Encrypted
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="py-6 text-center animate-in fade-in zoom-in">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600 dark:text-green-400">
                <CheckCircle size={48} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Payment Successful!</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Your ticket has been booked.</p>
              
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl mb-6 text-left">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-500">Transaction ID</span>
                    <span className="font-mono text-gray-900 dark:text-white">TXN_{Date.now().toString().slice(-6)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Amount Paid</span>
                    <span className="font-bold text-gray-900 dark:text-white">₹{totalAmount}</span>
                  </div>
              </div>

              <Button onClick={handleFinish} fullWidth>
                View Ticket
              </Button>
            </div>
          )}

        </div>
        
        {/* Footer Security Note */}
        {step === 'summary' && (
            <div className="bg-gray-50 dark:bg-gray-900 p-3 text-center border-t border-gray-100 dark:border-gray-700">
                <p className="text-[10px] text-gray-400 flex items-center justify-center gap-1">
                    <ShieldCheck size={12} /> Powered by Razorpay Secure
                </p>
            </div>
        )}
      </div>
    </div>
  );
};