import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../axios';

export const fetchAuth = createAsyncThunk('auth/fetchAuth', async (params) => {
  const { data } = await axios.post('/auth/login', params);
  if (data.token) {
    localStorage.setItem('token', data.token);
  }
  return data;
});

export const fetchAuthMe = createAsyncThunk(
  'auth/fetchAuthMe',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get('/auth/me');
      // Предполагаем, что данные о подписках приходят сразу с пользователем
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка авторизации');
    }
  }
);
export const fetchRegister = createAsyncThunk('auth/fetchRegister', async (params) => {
  const { data } = await axios.post('/auth/register', params);
  return data;
});

const initialState = {
  data: null,
  status: 'idle',
  error: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.data = null;
      localStorage.removeItem('token');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAuth.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchAuth.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
      })
      .addCase(fetchAuth.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(fetchAuthMe.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchAuthMe.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
      })
      .addCase(fetchAuthMe.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(fetchRegister.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchRegister.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(fetchRegister.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export const selectIsAuth = (state) => Boolean(state.auth.data);
export const selectAuthStatus = (state) => state.auth.status;
export const selectAuthError = (state) => state.auth.error;

export const authReducer = authSlice.reducer;
export const { logout } = authSlice.actions;