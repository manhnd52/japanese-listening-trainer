import { configureStore } from '@reduxjs/toolkit'
import userReducer from './features/user/userSlice'
import authReducer from './features/auth/authSlice'
import playerReducer from './features/player/playerSlice'

import folderReducer from './features/folder/folderSlice'
import sharringReducer  from './features/sharring/sharringSlice';
import audioReducer from './features/audio/audioSlice';
export const makeStore = () => {
  return configureStore({
    reducer: {
      user: userReducer,
      auth: authReducer,
      player: playerReducer,
      folder: folderReducer,
      audio: audioReducer,
      sharing: sharringReducer,
    }
  })
}

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']