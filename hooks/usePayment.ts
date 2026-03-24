import { useState } from 'react';
import { bookingService } from '../features/booking/bookingService';

export const usePayment = () => {
  const [status, setStatus] = useState<'IDLE' | 'PROCESSING' | 'SUCCESS' | 'FAILED'>('IDLE');

  const initiatePayment = async (orderId: string, amount: number, method: 'VNPAY' | 'PAYOS') => {
    setStatus('PROCESSING');
    try {
      const result = await bookingService.processPayment({ orderId, amount, method });
      // Usually would return a deep link or WebView URL
      setStatus('SUCCESS');
      return result;
    } catch (error) {
      console.error('Payment initiation failed', error);
      setStatus('FAILED');
      throw error;
    }
  };

  const handleCallback = async (deepLinkUrl: string) => {
    // Process deep link url from payment gateway if using deep links
    // Validate the transaction with server
  };

  return { initiatePayment, handleCallback, status };
};
