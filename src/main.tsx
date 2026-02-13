import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from '@/contexts/AuthContext'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <App />
      <ToastContainer
        position="top-right"
        theme="light"
        toastClassName="toast-mis"
        progressClassName="toast-mis-progress"
        closeOnClick
        pauseOnHover
        draggable
      />
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
)
