import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query' // <-- NEW
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { ProgressProvider } from './context/ProgressContext.jsx'
import './index.css'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

// Create a client with aggressive caching rules to make navigation instant
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Don't refetch every time user changes tabs
      staleTime: 1000 * 60 * 5, // Data is fresh for 5 minutes (no API call needed)
      cacheTime: 1000 * 60 * 30, // Keep unused data in memory for 30 minutes
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <QueryClientProvider client={queryClient}> {/* <-- NEW */}
        <BrowserRouter>
          <AuthProvider>
            <ProgressProvider>
              <App />
            </ProgressProvider>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>,
)