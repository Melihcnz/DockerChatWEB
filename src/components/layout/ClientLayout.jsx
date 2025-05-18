'use client';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Providers from '@/app/providers';
import AppLayout from '@/components/layout/AppLayout';

export default function ClientLayout({ children }) {
  return (
    <Providers>
      <ToastContainer position="top-right" autoClose={3000} />
      <AppLayout>{children}</AppLayout>
    </Providers>
  );
} 