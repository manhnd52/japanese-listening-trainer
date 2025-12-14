'use client'
import { useRef, useEffect } from 'react'
import { Provider } from 'react-redux'
import { makeStore, AppStore } from '@/store'
import { setCredentials } from '@/store/features/auth/authSlice'

export default function StoreProvider({
  children
}: {
  children: React.ReactNode
}) {
  const storeRef = useRef<AppStore | null>(null)
  if (!storeRef.current) {
    // Create the store instance the first time this renders
    storeRef.current = makeStore()
    
    // Restore auth state from localStorage
    if (typeof window !== 'undefined') {
      const accessToken = localStorage.getItem('accessToken')
      const userStr = localStorage.getItem('user')
      
      if (accessToken && userStr) {
        try {
          const user = JSON.parse(userStr)
          console.log('🔐 Restoring auth state:', user)
          storeRef.current.dispatch(setCredentials({ user, accessToken }))
        } catch (error) {
          console.error('Failed to restore auth state:', error)
          localStorage.removeItem('accessToken')
          localStorage.removeItem('user')
        }
      }
    }
  }

  return <Provider store={storeRef.current}>{children}</Provider>
}