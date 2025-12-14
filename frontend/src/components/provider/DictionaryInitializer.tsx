'use client'
import { useEffect, useRef } from 'react'
import { useAppSelector } from '@/hooks/redux'
import { initializeDictionary } from '@/features/dictionary/hooks/useDictionary'
import { initializeTokenizer } from '@/features/dictionary/utils/tokenizer'

/**
 * Component to automatically initialize dictionary and kuromoji in background after login
 * This component should be placed in the root layout to preload dictionary and kuromoji
 * across all routes once user is authenticated
 */
export default function DictionaryInitializer() {
    const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated)
    console.log('[DictionaryInitializer] Rendered, isAuthenticated:', isAuthenticated)
    const hasInitialized = useRef(false)

    useEffect(() => {
        // Only initialize once when user is authenticated
        if (isAuthenticated && !hasInitialized.current) {
            console.log('[DictionaryInitializer] User authenticated, loading dictionary in background...')
            hasInitialized.current = true
            
            initializeDictionary()
                .then(() => {
                    console.log('[DictionaryInitializer] Dictionary preloaded successfully')
                    initializeTokenizer()
                        .then(() => {
                            console.log('[DictionaryInitializer] Kuromoji tokenizer initialized successfully')
                        })
                        .catch((err) => {
                            console.error('[DictionaryInitializer] Failed to initialize kuromoji tokenizer:', err)
                        })
                })
                .catch((err) => {
                    console.error('[DictionaryInitializer] Failed to preload dictionary:', err)
                    // Reset flag so it can retry
                    hasInitialized.current = false
                })
        }
    }, [isAuthenticated])

    return null
}
