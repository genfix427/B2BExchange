import { configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import { combineReducers } from 'redux'
import authReducer from './slices/authSlice'
import vendorReducer from './slices/vendorSlice'
import registrationReducer from './slices/registrationSlice'
import vendorProductReducer from './slices/vendorProductSlice';
import storeReducer from './slices/storeSlice';

// Create a separate persist config for auth
const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['isAuthenticated', 'user', 'userType']
}

const registrationPersistConfig = {
  key: 'registration',
  storage,
  whitelist: ['formData', 'currentStep']
}

const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
  vendor: vendorReducer,
  vendorProducts: vendorProductReducer,
  store: storeReducer,
  registration: persistReducer(registrationPersistConfig, registrationReducer)
})

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
})

export const persistor = persistStore(store)