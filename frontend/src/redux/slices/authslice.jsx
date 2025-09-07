import { createSlice } from '@reduxjs/toolkit'
import { createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
    try {
        const response = await axios.post(
            `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000'}/api/auth/login`,
            credentials,
            { withCredentials: true }
        )
        return response.data
    } catch (error) {
        return rejectWithValue(error.response?.data || { message: 'Login failed' })
    }
})

export const logout = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
    try {
        const response = await axios.post(
            `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000'}/api/auth/logout`,
            {},
            { withCredentials: true }
        )
        
        return response.data
    } catch (error) {
        return rejectWithValue(error.response?.data || { message: 'Logout failed' })
    }
})

export const register = createAsyncThunk('auth/register', async (credentials, { rejectWithValue }) => {
    try {
        const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000'}/api/auth/register`, credentials)
        return response.data
    } catch (error) {
        return rejectWithValue(error.response?.data || { message: 'Registration failed' })
    }
})

export const googleLogin = createAsyncThunk('auth/googleLogin', async (credentials, { rejectWithValue }) => {
    try {
        const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000'}/api/auth/google/login`, credentials)
        return response.data
    } catch (error) {
        return rejectWithValue(error.response?.data || { message: 'Google login failed' })
    }
})

export const refreshToken = createAsyncThunk('auth/refreshToken', async (credentials, { rejectWithValue }) => {
    try {
        const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000'}/api/auth/refresh`, credentials, { withCredentials: true })
        return response.data
    } catch (error) {
        return rejectWithValue(error.response?.data || { message: 'Token refresh failed' })
    }
})


const initialState = {
    user: null,
    token: null,
    loading: false,
    error: null,
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload.user
        },
        setToken: (state, action) => {
            state.token = action.payload.token
        },
    },
    extraReducers: (builder) => {
        builder.addCase(login.pending, (state) => {
            state.loading = true
        })
        builder.addCase(login.fulfilled, (state, action) => {
            state.error = null
            state.loading = false
            state.user = action.payload.user
            state.token = action.payload.token
        })
        builder.addCase(login.rejected, (state, action) => {
            state.error = action.payload
            state.loading = false
        })
        builder.addCase(register.pending, (state) => {
            state.loading = true
        })
        builder.addCase(register.fulfilled, (state, action) => {
            state.error = null
            state.loading = false
            state.user = action.payload.user
            state.token = action.payload.token
        })
        builder.addCase(register.rejected, (state, action) => {
            state.error = action.payload
            state.loading = false
        })
        builder.addCase(googleLogin.pending, (state) => {
            state.loading = true
        })
        builder.addCase(googleLogin.fulfilled, (state, action) => {
            state.error = null
            state.loading = false
            state.user = action.payload.user
            state.token = action.payload.token
        })
        builder.addCase(googleLogin.rejected, (state, action) => {
            state.error = action.payload
            state.loading = false
        })
        builder.addCase(refreshToken.pending, (state) => {
            state.loading = true
        })
        builder.addCase(refreshToken.fulfilled, (state, action) => {
            state.error = null
            state.loading = false
            state.user = action.payload.user
            state.token = action.payload.token
        })
        builder.addCase(refreshToken.rejected, (state, action) => {
            state.error = action.payload
            state.loading = false
        })
        builder.addCase(logout.pending, (state) => {
            state.loading = true
        })
        builder.addCase(logout.fulfilled, (state) => {
            state.error = null
            state.loading = false
            state.user = null
            state.token = null
        })
        builder.addCase(logout.rejected, (state, action) => {
            state.error = action.payload
            state.loading = false
        })
    }
})

export const { setUser, setToken } = authSlice.actions
export default authSlice.reducer
