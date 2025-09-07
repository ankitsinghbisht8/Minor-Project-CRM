import { configureStore } from '@reduxjs/toolkit'
import authSlice from './slices/authslice'


export const store = configureStore({
    reducer: {
        auth:authSlice,
    },
})