import { Toaster } from 'react-hot-toast';
import AppRoutes from './routes/AppRoutes';

export default function App() {
  return (
    <>
      <AppRoutes />

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#121318',
            color: '#e2e8f0',
            border: '1px solid rgba(255,255,255,0.1)',
            fontSize: '13px',
          },
          success: {
            iconTheme: {
              primary: '#f59e0b',
              secondary: '#121318',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#121318',
            },
          },
        }}
      />
    </>
  );
}