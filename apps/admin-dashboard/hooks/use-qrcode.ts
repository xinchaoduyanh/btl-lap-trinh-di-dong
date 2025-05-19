import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import QRCode from 'qrcode';

interface QRCode {
  id: string;
  code: string;
  validUntil: string;
  location?: string;
  isUsed: boolean;
  createdAt: string;
  updatedAt: string;
}

export function useQRCode() {
  const [qrCodes, setQRCodes] = useState<QRCode[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchQRCodes = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/checkout/qr-code');
      setQRCodes(response.data);
    } catch (error) {
      console.error('Failed to fetch QR codes:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const generateQRCode = useCallback(async (validUntil: string, location?: string) => {
    try {
      setLoading(true);
      const response = await axios.post('/api/checkout/qr-code', {
        validUntil,
        location
      });
      setQRCodes(prev => [...prev, response.data]);
      return response.data;
    } catch (error) {
      console.error('Failed to generate QR code:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleQRCodeStatus = useCallback(async (id: string) => {
    try {
      setLoading(true);
      const response = await axios.post(`/api/checkout/qr-code/${id}/toggle`);
      setQRCodes(prev =>
        prev.map(qr => (qr.id === id ? { ...qr, isUsed: !qr.isUsed } : qr))
      );
      return response.data;
    } catch (error) {
      console.error('Failed to toggle QR code status:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const generateQRCodeImage = useCallback(async (code: string) => {
    try {
      // Tạo URL cho QR code
      const qrCodeUrl = `${window.location.origin}/api/checkout/check-in?code=${code}`;

      // Tạo hình ảnh QR code
      const qrCodeDataUrl = await QRCode.toDataURL(qrCodeUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });

      return qrCodeDataUrl;
    } catch (error) {
      console.error('Failed to generate QR code image:', error);
      throw error;
    }
  }, []);

  // Fetch QR codes on mount
  useEffect(() => {
    fetchQRCodes();
  }, [fetchQRCodes]);

  return {
    qrCodes,
    loading,
    fetchQRCodes,
    generateQRCode,
    toggleQRCodeStatus,
    generateQRCodeImage
  };
}
