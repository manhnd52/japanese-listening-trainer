'use client'
import { useEffect, useRef } from 'react'
import { useAppDispatch } from '@/hooks/redux'
import { setCredentials } from '@/store/features/auth/authSlice'
import { apiClient } from '@/lib/api'
import { useRouter } from 'next/navigation'

/**
 * Component to restore authentication state from localStorage on app initialization
 * This ensures Redux store is synced with persisted auth tokens after page reload
 */
export default function AuthInitializer() {
    const dispatch = useAppDispatch()
    const hasInitialized = useRef(false)
    const router = useRouter()

    useEffect(() => {
        // Only run once on mount
        if (hasInitialized.current) return
        hasInitialized.current = true

        const initAuth = async () => {
            // Check if we have a token in localStorage
            const accessToken = localStorage.getItem('accessToken')
            
            if (!accessToken) {
                console.log('[AuthInitializer] No token found in localStorage')
                router.push('/login')
                return
            }

            console.log('[AuthInitializer] Token found, verifying and restoring user session...')

            try {
                // Verify token and get user info from backend
                const response = await apiClient.get('/auth/me')
                
                const userData = response.data.data
                
                // Restore auth state to Redux
                dispatch(setCredentials({
                    user: {
                        id: parseInt(userData.id),
                        email: userData.email,
                        fullname: userData.name || userData.fullname,
                        avatarUrl: userData.avatarUrl || '',
                    },
                    accessToken
                }))

                console.log('[AuthInitializer] ✓ Auth state restored successfully')
            } catch (error) {
                console.error('[AuthInitializer] Failed to restore auth state:', error)
                // Token is invalid, clean up
                if (error && typeof error === 'object' && 'response' in error) {
                    const axiosError = error as { response?: { status?: number } }
                    if (axiosError.response?.status === 401) {
                        console.log('[AuthInitializer] Invalid token, cleaning up...')
                        localStorage.removeItem('accessToken')
                        localStorage.removeItem('refreshToken')
                        document.cookie = 'accessToken=; path=/; max-age=0' // Clear cookie
                        router.push('/login')
                    }
                }

            }
        }

        initAuth()
    }, [dispatch, router])

    // This component doesn't render anything
    return null
}
