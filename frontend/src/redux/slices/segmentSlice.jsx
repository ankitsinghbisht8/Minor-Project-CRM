import { createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { createAsyncThunk } from '@reduxjs/toolkit';

const SEGMENT_STORAGE_KEY = 'segments';
const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

const loadPersistedSegments = () => {
    if (typeof window === 'undefined') return null;
    try {
        const raw = localStorage.getItem(SEGMENT_STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch (e) {
        return null;
    }
}

const persistSegments = (segments) => {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(SEGMENT_STORAGE_KEY, JSON.stringify(segments));
    } catch (e) {
        return null;
    }
}

const clearPersistedSegments = () => {
    if (typeof window === 'undefined') return;
    try {
        localStorage.removeItem(SEGMENT_STORAGE_KEY);
    } catch (e) {
        return null;
    }
}

// Shape raw dashboard rows into summarized segment cards (mirrors Segments.jsx)
const transformRowsToSegments = (rows) => {
    const grouped = Array.isArray(rows) ? rows.reduce((acc, r) => {
        const key = r.segment || 'Regular';
        if (!acc[key]) acc[key] = [];
        acc[key].push(r);
        return acc;
    }, {}) : {};

    const rulesText = {
        VIP: 'total_spend > 20000 AND num_orders > 10 AND days_since_last_order < 30',
        Loyal: 'total_spend > 10000 AND num_orders > 5',
        'Churn Risk': 'days_since_last_order > 180',
        Regular: 'everyone else',
    };

    const today = new Date().toISOString().split('T')[0];
    return Object.entries(grouped).map(([name, list], idx) => ({
        id: idx + 1,
        name,
        rules: rulesText[name] || '—',
        audienceSize: list.length,
        created: today,
        status: 'active',
    }));
}

const initialState = {
    segments: loadPersistedSegments() ?? [],
    loading: false,
    error: null,
    success: false,
    message: null,
    totalPages: 1,
    totalItems: 0,
    currentPage: 1,
    pageSize: 10,
}

export const fetchSegments = createAsyncThunk(
    'segment/fetchSegments',
    async (_, { rejectWithValue }) => {
        try {
            const res = await axios.get(`${API_BASE}/api/dashboard/segments`, { withCredentials: true });
            const rows = Array.isArray(res.data) ? res.data : [];
            const shaped = transformRowsToSegments(rows);
            return { items: shaped, totalItems: shaped.length };
        } catch (err) {
            const message = err?.response?.data?.error || err?.message || 'Failed to fetch segments';
            return rejectWithValue(message);
        }
    }
);

export const createSegment = createAsyncThunk(
    'segment/createSegment',
    async (payload, { rejectWithValue }) => {
        try {
            const res = await axios.post(`${API_BASE}/api/segments`, payload, {
                withCredentials: true,
                headers: { 'Content-Type': 'application/json' },
            });
            return res.data;
        } catch (err) {
            const message = err?.response?.data?.error || err?.message || 'Failed to create segment';
            return rejectWithValue(message);
        }
    }
);

const segmentSlice = createSlice({
    name: 'segment',
    initialState,
    reducers: {
        setSegments: (state, action) => {
            state.segments = action.payload.segments;
            persistSegments(state.segments);
        },
        setLoading: (state, action) => {
            state.loading = action.payload.loading;
        },
        setError: (state, action) => {
            state.error = action.payload.error;
        },
        setSuccess: (state, action) => {
            state.success = action.payload.success;
        },
        setMessage: (state, action) => {
            state.message = action.payload.message;
        },
        setTotalPages: (state, action) => {
            state.totalPages = action.payload.totalPages;
        },
        setTotalItems: (state, action) => {
            state.totalItems = action.payload.totalItems;
        },
        setCurrentPage: (state, action) => {
            state.currentPage = action.payload.currentPage;
        },
        setPageSize: (state, action) => {
            state.pageSize = action.payload.pageSize;
        },
        clearLocal: (state) => {
            state.segments = [];
            clearPersistedSegments();
        }
    },
    extraReducers: (builder) => {
        builder
            // fetchSegments
            .addCase(fetchSegments.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
                state.message = null;
            })
            .addCase(fetchSegments.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
                state.segments = action.payload.items;
                state.totalItems = action.payload.totalItems;
                state.totalPages = 1;
                persistSegments(state.segments);
            })
            .addCase(fetchSegments.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to fetch segments';
            })
            // createSegment
            .addCase(createSegment.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
                state.message = null;
            })
            .addCase(createSegment.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = action.payload?.message || 'Segment created successfully';
                // Optional: optimistic append could be done if API returns full card shape
            })
            .addCase(createSegment.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to create segment';
                state.success = false;
            });
    }
})

export const {
    setSegments,
    setLoading,
    setError,
    setSuccess,
    setMessage,
    setTotalPages,
    setTotalItems,
    setCurrentPage,
    setPageSize,
    clearLocal,
} = segmentSlice.actions;

export default segmentSlice.reducer;