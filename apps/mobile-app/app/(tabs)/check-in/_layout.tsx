import React from 'react';
import { CheckoutProvider } from '../../../context/CheckoutContext';

export default function CheckInLayout({ children }: { children: React.ReactNode }) {
  return <CheckoutProvider>{children}</CheckoutProvider>;
}