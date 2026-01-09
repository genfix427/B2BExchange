import { configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import { combineReducers } from 'redux'
import adminAuthReducer from './slices/adminAuthSlice'
import vendorReducer from './slices/vendorSlice'
import adminProductReducer from './slices/adminProductSlice';

const persistConfig = {
  key: 'adminRoot',
  storage,
  whitelist: ['adminAuth'] // Only persist auth state
}

const rootReducer = combineReducers({
  adminAuth: adminAuthReducer,
  vendors: vendorReducer,
  adminProducts: adminProductReducer,
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