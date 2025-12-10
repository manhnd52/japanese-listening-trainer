// redux.ts
'use client' // nếu dùng trong Next.js RSC

import { useDispatch, useSelector, useStore, TypedUseSelectorHook } from 'react-redux'
import type { AppDispatch, RootState, AppStore } from '../store'

// Hook dispatch với type
export const useAppDispatch = () => useDispatch<AppDispatch>()

// Hook selector với type
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

// Hook store với type
export const useAppStore = () => useStore<AppStore>()
