import { configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import { combineReducers } from 'redux'
import authReducer from './slices/authSlice'
import vendorReducer from './slices/vendorSlice'
import registrationReducer from './slices/registrationSlice'

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'registration'] // Only persist auth and registration data
}

const rootReducer = combineReducers({
  auth: authReducer,
  vendor: vendorReducer,
  registration: registrationReducer
})

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
})

export const persistor = persistStore(store)