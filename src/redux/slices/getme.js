import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../axios'; // Assuming you have a configured axios instance


const initialState = {
    user: null,
    isLoading: false,
    error: null,
  };


export const fetchUser = createAsyncThunk('user/fetchUser', async () => {
    try {
      const response = await axios.get('/auth/me');
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  });


  const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
      builder
        .addCase(fetchUser.pending, (state) => {
          state.isLoading = true;
          state.error = null;
        })
        .addCase(fetchUser.fulfilled, (state, action) => {
          state.isLoading = false;
          state.error = null;
          state.user = action.payload;
        })
        .addCase(fetchUser.rejected, (state, action) => {
          state.isLoading = false;
          state.error = action.error;
        });
    },
  });
  
  export default userSlice.reducer;
  export const selectUser = (state) => state.user.user;
  export const selectIsUserLoading = (state) => state.user.isLoading;
  export const selectUserError = (state) => state.user.error;